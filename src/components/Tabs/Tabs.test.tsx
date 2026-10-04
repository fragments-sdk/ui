import { resolve } from "node:path";

import * as React from "react";
import * as sass from "sass";
import { describe, it, expect, vi } from "vitest";
import { act, render, screen, userEvent, waitFor, expectNoA11yViolations } from "../../test/utils";
import { ComponentDefaultsProvider } from "../ComponentDefaults";
import { Tabs, type TabsChangeEventDetails } from "./index";

function renderTabs(
  props: Partial<React.ComponentProps<typeof Tabs>> & { "data-testid"?: string } = {}
) {
  return render(
    <Tabs defaultValue="tab1" {...props}>
      <Tabs.List>
        <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
        <Tabs.Tab value="tab2">Tab Two</Tabs.Tab>
        <Tabs.Tab value="tab3" disabled>
          Tab Three
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tab1">Panel One Content</Tabs.Panel>
      <Tabs.Panel value="tab2">Panel Two Content</Tabs.Panel>
      <Tabs.Panel value="tab3">Panel Three Content</Tabs.Panel>
    </Tabs>
  );
}

const flatStyles = sass
  .compile(resolve(process.cwd(), "src/components/Tabs/Tabs.module.scss"), { style: "expanded" })
  .css.replace(/\s+/g, " ");

describe("Tabs", () => {
  it("keeps every focus ring inside the scrolling row", () => {
    const reach = "calc(var(--fui-focus-ring-width, 2px) + var(--fui-focus-ring-offset, 2px))";
    // Ghost: the row pads by the ring's reach and pulls back by the same.
    expect(flatStyles).toContain(
      `.listGhost { gap: var(--fui-raw-space-16, 16px); padding: ${reach};`
    );
    expect(flatStyles).toContain(`margin: calc(-1 * ${reach});`);
    expect(flatStyles).toMatch(
      /\.indicator \{[^}]*inset-block-end: calc\(var\(--fui-focus-ring-width/
    );
    // Soft: the segment draws its ring inside the edge.
    expect(flatStyles).toMatch(
      /\.listSoft \.tabSoft:focus-visible \{[^}]*outline-offset: calc\(-1 \* var\(--fui-focus-ring-offset/
    );
  });

  it("grows the ghost hit area in the block axis only, so short names never overflow", () => {
    expect(flatStyles).toMatch(/\.tabGhost \{[^}]*min-inline-size: var\(--fui-hit-area, 24px\);/);
    expect(flatStyles).toMatch(/\.tabGhost::after \{[^}]*inline-size: 100%;/);
  });

  it("renders tablist and tab roles", () => {
    renderTabs();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("exposes stable styling slots and the root variant", () => {
    renderTabs({ variant: "soft", "data-testid": "tabs-example" });

    expect(screen.getByTestId("tabs-example")).toHaveAttribute("data-slot", "tabs");
    expect(screen.getByRole("tablist")).toHaveAttribute("data-slot", "tabs-list");
    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "soft");
    expect(screen.getAllByRole("tab")[0]).toHaveAttribute("data-slot", "tabs-tab");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("data-slot", "tabs-panel");
  });

  it("renders tabpanel role for active panel", () => {
    renderTabs();
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
    expect(screen.getByText("Panel One Content")).toBeInTheDocument();
  });

  it("switches panel on tab click", async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole("tab", { name: /tab two/i }));
    expect(screen.getByText("Panel Two Content")).toBeInTheDocument();
  });

  it("marks active tab with aria-selected", async () => {
    const user = userEvent.setup();
    renderTabs();

    const tabOne = screen.getByRole("tab", { name: /tab one/i });
    const tabTwo = screen.getByRole("tab", { name: /tab two/i });

    expect(tabOne).toHaveAttribute("aria-selected", "true");
    expect(tabTwo).toHaveAttribute("aria-selected", "false");

    await user.click(tabTwo);
    expect(tabTwo).toHaveAttribute("aria-selected", "true");
    expect(tabOne).toHaveAttribute("aria-selected", "false");
  });

  it("disables a tab when disabled prop is set", () => {
    renderTabs();
    const disabledTab = screen.getByRole("tab", { name: /tab three/i });
    // Base UI uses aria-disabled instead of the HTML disabled attribute
    expect(disabledTab).toHaveAttribute("aria-disabled", "true");
  });

  it("supports controlled value prop", async () => {
    const onValueChange = vi.fn();
    render(
      <Tabs value="tab1" onValueChange={onValueChange}>
        <Tabs.List>
          <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
          <Tabs.Tab value="tab2">Tab Two</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab1">Panel One</Tabs.Panel>
        <Tabs.Panel value="tab2">Panel Two</Tabs.Panel>
      </Tabs>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: /tab two/i }));
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls[0][0]).toBe("tab2");
  });

  it("does not move an uncontrolled selection when the change is canceled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn((_value: string, details: TabsChangeEventDetails) => {
      details.cancel();
    });

    render(
      <Tabs defaultValue="tab1" onValueChange={onValueChange}>
        <Tabs.List>
          <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
          <Tabs.Tab value="tab2">Tab Two</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab1">Panel One</Tabs.Panel>
        <Tabs.Panel value="tab2">Panel Two</Tabs.Panel>
      </Tabs>
    );

    const tabOne = screen.getByRole("tab", { name: /tab one/i });
    const tabTwo = screen.getByRole("tab", { name: /tab two/i });
    await user.click(tabTwo);

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(tabOne).toHaveAttribute("aria-selected", "true");
    expect(tabTwo).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("Panel One")).toBeInTheDocument();
    expect(screen.queryByText("Panel Two")).not.toBeInTheDocument();
  });

  it("keeps a suspending panel selected until it resolves", async () => {
    let resolvePanel: ((value: string) => void) | undefined;
    const panelPromise = new Promise<string>((resolve) => {
      resolvePanel = resolve;
    });

    function SuspendingPanel() {
      return <div>{React.use(panelPromise)}</div>;
    }

    const onValueChange = vi.fn();
    render(
      <React.Suspense fallback={<div>Loading panel</div>}>
        <Tabs defaultValue="tab1" onValueChange={onValueChange}>
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
            <Tabs.Tab value="tab2">Tab Two</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">Panel One</Tabs.Panel>
          <Tabs.Panel value="tab2">
            <SuspendingPanel />
          </Tabs.Panel>
        </Tabs>
      </React.Suspense>
    );

    const tabTwo = screen.getByRole("tab", { name: /tab two/i });
    await act(async () => {
      tabTwo.click();
    });

    expect(await screen.findByText("Loading panel")).toBeInTheDocument();

    await act(async () => {
      resolvePanel?.("Panel Two");
      await panelPromise;
    });

    expect(await screen.findByText("Panel Two")).toBeInTheDocument();
    expect(tabTwo).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]).toBe("tab2");
  });

  it("reports automatic initial selection when defaultValue is omitted", async () => {
    const onValueChange = vi.fn();
    render(
      <Tabs onValueChange={onValueChange}>
        <Tabs.List>
          <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
          <Tabs.Tab value="tab2">Tab Two</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab1">Panel One</Tabs.Panel>
        <Tabs.Panel value="tab2">Panel Two</Tabs.Panel>
      </Tabs>
    );

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalled();
    });
    expect(onValueChange.mock.calls[0][0]).toBe("tab1");
    expect(onValueChange.mock.calls[0][1]?.reason).toBe("initial");
  });

  it("lands a larger provider default on the md step", () => {
    render(
      <ComponentDefaultsProvider controlSize="lg">
        <Tabs defaultValue="tab1">
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">Panel One</Tabs.Panel>
        </Tabs>
      </ComponentDefaultsProvider>
    );

    expect(screen.getByRole("tab", { name: /tab one/i })).toHaveClass("tabMd");
    expect(screen.getByRole("tablist")).toHaveAttribute("data-size", "md");
  });

  it("keeps explicit size over the provider control size", () => {
    render(
      <ComponentDefaultsProvider controlSize="lg">
        <Tabs defaultValue="tab1" size="sm">
          <Tabs.List>
            <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tab1">Panel One</Tabs.Panel>
        </Tabs>
      </ComponentDefaultsProvider>
    );

    const tab = screen.getByRole("tab", { name: /tab one/i });
    expect(tab).toHaveClass("tabSm");
    expect(tab).not.toHaveClass("tabMd");
  });

  it("draws the underline indicator only in the ghost row", () => {
    const { container, rerender } = render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    );
    expect(container.querySelector(".indicator")).toBeInTheDocument();

    rerender(
      <Tabs defaultValue="tab1" variant="soft">
        <Tabs.List>
          <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    );
    expect(container.querySelector(".indicator")).not.toBeInTheDocument();
    expect(screen.getByRole("tablist")).toHaveClass("listSoft");
  });

  it("forwards HTML props, data attributes and refs to the tab", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Tab
            ref={ref}
            value="tab1"
            id="layers-tab"
            data-tip="Every layer"
            aria-describedby="hint"
          >
            Layers
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
    );

    const tab = screen.getByRole("tab", { name: /layers/i });
    expect(tab).toHaveAttribute("id", "layers-tab");
    expect(tab).toHaveAttribute("data-tip", "Every layer");
    expect(tab).toHaveAttribute("aria-describedby", "hint");
    expect(ref.current).toBe(tab);
  });

  it("draws a quieter count and a dot whose words reach screen readers", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Tab value="tab1" count={12}>
            Findings
          </Tabs.Tab>
          <Tabs.Tab value="tab2" dot="New activity">
            Pages
          </Tabs.Tab>
          <Tabs.Tab value="tab3" dot>
            Changes
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
    );

    const findings = screen.getByRole("tab", { name: "Findings 12" });
    expect(findings.querySelector('[data-slot="tabs-count"]')).toHaveTextContent("12");
    expect(screen.getByRole("tab", { name: "Pages New activity" })).toBeInTheDocument();
    const changes = screen.getByRole("tab", { name: "Changes" });
    expect(changes.querySelector('[data-slot="tabs-dot"]')).toHaveAttribute("aria-hidden", "true");
  });

  it("reports a second press on the open tab through onReselect", async () => {
    const user = userEvent.setup();
    const onReselect = vi.fn();
    renderTabs({ onReselect });

    await user.click(screen.getByRole("tab", { name: /tab two/i }));
    expect(onReselect).not.toHaveBeenCalled();

    await user.click(screen.getByRole("tab", { name: /tab two/i }));
    expect(onReselect).toHaveBeenCalledTimes(1);
    expect(onReselect).toHaveBeenCalledWith("tab2");
  });

  it("keeps actions outside the tablist and its arrow keys", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List aria-label="Panel" actions={<button type="button">Filter</button>}>
          <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    );

    const action = screen.getByRole("button", { name: "Filter" });
    expect(screen.getByRole("tablist")).not.toContainElement(action);
    expect(action.closest('[data-slot="tabs-actions"]')).toBeInTheDocument();
  });

  it("opens the tab an arrow key reaches with activateOnFocus", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List activateOnFocus>
          <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
          <Tabs.Tab value="tab2">Tab Two</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab1">Panel One</Tabs.Panel>
        <Tabs.Panel value="tab2">Panel Two</Tabs.Panel>
      </Tabs>
    );

    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /tab two/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Panel Two")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderTabs();
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: /tab one/i })).toHaveAttribute("aria-selected", "true")
    );
    await expectNoA11yViolations(container);
  });

  describe("keyboard & focus", () => {
    it("ArrowRight moves focus to the next tab", async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.tab(); // focus enters the tablist on the active tab
      expect(screen.getByRole("tab", { name: /tab one/i })).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("tab", { name: /tab two/i })).toHaveFocus();
    });

    it("ArrowLeft moves focus to the previous tab", async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: "tab2" });

      await user.tab();
      expect(screen.getByRole("tab", { name: /tab two/i })).toHaveFocus();

      await user.keyboard("{ArrowLeft}");
      expect(screen.getByRole("tab", { name: /tab one/i })).toHaveFocus();
    });

    it("disabled tab receives focus but cannot be activated", async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: "tab2" });

      await user.tab();
      await user.keyboard("{ArrowRight}"); // moves to disabled Tab Three
      expect(screen.getByRole("tab", { name: /tab three/i })).toHaveFocus();
      // Pressing Enter/Space on a disabled tab should not activate it
      await user.keyboard("{Enter}");
      expect(screen.getByRole("tab", { name: /tab three/i })).toHaveAttribute(
        "aria-selected",
        "false"
      );
    });

    it("wraps from last tab to first", async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.tab();
      // Navigate: Tab One -> Tab Two -> Tab Three -> wraps to Tab One
      await user.keyboard("{ArrowRight}");
      await user.keyboard("{ArrowRight}");
      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("tab", { name: /tab one/i })).toHaveFocus();
    });

    it("Home key moves focus to the first tab", async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: "tab2" });

      await user.tab();
      await user.keyboard("{Home}");
      expect(screen.getByRole("tab", { name: /tab one/i })).toHaveFocus();
    });

    it("End key moves focus to the last tab", async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.tab();
      await user.keyboard("{End}");
      expect(screen.getByRole("tab", { name: /tab three/i })).toHaveFocus();
    });
  });
});
