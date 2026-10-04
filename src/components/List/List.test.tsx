import { resolve } from "node:path";

import * as React from "react";
import * as sass from "sass";
import { describe, it, expect, vi } from "vitest";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { List } from "./index";

const css = sass
  .compile(resolve(process.cwd(), "src/components/List/List.module.scss"), { style: "expanded" })
  .css.replace(/\s+/g, " ");

describe("List", () => {
  it("renders as <ul> with a bullet by default", () => {
    render(
      <List>
        <List.Item>Item 1</List.Item>
        <List.Item>Item 2</List.Item>
      </List>
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
    expect(list).toHaveClass("disc");
  });

  it("numbers an <ol> without a marker prop", () => {
    render(
      <List as="ol">
        <List.Item>First</List.Item>
      </List>
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(list).toHaveClass("decimal");
  });

  it("lets an explicit marker win over the element default", () => {
    render(
      <List as="ol" marker="none">
        <List.Item>First</List.Item>
      </List>
    );
    expect(screen.getByRole("list")).toHaveClass("none");
    expect(screen.getByRole("list")).not.toHaveClass("decimal");
  });

  it("renders list items", () => {
    render(
      <List>
        <List.Item>Alpha</List.Item>
        <List.Item>Beta</List.Item>
        <List.Item>Gamma</List.Item>
      </List>
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Alpha");
  });

  it("keeps prose in the shrinkable content column", () => {
    render(
      <List>
        <List.Item>
          Refresh <code>.fragments/agent-context.md</code> from the active preset.
        </List.Item>
      </List>
    );

    const item = screen.getByRole("listitem");
    expect(item.firstElementChild).toHaveClass("itemContent");
    expect(item.firstElementChild).toHaveTextContent(
      "Refresh .fragments/agent-context.md from the active preset."
    );
  });

  it("renders an item icon whenever it is passed, on any marker", () => {
    render(
      <List>
        <List.Item icon={<span data-testid="star">*</span>}>Starred</List.Item>
      </List>
    );
    expect(screen.getByTestId("star")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveClass("iconItem");
    // The glyph takes the marker column: the bullet steps aside.
    expect(css).toContain(".list > .iconItem::before { content: none; }");
  });

  it.each(["none", "xs", "sm"] as const)("keeps the %s gap step", (gap) => {
    render(
      <List gap={gap}>
        <List.Item>{gap}</List.Item>
      </List>
    );
    expect(screen.getByRole("list")).toHaveClass(`gap-${gap}`);
  });

  it("has three gap steps and no larger rhythm", () => {
    expect(css).not.toMatch(/\.gap-(md|lg|xl)\b/);
  });

  it("reads at the body size with markers in ink 3", () => {
    expect(css).toMatch(
      /\.disc > li::before, \.disc > li > \.iconWrapper \{ color: var\(--fui-text-tertiary/
    );
    // The body role comes after the prose role, so it wins.
    expect(css.lastIndexOf("font-size: var(--fui-type-body-compact-size, 12px)")).toBeGreaterThan(
      css.lastIndexOf("font-size: var(--fui-type-body-relaxed-size")
    );
    expect(css).toMatch(/\.disc \{ font-size: var\(--fui-type-body-compact-size, 12px\)/);
  });

  it("rings focus outside the row, so the chosen row keeps its own inset ring", () => {
    expect(css).toMatch(
      /\.row:focus-visible \{[^}]*outline-offset: var\(--fui-focus-ring-offset, 2px\)/
    );
    expect(css).not.toMatch(/\.row:focus-visible \{[^}]*outline-offset: calc\(-1/);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <List>
        <List.Item>Item A</List.Item>
        <List.Item>Item B</List.Item>
      </List>
    );
    await expectNoA11yViolations(container);
  });
});

describe("List.Row", () => {
  it("renders a button inside a list item", () => {
    const onClick = vi.fn();
    render(
      <List marker="none" gap="none">
        <List.Row onClick={onClick}>Overview</List.Row>
      </List>
    );
    const row = screen.getByRole("button", { name: "Overview" });
    expect(row).toHaveAttribute("type", "button");
    expect(row).toHaveClass("row");
    expect(row.parentElement?.tagName).toBe("LI");
    expect(row.parentElement).toHaveClass("rowItem");
    row.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("draws the leading icon, the label and the trailing meta", () => {
    render(
      <List marker="none" gap="none">
        <List.Row icon={<svg data-testid="glyph" />} meta="12">
          Findings
        </List.Row>
      </List>
    );
    const row = screen.getByRole("button", { name: "Findings 12" });
    const [icon, label, meta] = Array.from(row.children);
    expect(icon).toHaveClass("rowIcon");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(label).toHaveClass("rowLabel");
    expect(meta).toHaveClass("rowMeta");
    expect(meta).toHaveTextContent("12");
  });

  it("marks the selected row as current", () => {
    render(
      <List marker="none" gap="none">
        <List.Row selected>Overview</List.Row>
        <List.Row>Settings</List.Row>
      </List>
    );
    const current = screen.getByRole("button", { name: "Overview" });
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current).toHaveAttribute("data-selected");
    expect(screen.getByRole("button", { name: "Settings" })).not.toHaveAttribute("aria-current");
  });

  it("keeps an aria-current or aria-pressed the caller passes", () => {
    render(
      <List marker="none" gap="none">
        <List.Row selected aria-current="page">
          Home
        </List.Row>
        <List.Row selected aria-pressed>
          Pinned
        </List.Row>
      </List>
    );
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
    const pinned = screen.getByRole("button", { name: "Pinned" });
    expect(pinned).toHaveAttribute("aria-pressed", "true");
    expect(pinned).not.toHaveAttribute("aria-current");
  });

  it("renders a link through the render prop", () => {
    render(
      <List marker="none" gap="none">
        <List.Row render={<a href="/settings" />} selected>
          Settings
        </List.Row>
      </List>
    );
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("href", "/settings");
    expect(link).toHaveClass("row");
    expect(link).not.toHaveAttribute("type");
    expect(link).toHaveAttribute("aria-current", "true");
  });

  it("forwards its ref to the row element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <List marker="none" gap="none">
        <List.Row ref={ref}>Overview</List.Row>
      </List>
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "Overview" }));
  });

  it("is a 32px row on the control radius that grows to the hit floor", () => {
    expect(css).toContain(
      "min-block-size: max(var(--fui-control-height-md, 32px), var(--fui-hit-area, 24px))"
    );
    expect(css).toMatch(/\.row \{[^}]*border-radius: var\(--fui-radius-control/);
  });

  it("gates hover, paints press and selection without losing the ring", () => {
    expect(css).toMatch(
      /@media \(hover: hover\) \{ \.row:hover:not\(:disabled, \[aria-disabled=true\]\) \{ background-image: linear-gradient\(var\(--fui-bg-hover/
    );
    expect(css).toMatch(
      /\.row:active:not\(:disabled, \[aria-disabled=true\]\) \{ background-image:/
    );
    expect(css).toMatch(
      /\.row\[data-selected\], \.row\[aria-current\]:not\(\[aria-current=false\]\), \.row\[aria-pressed=true\] \{ background-color: var\(--fui-control-selected-bg[^}]*box-shadow: inset 0 0 0/
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <List marker="none" gap="none" aria-label="Pages">
        <List.Row icon={<svg />} meta="3" selected>
          Overview
        </List.Row>
        <List.Row icon={<svg />}>Settings</List.Row>
        <List.Row disabled>Billing</List.Row>
      </List>
    );
    await expectNoA11yViolations(container);
  });
});
