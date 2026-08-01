import { describe, it, expect, vi } from "vitest";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Stack } from "./index";

describe("Stack", () => {
  it("renders children in a div by default", () => {
    render(
      <Stack>
        <span>A</span>
        <span>B</span>
      </Stack>
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("applies direction class", () => {
    const { container } = render(
      <Stack direction="row">
        <span>A</span>
      </Stack>
    );
    expect(container.firstChild).toHaveClass("row");
  });

  it("maps named gaps to the fixed layout recipe", () => {
    const { container } = render(
      <Stack gap="lg">
        <span>A</span>
      </Stack>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue("--fui-stack-gap")).toBe("var(--fui-raw-space-16, 16px)");
  });

  it("applies alignment and justify classes", () => {
    const { container } = render(
      <Stack align="center" justify="between">
        <span>A</span>
      </Stack>
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("align-center");
    expect(el).toHaveClass("justify-between");
  });

  it('renders as a different element via "as" prop', () => {
    render(
      <Stack as="nav">
        <span>Item</span>
      </Stack>
    );
    const nav = screen.getByText("Item").parentElement!;
    expect(nav.tagName).toBe("NAV");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(
      <Stack ref={ref}>
        <span>A</span>
      </Stack>
    );
    expect(ref).toHaveBeenCalled();
  });

  it("maps every numeric gap, including seven, to the fixed layout recipe", () => {
    const { container } = render(
      <Stack gap={7}>
        <span>A</span>
      </Stack>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue("--fui-stack-gap")).toBe("var(--fui-raw-space-32, 32px)");
  });

  it("carries responsive direction through every breakpoint for separator geometry", () => {
    const { container } = render(
      <Stack direction={{ base: "column", md: "row" }} separator>
        <span>A</span>
        <span>B</span>
      </Stack>
    );
    const el = container.firstChild as HTMLElement;
    const separator = el.querySelector('[aria-hidden="true"]');

    expect(el).toHaveAttribute("data-direction-base", "column");
    expect(el).toHaveAttribute("data-direction-sm", "column");
    expect(el).toHaveAttribute("data-direction-md", "row");
    expect(el).toHaveAttribute("data-direction-lg", "row");
    expect(el).toHaveAttribute("data-direction-xl", "row");
    expect(separator).not.toHaveAttribute("role");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Stack>
        <span>A</span>
        <span>B</span>
      </Stack>
    );
    await expectNoA11yViolations(container);
  });
});
