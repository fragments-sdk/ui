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
    expect(screen.getByText("A").parentElement?.tagName).toBe("DIV");
  });

  it("applies direction and the default gap class", () => {
    const { container } = render(
      <Stack direction="row">
        <span>A</span>
      </Stack>
    );
    expect(container.firstChild).toHaveClass("stack", "row", "gap-md");
  });

  it("maps every named gap to a class and writes no custom property", () => {
    for (const gap of ["none", "xs", "sm", "md", "lg", "xl"] as const) {
      const { container, unmount } = render(
        <Stack gap={gap}>
          <span>A</span>
        </Stack>
      );
      const el = container.firstChild as HTMLElement;
      expect(el).toHaveClass(`gap-${gap}`);
      expect(el.getAttribute("style")).toBeNull();
      unmount();
    }
  });

  it("applies alignment, justify and wrap classes", () => {
    const { container } = render(
      <Stack align="center" justify="between" wrap>
        <span>A</span>
      </Stack>
    );
    expect(container.firstChild).toHaveClass("align-center", "justify-between", "wrap");
  });

  it('renders as a different element via "as" prop', () => {
    render(
      <Stack as="nav">
        <span>Item</span>
      </Stack>
    );
    expect(screen.getByText("Item").parentElement!.tagName).toBe("NAV");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(
      <Stack ref={ref}>
        <span>A</span>
      </Stack>
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it("draws a horizontal Separator between children in a column", () => {
    render(
      <Stack divided>
        <span>A</span>
        <span>B</span>
        <span>C</span>
      </Stack>
    );
    const rules = screen.getAllByRole("separator");
    expect(rules).toHaveLength(2);
    expect(rules[0]).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("draws vertical Separators in a row", () => {
    render(
      <Stack direction="row" divided>
        <span>A</span>
        <span>B</span>
      </Stack>
    );
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("keeps a divided list made of li children only", async () => {
    const { container } = render(
      <Stack as="ul" divided>
        <li>A</li>
        <li>B</li>
        <li>C</li>
      </Stack>
    );
    const list = container.firstChild as HTMLElement;
    expect(Array.from(list.children).every((child) => child.tagName === "LI")).toBe(true);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    await expectNoA11yViolations(container);
  });

  it("ignores divided while collapseBelow can change the flow", () => {
    render(
      <Stack divided collapseBelow="20rem">
        <span>A</span>
        <span>B</span>
      </Stack>
    );
    expect(screen.queryByRole("separator")).toBeNull();
  });

  it("draws nothing for a single child", () => {
    render(
      <Stack divided>
        <span>Only</span>
      </Stack>
    );
    expect(screen.queryByRole("separator")).toBeNull();
  });

  it("collapses on its own width through a private property", () => {
    const { container } = render(
      <Stack collapseBelow="32rem" direction="column">
        <span>A</span>
        <span>B</span>
      </Stack>
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("row", "collapse");
    expect(el.style.getPropertyValue("--_fui-stack-collapse")).toBe("32rem");
    expect(el.hasAttribute("data-direction-base")).toBe(false);
  });

  it("drops the cut props at the type level", () => {
    const cut = () => [
      // @ts-expect-error numeric gaps were cut in v4
      <Stack key="numeric" gap={4}>
        <span>A</span>
      </Stack>,
      // @ts-expect-error responsive gap objects were cut in v4
      <Stack key="gap" gap={{ base: "sm", md: "lg" }}>
        <span>A</span>
      </Stack>,
      // @ts-expect-error responsive direction objects became collapseBelow
      <Stack key="direction" direction={{ base: "column", md: "row" }}>
        <span>A</span>
      </Stack>,
      // @ts-expect-error separator became divided
      <Stack key="separator" separator>
        <span>A</span>
      </Stack>,
    ];
    expect(cut).toBeTypeOf("function");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Stack divided>
        <span>A</span>
        <span>B</span>
      </Stack>
    );
    await expectNoA11yViolations(container);
  });
});
