import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { act, render, screen, userEvent, waitFor, expectNoA11yViolations } from "../../test/utils";
import { Drawer } from "./index";

function renderDrawer(
  props: Partial<React.ComponentProps<typeof Drawer>> = {},
  contentProps: Partial<React.ComponentProps<typeof Drawer.Content>> = {}
) {
  return render(
    <Drawer {...props}>
      <Drawer.Trigger>Open Drawer</Drawer.Trigger>
      <Drawer.Content {...contentProps}>
        <Drawer.Header>
          <Drawer.Title>Drawer Title</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <Drawer.Description>Drawer description text</Drawer.Description>
          <p>Body content</p>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <button>Cancel</button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}

type SwipeDirection = NonNullable<React.ComponentProps<typeof Drawer>["swipeDirection"]>;

const DRAWER_SIDE_CASES = [
  ["right", "right"],
  ["left", "left"],
  ["top", "up"],
  ["bottom", "down"],
] as const;

const SWIPE_RELEASE_POSITION: Record<SwipeDirection, { clientX: number; clientY: number }> = {
  left: { clientX: -100, clientY: 0 },
  right: { clientX: 100, clientY: 0 },
  up: { clientX: 0, clientY: -100 },
  down: { clientX: 0, clientY: 100 },
};

async function commitPrimaryButtonSwipe(
  viewport: HTMLElement,
  popup: HTMLElement,
  direction: SwipeDirection
) {
  Object.defineProperties(popup, {
    offsetHeight: { configurable: true, value: 100 },
    offsetWidth: { configurable: true, value: 100 },
  });

  const elementFromPointDescriptor = Object.getOwnPropertyDescriptor(document, "elementFromPoint");
  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: () => popup,
  });

  const releasePosition = SWIPE_RELEASE_POSITION[direction];

  try {
    fireEvent.pointerDown(viewport, {
      button: 0,
      buttons: 1,
      pointerId: 1,
      clientX: 0,
      clientY: 0,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(viewport, {
      buttons: 1,
      pointerId: 1,
      clientX: 0,
      clientY: 0,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(viewport, {
      buttons: 1,
      pointerId: 1,
      ...releasePosition,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(viewport, {
      buttons: 0,
      pointerId: 1,
      ...releasePosition,
      pointerType: "mouse",
    });

    await act(async () => {
      await Promise.resolve();
    });
  } finally {
    if (elementFromPointDescriptor) {
      Object.defineProperty(document, "elementFromPoint", elementFromPointDescriptor);
    } else {
      delete (document as Document & { elementFromPoint?: Document["elementFromPoint"] })
        .elementFromPoint;
    }
  }
}

describe("Drawer", () => {
  it("opens when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDrawer();

    expect(screen.queryByText("Drawer Title")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open drawer/i }));
    await waitFor(() => {
      expect(screen.getByText("Drawer Title")).toBeInTheDocument();
    });
  });

  it("closes when close button is clicked", async () => {
    const user = userEvent.setup();
    renderDrawer({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Drawer Title")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: /close drawer/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Drawer Title")).not.toBeInTheDocument();
    });
  });

  it("renders title and description", async () => {
    renderDrawer({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Drawer Title")).toBeInTheDocument();
      expect(screen.getByText("Drawer description text")).toBeInTheDocument();
    });
  });

  it("forwards html props to trigger, title, description, and close", async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger id="drawer-trigger">Open</Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title id="drawer-title">Drawer Title</Drawer.Title>
            <Drawer.Close data-testid="drawer-close" />
          </Drawer.Header>
          <Drawer.Body>
            <Drawer.Description id="drawer-description">Drawer Description</Drawer.Description>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    expect(screen.getByRole("button", { name: /open/i })).toHaveAttribute("id", "drawer-trigger");
    await user.click(screen.getByRole("button", { name: /open/i }));

    await waitFor(() => {
      expect(screen.getByText("Drawer Title")).toHaveAttribute("id", "drawer-title");
      expect(screen.getByText("Drawer Description")).toHaveAttribute("id", "drawer-description");
      expect(screen.getByTestId("drawer-close")).toBeInTheDocument();
    });
  });

  it("renders compound sub-components (Header, Body, Footer)", async () => {
    renderDrawer({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Body content")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });
  });

  it("defaults the content side and swipe direction to right", async () => {
    renderDrawer({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "right");
      expect(screen.getByRole("dialog")).toHaveAttribute("data-swipe-direction", "right");
    });
  });

  it.each(DRAWER_SIDE_CASES)(
    "derives a %s drawer's %s swipe dismissal from Drawer.Content",
    async (side, expectedDirection) => {
      const onOpenChange = vi.fn();
      renderDrawer(
        { defaultOpen: true, onOpenChange },
        {
          side,
          viewportProps: { "data-testid": "swipe-viewport" },
        }
      );

      const viewport = await screen.findByTestId("swipe-viewport");
      const popup = screen.getByRole("dialog");
      await waitFor(() => {
        expect(popup).toHaveAttribute("data-side", side);
        expect(popup).toHaveAttribute("data-swipe-direction", expectedDirection);
      });

      await commitPrimaryButtonSwipe(viewport, popup, expectedDirection);

      expect(onOpenChange).toHaveBeenCalled();
      expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
    }
  );

  it("lets an explicit swipeDirection override Drawer.Content side", async () => {
    const onOpenChange = vi.fn();
    renderDrawer(
      {
        defaultOpen: true,
        swipeDirection: "left",
        onOpenChange,
      },
      {
        side: "bottom",
        viewportProps: { "data-testid": "swipe-viewport" },
      }
    );

    const viewport = await screen.findByTestId("swipe-viewport");
    const popup = screen.getByRole("dialog");
    await waitFor(() => {
      expect(popup).toHaveAttribute("data-side", "bottom");
      expect(popup).toHaveAttribute("data-swipe-direction", "left");
    });

    await commitPrimaryButtonSwipe(viewport, popup, "left");

    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
  });

  it("supports size prop", async () => {
    renderDrawer({ defaultOpen: true }, { size: "lg" });

    await waitFor(() => {
      expect(screen.getByText("Drawer Title")).toBeInTheDocument();
    });
  });

  it("accepts Drawer.Content initialFocus prop", async () => {
    renderDrawer({ defaultOpen: true }, { initialFocus: false });

    await waitFor(() => {
      expect(screen.getByText("Drawer Title")).toBeInTheDocument();
    });
  });

  it("forwards props to the Base UI viewport", async () => {
    renderDrawer(
      { defaultOpen: true },
      {
        viewportProps: {
          "data-testid": "drawer-viewport",
          style: { paddingTop: 12 },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByTestId("drawer-viewport")).toHaveStyle({
        paddingTop: "12px",
      });
    });
  });

  it("has no accessibility violations when open", async () => {
    const { container } = renderDrawer({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Drawer Title")).toBeInTheDocument();
    });

    await expectNoA11yViolations(container, {
      // Base UI focus guard spans have role="button" without labels.
      disabledRules: ["aria-command-name"],
    });
  });

  describe("keyboard & focus", () => {
    it("Escape closes drawer", async () => {
      const user = userEvent.setup();
      renderDrawer({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByText("Drawer Title")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByText("Drawer Title")).not.toBeInTheDocument();
      });
    });

    it("focus moves into drawer on open", async () => {
      const user = userEvent.setup();
      renderDrawer();

      await user.click(screen.getByRole("button", { name: /open drawer/i }));

      await waitFor(() => {
        expect(screen.getByText("Drawer Title")).toBeInTheDocument();
      });

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it("focus returns to trigger on close", async () => {
      const user = userEvent.setup();
      renderDrawer();

      const trigger = screen.getByRole("button", { name: /open drawer/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Drawer Title")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByText("Drawer Title")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });

    it("Tab cycles within drawer (focus trap)", async () => {
      const user = userEvent.setup();
      renderDrawer({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByText("Drawer Title")).toBeInTheDocument();
      });

      const dialog = screen.getByRole("dialog");

      // Tab through focusable elements — focus should stay inside drawer
      await user.tab();
      await user.tab();
      await user.tab();

      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it("Shift+Tab cycles backward", async () => {
      const user = userEvent.setup();
      renderDrawer({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByText("Drawer Title")).toBeInTheDocument();
      });

      const dialog = screen.getByRole("dialog");

      await user.keyboard("{Shift>}{Tab}{/Shift}");
      await user.keyboard("{Shift>}{Tab}{/Shift}");
      await user.keyboard("{Shift>}{Tab}{/Shift}");

      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it('role="dialog" is present when open', async () => {
      renderDrawer({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("backdrop click closes drawer", async () => {
      const user = userEvent.setup();
      renderDrawer({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByText("Drawer Title")).toBeInTheDocument();
      });

      // Click the backdrop (outside the drawer content)
      const backdrop = document.querySelector("[data-open]");
      if (backdrop) {
        await user.click(backdrop as HTMLElement);
      }

      await waitFor(() => {
        expect(screen.queryByText("Drawer Title")).not.toBeInTheDocument();
      });
    });
  });
});
