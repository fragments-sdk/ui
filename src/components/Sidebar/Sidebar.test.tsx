import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { compiledModuleRules } from "../../test/compiled-css";
import { render, screen, userEvent, expectNoA11yViolations, waitFor } from "../../test/utils";
import { MEASUREMENT_PROFILES } from "../../measurements";
import { Badge } from "../Badge";
import { Theme } from "../Theme";
import { Sidebar, useSidebar } from "./index";
import sidebarMeta from "./Sidebar.meta.json";

const sidebarStyles = readFileSync(
  resolve(process.cwd(), "src/components/Sidebar/Sidebar.module.scss"),
  "utf8"
);

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

beforeEach(() => {
  mockMatchMedia(false);
});

function Icon() {
  return <svg aria-hidden="true" />;
}

function renderSidebar(props: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  return render(
    <Sidebar aria-label="Test sidebar" {...props}>
      <Sidebar.Header>Header Content</Sidebar.Header>
      <Sidebar.Nav aria-label="Main">
        <Sidebar.Section label="Section One">
          <Sidebar.Item icon={<Icon />}>Dashboard</Sidebar.Item>
          <Sidebar.Item icon={<Icon />} active>
            Settings
          </Sidebar.Item>
          <Sidebar.Item icon={<Icon />} disabled>
            Disabled
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
      <Sidebar.Footer>
        <Sidebar.CollapseToggle />
      </Sidebar.Footer>
    </Sidebar>
  );
}

describe("Sidebar", () => {
  it("renders the rail as a labelled aside with a nav landmark", () => {
    renderSidebar();
    const aside = document.querySelector("aside");
    expect(aside).toHaveAttribute("aria-label", "Test sidebar");
    expect(aside).toHaveAttribute("data-state", "expanded");
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByText("Header Content")).toBeInTheDocument();
  });

  it("scrolls the nav inside a ScrollArea with fades", () => {
    renderSidebar();
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav.querySelector('[data-orientation="vertical"]')).toBeInTheDocument();
  });

  it('marks the current item with aria-current="page" and data-active', () => {
    renderSidebar();
    const current = screen.getByText("Settings").closest("button");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveAttribute("data-active");
  });

  it("takes disabled rows out of the tab order", async () => {
    const onClick = vi.fn();
    render(
      <Sidebar>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item disabled onClick={onClick}>
              Disabled
            </Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    );
    const row = screen.getByText("Disabled").closest("button")!;
    expect(row).toHaveAttribute("tabindex", "-1");
    expect(row).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(row);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("marks a working row busy", () => {
    render(
      <Sidebar>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item working>Indexing</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    );
    const row = screen.getByText("Indexing").closest("button");
    expect(row).toHaveAttribute("aria-busy", "true");
    expect(row).toHaveAttribute("data-working");
  });

  it("wraps plain badge content in a neutral Badge and keeps explicit Badges", () => {
    render(
      <Sidebar>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item badge="3">Analytics</Sidebar.Item>
            <Sidebar.Item badge={<Badge tone="danger">New</Badge>}>Reports</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    );
    expect(screen.getByText("3").closest(".badge")?.parentElement).toHaveClass("itemBadge");
    expect(screen.getAllByText("New")).toHaveLength(1);
  });

  it("renders a link through href and a router link through render", async () => {
    const onClick = vi.fn();
    const RouterLink = React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(
      function RouterLink(props, ref) {
        return <a ref={ref} data-router="" {...props} />;
      }
    );
    render(
      <Sidebar>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item href="#home">Home</Sidebar.Item>
            <Sidebar.Item render={<RouterLink href="#settings" />} onClick={onClick} active>
              Settings
            </Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#home");
    const routed = screen.getByRole("link", { name: "Settings" });
    expect(routed).toHaveAttribute("data-router");
    expect(routed).toHaveAttribute("aria-current", "page");
    expect(routed).toHaveClass("item");
    await userEvent.click(routed);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("opens a submenu in place and passes the event to sub-items", async () => {
    const onSubClick = vi.fn();
    render(
      <Sidebar>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item hasSubmenu>Projects</Sidebar.Item>
            <Sidebar.Submenu>
              <Sidebar.SubItem onClick={onSubClick}>Alpha</Sidebar.SubItem>
            </Sidebar.Submenu>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    );
    const parent = screen.getByRole("button", { name: "Projects" });
    expect(parent).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(parent);
    expect(parent).toHaveAttribute("aria-expanded", "true");
    expect(parent.closest("li")).toHaveAttribute("data-expanded");
    await userEvent.click(screen.getByRole("button", { name: "Alpha" }));
    expect(onSubClick).toHaveBeenCalledWith(expect.objectContaining({ type: "click" }));
  });

  it("opens and closes a collapsible section instantly", async () => {
    render(
      <Sidebar>
        <Sidebar.Nav>
          <Sidebar.Section label="Projects" collapsible>
            <Sidebar.Item>Alpha</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    );
    const trigger = screen.getByRole("button", { name: "Projects" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(trigger.getAttribute("aria-controls")!)).toHaveAttribute(
      "hidden"
    );
  });

  it("collapses to glyphs, keeps labels for assistive tech and shows the toggle", async () => {
    const onCollapsedChange = vi.fn();
    renderSidebar({ onCollapsedChange });
    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(toggle);
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    const aside = document.querySelector("aside")!;
    expect(aside).toHaveAttribute("data-state", "collapsed");
    expect(screen.getByText("Dashboard")).toHaveClass("itemLabelHidden");
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.queryByText("Section One")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
  });

  it("hides the rail when offcanvas collapsed or collapsed with no glyphs", () => {
    const { unmount } = render(
      <Sidebar collapsible="offcanvas" defaultCollapsed>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon={<Icon />}>Home</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    );
    expect(document.querySelector("aside")).toHaveAttribute("data-hidden");
    unmount();

    render(
      <Sidebar defaultCollapsed>
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item>Home</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    );
    expect(document.querySelector("aside")).toHaveAttribute("data-hidden");
  });

  it("keeps the collapsed rail when the glyph rows sit inside an app's own component", () => {
    function Nav() {
      return (
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon={<Icon />}>Home</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      );
    }
    render(
      <Sidebar defaultCollapsed>
        <Nav />
      </Sidebar>
    );
    expect(document.querySelector("aside")).not.toHaveAttribute("data-hidden");
    expect(screen.getByRole("button", { name: "Home" })).toBeVisible();
  });

  it("never collapses with collapsible none", () => {
    renderSidebar({ collapsible: "none", defaultCollapsed: true });
    expect(document.querySelector("aside")).toHaveAttribute("data-state", "expanded");
    expect(screen.queryByRole("button", { name: /collapse sidebar/i })).not.toBeInTheDocument();
  });

  it("lets the provider own the state and warns about state props on the rail", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    function State() {
      const { state } = useSidebar();
      return <output>{state}</output>;
    }
    render(
      <Sidebar.Provider defaultCollapsed>
        <Sidebar defaultCollapsed={false}>
          <Sidebar.Nav>
            <Sidebar.Section>
              <Sidebar.Item icon={<Icon />}>Home</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Nav>
        </Sidebar>
        <State />
      </Sidebar.Provider>
    );
    expect(screen.getByRole("status")).toHaveTextContent("collapsed");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("defaultCollapsed"));
    warn.mockRestore();
  });

  it("returns inert defaults outside a sidebar so rows work in any panel", () => {
    function State() {
      const { state, isMobile } = useSidebar();
      return <output>{`${state}:${isMobile}`}</output>;
    }
    render(
      <>
        <ul>
          <Sidebar.Item active>Inbox</Sidebar.Item>
        </ul>
        <State />
      </>
    );
    expect(screen.getByRole("button", { name: "Inbox" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("status")).toHaveTextContent("expanded:false");
  });

  it("opens as a modal panel below md and closes on Escape", async () => {
    mockMatchMedia(true);
    const onOpenChange = vi.fn();
    function Opener() {
      const { setOpen } = useSidebar();
      return (
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
      );
    }
    render(
      <Sidebar.Provider onOpenChange={onOpenChange}>
        <Opener />
        <Sidebar aria-label="Workspace">
          <Sidebar.Nav>
            <Sidebar.Section>
              <Sidebar.Item>Home</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Nav>
          <Sidebar.Footer>
            <Sidebar.CollapseToggle />
          </Sidebar.Footer>
        </Sidebar>
      </Sidebar.Provider>
    );
    expect(document.querySelector("aside")).toBeNull();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog", { name: "Workspace" });
    expect(dialog).toHaveClass("panel");
    expect(screen.queryByRole("button", { name: /collapse sidebar/i })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false));
  });

  it("gives the modal panel a visible close that closes it", async () => {
    mockMatchMedia(true);
    const onOpenChange = vi.fn();
    render(
      <Sidebar.Provider defaultOpen onOpenChange={onOpenChange}>
        <Sidebar aria-label="Workspace">
          <Sidebar.Nav>
            <Sidebar.Section>
              <Sidebar.Item>Home</Sidebar.Item>
            </Sidebar.Section>
          </Sidebar.Nav>
        </Sidebar>
      </Sidebar.Provider>
    );
    const dialog = await screen.findByRole("dialog", { name: "Workspace" });
    const close = screen.getByRole("button", { name: "Close navigation" });
    expect(dialog.contains(close)).toBe(true);
    await userEvent.click(close);
    await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false));
  });

  it("opens the modal panel inside the nearest nested Theme scope", async () => {
    mockMatchMedia(true);
    const { container } = render(
      <Theme mode="light">
        <Theme mode="dark" brand="#16a34a">
          <Sidebar.Provider defaultOpen>
            <Sidebar aria-label="Workspace">
              <Sidebar.Nav>
                <Sidebar.Section>
                  <Sidebar.Item>Home</Sidebar.Item>
                </Sidebar.Section>
              </Sidebar.Nav>
            </Sidebar>
          </Sidebar.Provider>
        </Theme>
      </Theme>
    );
    const dialog = await screen.findByRole("dialog", { name: "Workspace" });
    expect(container.contains(dialog)).toBe(false);
    const scope = dialog.closest<HTMLElement>("[data-fui-theme]");
    expect(scope).toHaveAttribute("data-theme", "dark");
    expect(scope?.style.getPropertyValue("--fui-seed-brand")).toBe("#16a34a");
  });

  it("shows only the collapsed content in a collapsed rail's header, never clipped words", async () => {
    const { rerender } = render(
      <Sidebar aria-label="Workspace" defaultCollapsed>
        <Sidebar.Header>Fragments</Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Item icon={<Icon />}>Home</Sidebar.Item>
        </Sidebar.Nav>
      </Sidebar>
    );
    expect(screen.queryByText("Fragments")).not.toBeInTheDocument();
    rerender(
      <Sidebar aria-label="Workspace" defaultCollapsed>
        <Sidebar.Header collapsedContent={<span>F</span>}>Fragments</Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Item icon={<Icon />}>Home</Sidebar.Item>
        </Sidebar.Nav>
      </Sidebar>
    );
    expect(screen.getByText("F")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderSidebar();
    await expectNoA11yViolations(container);
  });

  describe("styles", () => {
    let compiledRules: CSSStyleRule[] | undefined;

    function compiledValues(selector: string, property: string): string[] {
      if (!compiledRules) {
        compiledRules = compiledModuleRules("src/components/Sidebar/Sidebar.module.scss").filter(
          (rule): rule is CSSStyleRule => rule.type === CSSRule.STYLE_RULE
        );
      }
      return compiledRules
        .filter((rule) => rule.selectorText.split(/,\s*/).includes(selector))
        .map((rule) => rule.style.getPropertyValue(property))
        .filter(Boolean);
    }

    const md = MEASUREMENT_PROFILES.targets.controlTrack.md;

    it("claims the target size the rows actually have", () => {
      const accessibility = sidebarMeta.usage.accessibility;
      expect(accessibility.some((line) => line.includes(`at least ${md} tall`))).toBe(true);
      expect(accessibility.some((line) => /coarse pointer.*44px/.test(line))).toBe(true);
    });

    it("draws rows on the md track with the hit-area floor", () => {
      expect(md).toBe("32px");
      for (const selector of [".item", ".subItem"]) {
        expect(compiledValues(selector, "--fui-navigation-row-track")).toContain(
          `var(--fui-control-height-md, ${md})`
        );
        expect(compiledValues(selector, "min-block-size")).toContain(
          `max(var(--fui-navigation-row-track, ${md}), var(--fui-hit-area, 24px))`
        );
      }
      expect(compiledValues(".sectionAction::after", "block-size")).toContain(
        `max(100%, var(--fui-control-height-md, ${md}), var(--fui-hit-area, 24px))`
      );
      // The collapsible section label reaches the 24 pointer floor.
      expect(compiledValues(".sectionTrigger::after", "block-size")).toContain(
        "max(100%, var(--fui-control-height-xs, 24px), var(--fui-hit-area, 24px))"
      );
    });

    it("puts the rail on the canvas with one opaque hairline and no motion", () => {
      expect(compiledValues(".root", "background-color").join(" ")).toContain(
        "--fui-app-canvas-bg"
      );
      expect(sidebarStyles).toContain("border-inline-end: $_line;");
      expect(sidebarStyles).not.toMatch(/transition:\s*(width|grid-template)/);
      expect(sidebarStyles).not.toMatch(/box-shadow:\s*var\(--fui-shadow/);
      expect(sidebarStyles).not.toContain("color-mix(");
      expect(sidebarStyles).not.toContain("--fui-color-accent");
      expect(sidebarStyles).not.toMatch(/text-transform:\s*uppercase/);
      expect(sidebarStyles).not.toMatch(/\b(left|right):|margin-left|text-align:\s*left/);
    });

    it("marks the current row with the selection wash and ring at the regular weight", () => {
      const current = compiledValues(".item[data-active]", "box-shadow");
      expect(current.join(" ")).toContain("--fui-sidebar-item-active-border");
      expect(compiledValues(".item", "font-weight").join(" ")).toContain(
        "--fui-font-weight-normal"
      );
    });
  });
});
