import * as React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from "../../test/utils";
import { Dialog } from "./index";
import styles from "./Dialog.module.scss";

const overlayRecipeSource = readFileSync(
  resolve(process.cwd(), "src/recipes/_overlay.scss"),
  "utf8"
);

function renderDialog(props: Partial<React.ComponentProps<typeof Dialog>> = {}) {
  return render(
    <Dialog {...props}>
      <Dialog.Trigger>Open Dialog</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <Dialog.Description>Dialog description text</Dialog.Description>
          <p>Body content</p>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close render={<button type="button" />}>Cancel</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open dialog/i }));
    await waitFor(() => {
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    });
  });

  it("closes when close button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: /close dialog/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();
    });
  });

  it("close button has aria-label", async () => {
    renderDialog({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /close dialog/i })).toBeInTheDocument();
    });
  });

  it("renders title and description", async () => {
    renderDialog({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      expect(screen.getByText("Dialog description text")).toBeInTheDocument();
    });
  });

  it("forwards html props to trigger, title, description, and close", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <Dialog.Trigger id="dialog-trigger">Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title id="dialog-title">Dialog Title</Dialog.Title>
          <Dialog.Description id="dialog-description">Dialog Description</Dialog.Description>
          <Dialog.Close data-testid="dialog-close" />
        </Dialog.Content>
      </Dialog>
    );

    expect(screen.getByRole("button", { name: /open/i })).toHaveAttribute("id", "dialog-trigger");
    await user.click(screen.getByRole("button", { name: /open/i }));

    await waitFor(() => {
      expect(screen.getByText("Dialog Title")).toHaveAttribute("id", "dialog-title");
      expect(screen.getByText("Dialog Description")).toHaveAttribute("id", "dialog-description");
      expect(screen.getByTestId("dialog-close")).toBeInTheDocument();
    });
  });

  it("renders compound sub-components (Header, Body, Footer)", async () => {
    renderDialog({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Body content")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });
  });

  it("supports the width prop", async () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content width="lg">
          <Dialog.Title>Large Dialog</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("data-width", "lg");
    expect(dialog).toHaveClass(styles.lg);
  });

  it("is always modal: a scrim sits behind the sheet", async () => {
    renderDialog({ defaultOpen: true });

    await screen.findByRole("dialog");
    expect(document.querySelector(`.${styles.backdrop}`)).toBeInTheDocument();
  });

  it("moves focus to the element an initialFocus ref names", async () => {
    function WithRef() {
      const ref = React.useRef<HTMLInputElement>(null);
      return (
        <Dialog defaultOpen>
          <Dialog.Content initialFocus={ref}>
            <Dialog.Title>Rename</Dialog.Title>
            <button type="button">First</button>
            <input ref={ref} aria-label="Name" />
          </Dialog.Content>
        </Dialog>
      );
    }
    render(<WithRef />);

    await waitFor(() => expect(screen.getByLabelText("Name")).toHaveFocus());
  });

  it("renders a library control as the trigger through render", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <Dialog.Trigger render={<button type="button" data-testid="custom-trigger" />}>
          Rename
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Rename the branch</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );

    await user.click(screen.getByTestId("custom-trigger"));
    expect(await screen.findByText("Rename the branch")).toBeInTheDocument();
  });

  it("keeps a short body out of the tab order", async () => {
    renderDialog({ defaultOpen: true });

    const body = (await screen.findByText("Body content")).parentElement as HTMLElement;
    expect(body).toHaveClass(styles.body);
    expect(body).not.toHaveAttribute("tabindex");
    expect(body).not.toHaveAttribute("data-fui-overflowing");
  });

  it("marks a body that overflows, which draws the footer's scroll edge", async () => {
    // jsdom lays nothing out: the sheet body reports a scroll height past its client height.
    const overflowing = (element: HTMLElement) => element.classList.contains(styles.body);
    const scroll = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        return overflowing(this) ? 600 : 0;
      });
    const client = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        return overflowing(this) ? 300 : 0;
      });
    try {
      renderDialog({ defaultOpen: true });

      const body = (await screen.findByText("Body content")).parentElement as HTMLElement;
      expect(body).toHaveAttribute("data-fui-overflowing");
      expect(body).toHaveAttribute("tabindex", "0");
      const footer = screen.getByRole("button", { name: /cancel/i }).parentElement;
      expect(footer).toHaveClass(styles.footer);
      expect(body.nextElementSibling).toBe(footer);
    } finally {
      scroll.mockRestore();
      client.mockRestore();
    }
  });

  it("draws the footer's hairline only after an overflowing body, and fades it without motion", () => {
    const footer = overlayRecipeSource.slice(
      overlayRecipeSource.indexOf("@mixin footer"),
      overlayRecipeSource.indexOf("@mixin anchored-title")
    );

    // A border on a pseudo-element, hidden at rest: never a band, never a shadow.
    expect(footer).toMatch(
      /&::before\s*\{[^}]*border-block-start: var\(--fui-stroke-hairline, #\{tokens\.\$fui-stroke-hairline\}\) solid\s+var\(--fui-border, #\{tokens\.\$fui-border\}\);[^}]*opacity: 0;/s
    );
    expect(footer).toMatch(/\[data-fui-overflowing\] ~ &::before\s*\{\s*opacity: 1;\s*\}/);
    expect(footer).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*transition: none;/);
    expect(footer).not.toMatch(/box-shadow|background/);
  });

  it("has no accessibility violations when open", async () => {
    const { container } = renderDialog({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    });

    await expectNoA11yViolations(container, {
      // Base UI focus guard spans have role="button" without labels.
      disabledRules: ["aria-command-name"],
    });
  });

  describe("keyboard & focus", () => {
    it("returns focus to the external control that opened a controlled dialog", async () => {
      function ControlledDialog() {
        const [open, setOpen] = React.useState(false);

        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              Open externally
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
              <Dialog.Trigger>Reference trigger</Dialog.Trigger>
              <Dialog.Content>
                <Dialog.Title>Controlled dialog</Dialog.Title>
                <Dialog.Close>Close controlled dialog</Dialog.Close>
              </Dialog.Content>
            </Dialog>
          </>
        );
      }

      const user = userEvent.setup();
      render(<ControlledDialog />);

      const opener = screen.getByRole("button", { name: "Open externally" });
      await user.click(opener);
      await screen.findByRole("dialog");

      await user.click(screen.getByRole("button", { name: "Close controlled dialog" }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(opener).toHaveFocus();
      });
    });

    it("Escape closes dialog (WCAG 2.1.1)", async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();
      });
    });

    it("focus moves into dialog on open (WCAG 2.4.3)", async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole("button", { name: /open dialog/i }));

      await waitFor(() => {
        expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      });

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it("focus returns to trigger on Escape (WCAG 2.4.3)", async () => {
      const user = userEvent.setup();
      renderDialog();

      const trigger = screen.getByRole("button", { name: /open dialog/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });

    it("focus returns to trigger on Close button click (WCAG 2.4.3)", async () => {
      const user = userEvent.setup();
      renderDialog();

      const trigger = screen.getByRole("button", { name: /open dialog/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      });

      const closeButton = screen.getByRole("button", { name: /close dialog/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });

    it("Tab cycles within dialog (focus trap) (WCAG 2.1.2)", async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      });

      const dialog = screen.getByRole("dialog");
      const closeButton = screen.getByRole("button", { name: /close dialog/i });
      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      // Tab through focusable elements — focus should stay inside dialog
      await user.tab();
      await user.tab();
      await user.tab();

      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });

      // Verify that close and cancel buttons are reachable
      // Focus one of them directly and confirm containment
      closeButton.focus();
      expect(dialog.contains(document.activeElement)).toBe(true);

      cancelButton.focus();
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it("Shift+Tab cycles backward (WCAG 2.1.2)", async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      });

      const dialog = screen.getByRole("dialog");

      // Shift+Tab backward multiple times — focus should remain trapped
      await user.keyboard("{Shift>}{Tab}{/Shift}");
      await user.keyboard("{Shift>}{Tab}{/Shift}");
      await user.keyboard("{Shift>}{Tab}{/Shift}");

      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it('role="dialog" is present when open (WCAG 4.1.2)', async () => {
      renderDialog({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("Cancel button closes dialog and returns focus (WCAG 2.4.3)", async () => {
      const user = userEvent.setup();
      renderDialog();

      const trigger = screen.getByRole("button", { name: /open dialog/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });
  });
});
