import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Card, type CardProps } from "./index";

const cardStyles = readFileSync(
  resolve(process.cwd(), "src/components/Card/Card.module.scss"),
  "utf8"
);

describe("Card", () => {
  it("renders as <article> by default on the compact inset", () => {
    render(<Card>Content</Card>);
    const card = screen.getByRole("article");
    expect(card).toHaveClass("card", "paddingMd");
    expect(card.className).not.toMatch(/interactive|selected|tone/);
  });

  it("renders the static tag from as", () => {
    const { container } = render(<Card as="section">Content</Card>);
    expect(container.firstElementChild?.tagName).toBe("SECTION");
  });

  it("is one surface: plane, compact inset, no shadow, no gradient", () => {
    expect(cardStyles).toContain("@include surface.plane");
    expect(cardStyles).toContain('surface.inset("compact")');
    expect(cardStyles).not.toMatch(/box-shadow|radial-gradient|bg-elevated|radius-lg/);
    expect(cardStyles).toContain("@include high-contrast-outline");
  });

  it("drops the merged variants and paddings from the API", () => {
    // @ts-expect-error variant was cut at v4: one surface
    const soft: CardProps = { children: "x", variant: "soft" };
    // @ts-expect-error tone accent was cut at v4: colour is earned
    const accent: CardProps = { children: "x", tone: "accent" };
    // @ts-expect-error padding lg was cut at v4: one inset
    const roomy: CardProps = { children: "x", padding: "lg" };
    expect([soft, accent, roomy]).toHaveLength(3);
  });

  it("draws the danger edge only for tone=danger", () => {
    render(<Card tone="danger">Held</Card>);
    expect(screen.getByRole("article")).toHaveClass("toneDanger");
    expect(cardStyles).toMatch(/\.toneDanger \{\s*border-color: var\(--fui-color-danger-text/);
  });

  it("renders a real button through render, with no hand-written key handling", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Card render={<button type="button" />} onClick={handleClick}>
        Open repository
      </Card>
    );
    const card = screen.getByRole("button", { name: "Open repository" });
    expect(card.tagName).toBe("BUTTON");
    expect(card).toHaveClass("card", "interactive");
    expect(card).not.toHaveAttribute("tabindex");
    await user.click(card);
    card.focus();
    await user.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("draws every part as a span inside a button card, since a button holds phrasing only", () => {
    const { container } = render(
      <Card render={<button type="button" />}>
        <Card.Header>
          <Card.Title>Run the check</Card.Title>
          <Card.Description>The whole card is one button.</Card.Description>
        </Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>
    );
    const button = screen.getByRole("button", { name: /Run the check/ });
    expect(button.querySelector("div, p, h1, h2, h3, h4, h5, h6")).toBeNull();
    expect(container.querySelectorAll("button span")).toHaveLength(5);
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("keeps the heading and paragraph inside a link card", () => {
    render(
      <Card render={<a href="/repos/web" />}>
        <Card.Title>web</Card.Title>
        <Card.Description>The whole card is one link.</Card.Description>
      </Card>
    );
    expect(screen.getByRole("heading", { level: 3, name: "web" })).toBeInTheDocument();
    expect(screen.getByText("The whole card is one link.").tagName).toBe("P");
  });

  it("renders a real link through render", () => {
    render(<Card render={<a href="/repos/web" />}>web</Card>);
    const link = screen.getByRole("link", { name: "web" });
    expect(link).toHaveAttribute("href", "/repos/web");
    expect(link).toHaveClass("interactive");
  });

  it("warns when onClick sits on a static card", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Card onClick={() => {}}>Static</Card>);
    expect(screen.getByRole("article")).not.toHaveAttribute("role");
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("gates the hover tint, presses at the press scale and rings on focus", () => {
    const interactive = cardStyles.slice(cardStyles.indexOf(".interactive {"));
    const block = interactive.slice(0, interactive.indexOf(".selected {"));
    expect(block).toContain("@include action.hover");
    expect(block).toContain("@include selection.hover-tint");
    expect(block).toContain("@include action.press");
    expect(block).toContain("@include focus.visible");
  });

  it("marks the chosen card with the wash and the ring", () => {
    render(
      <Card selected render={<button type="button" aria-pressed="true" />}>
        Chosen
      </Card>
    );
    const card = screen.getByRole("button", { name: "Chosen" });
    expect(card).toHaveClass("selected");
    expect(card).toHaveAttribute("data-selected");
    expect(cardStyles).toMatch(/\.selected \{\s*@include selection\.selected\(\$edge: "border"\)/);
  });

  it("renders compound sub-components", () => {
    render(
      <Card>
        <Card.Header>Header</Card.Header>
        <Card.Title>Title</Card.Title>
        <Card.Description>Description</Card.Description>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>
    );
    expect(screen.getByText("Header")).toHaveClass("header");
    expect(screen.getByText("Title").tagName).toBe("H3");
    expect(screen.getByText("Description").tagName).toBe("P");
    expect(screen.getByText("Body")).toHaveClass("body");
    expect(screen.getByText("Footer")).toHaveClass("footer");
  });

  it("allows nested panels to select the correct title heading level", () => {
    render(<Card.Title as="h4">Nested panel</Card.Title>);
    expect(screen.getByRole("heading", { level: 4, name: "Nested panel" })).toBeInTheDocument();
  });

  it("applies body padding classes", () => {
    render(
      <Card padding="none">
        <Card.Body padding="md">Body</Card.Body>
      </Card>
    );
    expect(screen.getByRole("article")).toHaveClass("paddingNone");
    expect(screen.getByText("Body")).toHaveClass("body", "paddingMd");
  });

  it("draws the divided header as a line with no fill", () => {
    const { container } = render(
      <Card padding="none">
        <Card.Header divided data-testid="divided-header">
          <Card.Title>Adoption</Card.Title>
          <span>aside</span>
        </Card.Header>
      </Card>
    );
    expect(container.querySelector("[data-testid='divided-header']")).toHaveClass("headerDivided");
    const divided = cardStyles.slice(cardStyles.indexOf(".headerDivided {"));
    const block = divided.slice(0, divided.indexOf("&:has"));
    expect(block).toContain("border-block-end:");
    expect(block).not.toContain("background");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Card>
          <Card.Header>
            <Card.Title>Card Title</Card.Title>
          </Card.Header>
          <Card.Body>Card body content</Card.Body>
        </Card>
        <Card render={<a href="/repos/web" />}>Open web</Card>
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
