import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Breadcrumbs } from "./index";

describe("Breadcrumbs", () => {
  it('renders a nav landmark named "Breadcrumb"', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item>Page</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("takes a custom label and root props", () => {
    render(
      <Breadcrumbs label="Path" id="crumbs" data-testid="crumbs">
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item>Page</Breadcrumbs.Item>
      </Breadcrumbs>
    );

    const nav = screen.getByRole("navigation", { name: "Path" });
    expect(nav).toHaveAttribute("id", "crumbs");
    expect(nav).toHaveAttribute("data-testid", "crumbs");
  });

  it("makes the last item the current page: not a link, aria-current, no separator after it", () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/settings">Settings</Breadcrumbs.Item>
      </Breadcrumbs>
    );

    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
    const current = screen.getByText("Settings");
    expect(current).toHaveAttribute("aria-current", "page");

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0].querySelector("svg")).not.toBeNull();
    expect(items[1].querySelector("svg")).toBeNull();
  });

  it("hides the separator from assistive tech", () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item>Page</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    const separator = screen.getAllByRole("listitem")[0].querySelector("svg");
    expect(separator).toHaveAttribute("aria-hidden", "true");
  });

  it("renders an item with href as a link", () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/about">About</Breadcrumbs.Item>
        <Breadcrumbs.Item>Contact</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  it("renders an item through render, for router links", () => {
    const RouterLink = React.forwardRef<
      HTMLAnchorElement,
      { to: string } & React.ComponentProps<"a">
    >(function RouterLink({ to, ...props }, ref) {
      return <a ref={ref} href={to} data-router="" {...props} />;
    });
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item render={<RouterLink to="/repos" />}>Repositories</Breadcrumbs.Item>
        <Breadcrumbs.Item>Overview</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    const link = screen.getByRole("link", { name: "Repositories" });
    expect(link).toHaveAttribute("href", "/repos");
    expect(link).toHaveAttribute("data-router");
  });

  it("renders an item with only onClick as a button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item onClick={onClick}>Workspace</Breadcrumbs.Item>
        <Breadcrumbs.Item>Page</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    await user.click(screen.getByRole("button", { name: "Workspace" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("lets a plain item hand clicks to its own control", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <button type="button" onClick={onClick}>
            Switch
          </button>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>Page</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    const control = screen.getByRole("button", { name: "Switch" });
    expect(control.parentElement?.className).not.toMatch(/crumb/);
    await user.click(control);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("folds the items after the first into a menu past maxItems", async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumbs maxItems={3}>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/a">Alpha</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/b">Beta</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/c">Gamma</Breadcrumbs.Item>
        <Breadcrumbs.Item>Delta</Breadcrumbs.Item>
      </Breadcrumbs>
    );

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gamma" })).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: "Show collapsed breadcrumbs" });
    expect(trigger).toHaveTextContent("…");
    await user.click(trigger);

    const alpha = await screen.findByRole("menuitem", { name: "Alpha" });
    expect(alpha).toHaveAttribute("href", "/a");
    expect(screen.getByRole("menuitem", { name: "Beta" })).toHaveAttribute("href", "/b");
  });

  it("does not fold when maxItems is below 2 or the trail fits", () => {
    render(
      <Breadcrumbs maxItems={1}>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/a">Alpha</Breadcrumbs.Item>
        <Breadcrumbs.Item>Page</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    expect(screen.queryByRole("button", { name: /collapsed/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/products">Products</Breadcrumbs.Item>
        <Breadcrumbs.Item>Widget</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations when folded", async () => {
    const { container } = render(
      <Breadcrumbs maxItems={2}>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/a">Alpha</Breadcrumbs.Item>
        <Breadcrumbs.Item>Widget</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    await expectNoA11yViolations(container);
  });
});
