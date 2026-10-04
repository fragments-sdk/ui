import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Header } from "../Header";
import { Main } from "../Main";
import { Sidebar, useSidebar } from "../Sidebar";
import { AppShell } from "./index";

const shellStyles = readFileSync(
  resolve(process.cwd(), "src/components/AppShell/AppShell.module.scss"),
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

function Glyph() {
  return <svg aria-hidden="true" />;
}

function renderShell(props: Partial<React.ComponentProps<typeof AppShell>> = {}) {
  return render(
    <AppShell data-testid="shell" {...props}>
      <AppShell.Header>
        <Header>
          <Header.SkipLink />
          <Header.Trigger />
          <Header.Brand>Fragments</Header.Brand>
        </Header>
      </AppShell.Header>
      <AppShell.Sidebar aria-label="Workspace">
        <Sidebar.Nav>
          <Sidebar.Section>
            <Sidebar.Item icon={<Glyph />} active>
              Overview
            </Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </AppShell.Sidebar>
      <AppShell.Main data-testid="main-slot">
        <Main>
          <Main.Header>
            <Main.Title>Overview</Main.Title>
          </Main.Header>
        </Main>
      </AppShell.Main>
      <AppShell.Aside aria-label="Details">Details</AppShell.Aside>
    </AppShell>
  );
}

describe("AppShell", () => {
  it("renders one banner, one main, the sidebar and the aside", () => {
    renderShell();
    // A <header> inside <main> is not a banner; the test DOM does not scope roles, so count by hand.
    const banners = [...document.querySelectorAll("header")].filter((el) => !el.closest("main"));
    expect(banners).toHaveLength(1);
    expect(banners[0]!.querySelector("header")).toBeNull();
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("complementary", { name: "Workspace" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Details" })).toBeInTheDocument();
  });

  it("keeps the main slot a plain scroll region with no padding class", () => {
    renderShell();
    const slot = screen.getByTestId("main-slot");
    expect(slot.tagName).toBe("DIV");
    expect(slot.className).toMatch(/main/);
    expect(slot.className).not.toMatch(/padding|floating/i);
  });

  it("sets data-layout and the sidebar state on the root", async () => {
    const user = userEvent.setup();
    renderShell({ layout: "sidebar" });
    const shell = screen.getByTestId("shell");
    expect(shell).toHaveAttribute("data-layout", "sidebar");
    expect(shell).toHaveAttribute("data-sidebar-state", "expanded");
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(shell).toHaveAttribute("data-sidebar-state", "collapsed");
  });

  it("holds the sidebar state: defaultCollapsed and onCollapsedChange", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    renderShell({ defaultCollapsed: true, onCollapsedChange });
    expect(document.querySelector("aside[data-state]")).toHaveAttribute("data-state", "collapsed");
    await user.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it("shows Header.Trigger for an offcanvas rail and hides it when the rail is back", async () => {
    const user = userEvent.setup();
    renderShell({ collapsible: "offcanvas", defaultCollapsed: true });
    await user.click(screen.getByRole("button", { name: "Toggle navigation" }));
    expect(document.querySelector("aside[data-state]")).toHaveAttribute("data-state", "expanded");
    // Back in view, the rail hides the trigger from md up through CSS.
    expect(screen.getByRole("button", { name: "Toggle navigation" })).toHaveClass("triggerBelowMd");
  });

  it("uses a Sidebar.Provider above it and warns about its own state props", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    function State() {
      return <span data-testid="state">{useSidebar().state}</span>;
    }
    render(
      <Sidebar.Provider defaultCollapsed>
        <State />
        <AppShell defaultCollapsed={false}>
          <AppShell.Main>Content</AppShell.Main>
        </AppShell>
      </Sidebar.Provider>
    );
    expect(screen.getByTestId("state")).toHaveTextContent("collapsed");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("AppShell: defaultCollapsed"));
    warn.mockRestore();
  });

  it("hides the aside when visible is false", () => {
    render(
      <AppShell>
        <AppShell.Main>Content</AppShell.Main>
        <AppShell.Aside visible={false}>Details</AppShell.Aside>
      </AppShell>
    );
    expect(screen.queryByText("Details")).not.toBeInTheDocument();
  });

  it("forwards props to slots", () => {
    render(
      <AppShell className="custom-shell" data-testid="shell">
        <AppShell.Header data-testid="header" className="custom-header">
          Bar
        </AppShell.Header>
        <AppShell.Main>Content</AppShell.Main>
      </AppShell>
    );
    expect(screen.getByTestId("shell").className).toContain("custom-shell");
    const header = screen.getByTestId("header");
    expect(header.tagName).toBe("HEADER");
    expect(header.className).toContain("custom-header");
  });

  it("has no accessibility violations", async () => {
    const { container } = renderShell();
    await expectNoA11yViolations(container);
  });
});

describe("AppShell styles", () => {
  it("never animates the grid and sizes columns from the slots", () => {
    expect(shellStyles).not.toMatch(/transition/);
    expect(shellStyles).toContain("grid-template-columns: auto minmax(0, 1fr) auto");
    expect(shellStyles).not.toContain("--appshell-");
  });

  it("puts the aside on the surface plane at the wide token width", () => {
    const aside = shellStyles.slice(shellStyles.indexOf(".aside {"));
    expect(aside.slice(0, aside.indexOf("@include below-lg"))).toContain("var(--fui-bg-primary");
    expect(shellStyles).toContain("var(--fui-appshell-sidebar-width-wide");
  });

  it("draws one opaque hairline, no shadow, no floating chrome, logical properties", () => {
    expect(shellStyles).not.toMatch(/box-shadow|color-mix|floating|radius/i);
    expect(shellStyles).not.toMatch(/--fui-border-(subtle|default|strong)/);
    expect(shellStyles).not.toMatch(/\b(margin|padding|border)-(left|right|top|bottom)\b/);
    expect(shellStyles).not.toMatch(/(^|\s)(top|left|right|bottom|width|height):/m);
  });
});
