import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRef } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from "../../test/utils";
import { Sidebar } from "../Sidebar";
import { Header } from "./index";

const headerStyles = readFileSync(
  resolve(process.cwd(), "src/components/Header/Header.module.scss"),
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

function block(selector: string): string {
  const start = headerStyles.search(new RegExp(`^\\s*\\${selector}\\s*\\{`, "m"));
  expect(start, `missing ${selector}`).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let index = headerStyles.indexOf("{", start); index < headerStyles.length; index += 1) {
    if (headerStyles[index] === "{") depth += 1;
    if (headerStyles[index] === "}") depth -= 1;
    if (depth === 0) return headerStyles.slice(start, index + 1);
  }
  return "";
}

describe("Header", () => {
  it("renders a banner landmark on the canvas plane", () => {
    render(
      <Header>
        <Header.Brand>Workspace</Header.Brand>
      </Header>
    );
    const header = screen.getByRole("banner");
    expect(header).toHaveAttribute("data-position", "static");
    expect(header).not.toHaveAttribute("data-scrolled");
    expect(header.className).not.toMatch(/sticky|elevatedOnScroll/);
  });

  it("renders Brand as a div, a link with href, or the render element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Header>
        <Header.Brand>Plain</Header.Brand>
        <Header.Brand href="/">Home</Header.Brand>
        <Header.Brand render={<a ref={ref} href="/app" className="router-link" />}>
          App
        </Header.Brand>
      </Header>
    );
    expect(screen.getByText("Plain").tagName).toBe("DIV");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    const app = screen.getByRole("link", { name: "App" });
    expect(ref.current).toBe(app);
    expect(app.className).toMatch(/brand/);
    expect(app.className).toContain("router-link");
  });

  it("sticks and draws the scroll hairline only after the threshold", async () => {
    const original = Object.getOwnPropertyDescriptor(window, "scrollY");
    let scrollY = 0;
    Object.defineProperty(window, "scrollY", { configurable: true, get: () => scrollY });
    try {
      render(
        <Header position="sticky" elevatedOnScroll={{ threshold: 40 }}>
          <Header.Brand>Workspace</Header.Brand>
        </Header>
      );
      const header = screen.getByRole("banner");
      expect(header.className).toMatch(/sticky/);
      expect(header.className).toMatch(/elevatedOnScroll/);
      expect(header).toHaveAttribute("data-scrolled", "false");
      scrollY = 41;
      window.dispatchEvent(new Event("scroll"));
      await waitFor(() => expect(header).toHaveAttribute("data-scrolled", "true"));
    } finally {
      if (original) Object.defineProperty(window, "scrollY", original);
    }
  });

  it("renders a labelled nav with current, disabled and link items", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Header>
        <Header.Nav>
          <Header.NavItem href="#home" active>
            Home
          </Header.NavItem>
          <Header.NavItem onClick={onClick} data-testid="docs">
            Docs
          </Header.NavItem>
          <Header.NavItem disabled onClick={onClick}>
            Billing
          </Header.NavItem>
        </Header.Nav>
      </Header>
    );
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    const home = screen.getByRole("link", { name: "Home" });
    expect(home).toHaveAttribute("aria-current", "page");
    expect(home.className).toMatch(/navItemActive/);

    const docs = screen.getByRole("button", { name: "Docs" });
    expect(docs).toHaveAttribute("type", "button");
    expect(docs).toHaveAttribute("data-testid", "docs");
    await user.click(docs);
    expect(onClick).toHaveBeenCalledOnce();

    const billing = screen.getByRole("button", { name: "Billing" });
    expect(billing).toHaveAttribute("aria-disabled", "true");
    expect(billing).toHaveAttribute("tabindex", "-1");
    await user.click(billing);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders NavItem through the render prop", () => {
    render(
      <Header>
        <Header.Nav>
          <Header.NavItem render={<a href="#router" className="router" />} active>
            Routed
          </Header.NavItem>
        </Header.Nav>
      </Header>
    );
    const link = screen.getByRole("link", { name: "Routed" });
    expect(link).toHaveAttribute("href", "#router");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link.className).toContain("router");
    expect(link.className).toMatch(/navItem/);
  });

  it("puts Actions on the trailing edge and SkipLink on #main-content", () => {
    render(
      <Header>
        <Header.SkipLink />
        <Header.Actions data-testid="actions">
          <button type="button">Sign in</button>
        </Header.Actions>
      </Header>
    );
    expect(screen.getByTestId("actions").className).toMatch(/actions/);
    const skip = screen.getByRole("link", { name: "Skip to main content" });
    expect(skip).toHaveAttribute("href", "#main-content");
    // The skip link is VisuallyHidden's focusable reveal, the one skip chip.
    expect(skip.parentElement).toHaveClass("visuallyHidden", "focusable");
  });

  it("draws the scroll hairline from the AppShell main pane, not the window", async () => {
    render(
      <div data-slot="app-shell">
        <Header elevatedOnScroll data-testid="bar">
          <Header.Brand>Workspace</Header.Brand>
        </Header>
        <div data-slot="app-shell-main" data-testid="pane" />
      </div>
    );
    const bar = screen.getByTestId("bar");
    const pane = screen.getByTestId("pane");
    expect(bar).toHaveAttribute("data-scrolled", "false");
    Object.defineProperty(pane, "scrollTop", { configurable: true, value: 40 });
    pane.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(bar).toHaveAttribute("data-scrolled", "true"));
  });

  it("Header.Trigger standalone is a plain button with composed onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Header>
        <Header.Trigger onClick={onClick} aria-expanded={false} />
      </Header>
    );
    const trigger = screen.getByRole("button", { name: "Toggle navigation" });
    expect(trigger.className).toMatch(/triggerStandalone/);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("Header.Trigger is in the first paint and hides from md up while the rail is in view", () => {
    render(
      <Sidebar.Provider>
        <Header>
          <Header.Trigger />
        </Header>
        <Sidebar aria-label="App">
          <Sidebar.Nav>
            <Sidebar.Item icon={<svg aria-hidden="true" />}>Home</Sidebar.Item>
          </Sidebar.Nav>
        </Sidebar>
      </Sidebar.Provider>
    );
    // No effect has to run for a phone to see it: CSS hides it from md up.
    expect(screen.getByRole("button", { name: "Toggle navigation" })).toHaveClass("triggerBelowMd");
    expect(headerStyles).toMatch(
      /\.triggerBelowMd \{\s*@include breakpoint-md \{\s*display: none;/
    );
  });

  it("Header.Trigger brings back an offcanvas rail", async () => {
    const user = userEvent.setup();
    render(
      <Sidebar.Provider collapsible="offcanvas" defaultCollapsed>
        <Header>
          <Header.Trigger />
        </Header>
        <Sidebar aria-label="App">
          <Sidebar.Nav>
            <Sidebar.Item icon={<svg aria-hidden="true" />}>Home</Sidebar.Item>
          </Sidebar.Nav>
        </Sidebar>
      </Sidebar.Provider>
    );
    const trigger = screen.getByRole("button", { name: "Toggle navigation" });
    const aside = document.querySelector("aside")!;
    expect(trigger).toHaveAttribute("aria-controls", aside.id);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(aside).toHaveAttribute("data-state", "expanded");
    expect(trigger).toHaveClass("triggerBelowMd");
  });

  it("Header.Trigger opens the mobile sidebar panel", async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    render(
      <Sidebar.Provider>
        <Header>
          <Header.Trigger />
        </Header>
        <Sidebar aria-label="App">
          <Sidebar.Nav>
            <Sidebar.Item>Home</Sidebar.Item>
          </Sidebar.Nav>
        </Sidebar>
      </Sidebar.Provider>
    );
    const trigger = await screen.findByRole("button", { name: "Toggle navigation" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(await screen.findByRole("dialog", { name: "App" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Header>
        <Header.SkipLink />
        <Header.Brand href="/">Workspace</Header.Brand>
        <Header.Nav>
          <Header.NavItem href="#a" active>
            Home
          </Header.NavItem>
          <Header.NavItem href="#b">About</Header.NavItem>
        </Header.Nav>
        <Header.Actions>
          <button type="button">Sign in</button>
        </Header.Actions>
      </Header>
    );
    await expectNoA11yViolations(container);
  });
});

describe("Header.NavMenu", () => {
  it("opens a floating list of items", async () => {
    const user = userEvent.setup();
    render(
      <Header>
        <Header.Nav>
          <Header.NavMenu label="Products" active>
            <Header.NavMenuItem href="#analytics">Analytics</Header.NavMenuItem>
            <Header.NavMenuItem active>Automation</Header.NavMenuItem>
            <Header.NavMenuItem disabled>Reports</Header.NavMenuItem>
          </Header.NavMenu>
        </Header.Nav>
      </Header>
    );
    const trigger = screen.getByRole("button", { name: "Products" });
    expect(trigger.className).toMatch(/navItemActive/);
    await user.click(trigger);
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    const link = screen.getByRole("menuitem", { name: "Analytics" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "#analytics");
    const current = screen.getByRole("menuitem", { name: "Automation" });
    expect(current.className).toMatch(/navMenuItemActive/);
    expect(current).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("menuitem", { name: "Reports" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("has no accessibility violations when open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Header>
        <Header.Nav>
          <Header.NavMenu label="Products">
            <Header.NavMenuItem href="#a">Analytics</Header.NavMenuItem>
          </Header.NavMenu>
        </Header.Nav>
      </Header>
    );
    await user.click(screen.getByRole("button", { name: "Products" }));
    await screen.findByRole("menu");
    await expectNoA11yViolations(container);
  });
});

describe("Header styles", () => {
  it("sits on the canvas at the header height token with the 16 page gutter", () => {
    const root = block(".header");
    expect(root).toContain("var(--fui-app-canvas-bg");
    expect(root).toContain("var(--fui-appshell-header-height");
    expect(root).toContain("layout.page-gutter()");
    expect(root).not.toContain("box-shadow");
  });

  it("marks the current item and menu row with the shared current recipe", () => {
    expect(block(".navItemActive")).toContain("@include selection.current");
    expect(block(".navMenuItemActive")).toContain("@include selection.current");
  });

  it("puts nav items on the md track at the regular weight, hover gated", () => {
    const item = block(".navItem");
    expect(item).toContain('@include action.size("md")');
    expect(item).toContain('@include action.weight("regular")');
    expect(item).toContain("@include action.hover");
    expect(item).toContain('@include target.hit-area("compact")');
    expect(item).not.toMatch(/&:hover\s*\{/);
  });

  it("floats the menu with the popup recipes and never animates the chevron", () => {
    expect(block(".navMenuPopup")).toContain("@include popup.container");
    expect(block(".navMenuPopup")).toContain("@include popup.motion");
    expect(block(".navMenuChevron")).not.toContain("transition");
  });

  it("leaves the search fill to the Input and keeps logical properties", () => {
    expect(block(".search")).not.toContain("background");
    expect(headerStyles).not.toMatch(/\b(margin|padding|border)-(left|right|top|bottom)\b/);
    expect(headerStyles).not.toMatch(/(^|\s)(top|left|right|bottom):/m);
    expect(headerStyles).not.toContain("text-transform");
    expect(headerStyles).not.toContain("@keyframes");
  });
});
