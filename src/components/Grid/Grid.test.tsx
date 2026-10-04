import { describe, it, expect, vi } from "vitest";
import { compiledModuleRules } from "../../test/compiled-css";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Grid } from "./index";

/** One compiled declaration from the Grid module, read with the DOM's own CSS parser. */
function compiled(selector: string, property: string): string {
  const rule = compiledModuleRules("src/components/Grid/Grid.module.scss").find(
    (candidate): candidate is CSSStyleRule =>
      candidate.type === CSSRule.STYLE_RULE && (candidate as CSSStyleRule).selectorText === selector
  );
  return rule?.style.getPropertyValue(property) ?? "";
}

describe("Grid", () => {
  it("renders children", () => {
    render(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("applies a fixed column class with the default gap", () => {
    const { container } = render(<Grid columns={3}>Content</Grid>);
    expect(container.firstChild).toHaveClass("grid", "columns3", "gap-md");
  });

  it("draws fixed tracks that content cannot widen", () => {
    expect(compiled(".columns3", "grid-template-columns")).toBe("repeat(3, minmax(0, 1fr))");
    expect(compiled(".columns12", "grid-template-columns")).toBe("repeat(12, minmax(0, 1fr))");
  });

  it("lets the gap class drive the gutter through one private value", () => {
    expect(compiled(".grid", "gap")).toBe("var(--_fui-grid-gap, var(--fui-raw-space-12, 12px))");
    expect(compiled(".gap-lg", "--_fui-grid-gap")).toBe("var(--fui-raw-space-16, 16px)");
    const { container } = render(<Grid gap="lg">Content</Grid>);
    expect(container.firstChild).toHaveClass("gap-lg");
    expect((container.firstChild as HTMLElement).getAttribute("style")).toBeNull();
  });

  it("fills the row with auto tracks", () => {
    const { container } = render(
      <Grid columns="auto" minChildWidth="12rem">
        Content
      </Grid>
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("columnsAuto");
    expect(el.style.getPropertyValue("--_fui-grid-min")).toBe("12rem");
  });

  it("turns a count into a ceiling when minChildWidth is set", () => {
    const { container } = render(
      <Grid columns={3} minChildWidth="14rem">
        Content
      </Grid>
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("columnsCapped");
    expect(el).not.toHaveClass("columns3");
    expect(el.style.getPropertyValue("--_fui-grid-max")).toBe("3");
    expect(el.style.getPropertyValue("--_fui-grid-min")).toBe("14rem");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Grid ref={ref}>Content</Grid>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it("renders Grid.Item with spans, alignment and subgrid", () => {
    render(
      <Grid columns={3}>
        <Grid.Item colSpan={2} rowSpan={2} alignSelf="center" subgrid>
          Wide
        </Grid.Item>
        <Grid.Item colSpan="full">Full</Grid.Item>
      </Grid>
    );
    expect(screen.getByText("Wide")).toHaveClass(
      "item",
      "colSpan2",
      "rowSpan2",
      "selfAlignCenter",
      "subgridRows"
    );
    expect(screen.getByText("Full")).toHaveClass("colSpanFull");
  });

  it("builds the compound without mutation", () => {
    expect(Grid.Item).toBeDefined();
    expect(Grid.Root).toBeDefined();
  });

  it("drops the cut props at the type level", () => {
    const cut = () => [
      // @ts-expect-error numeric gaps were cut in v4
      <Grid key="gap" gap={4} />,
      // @ts-expect-error padding was cut in v4; the shell or surface owns the inset
      <Grid key="padding" padding="md" />,
      // @ts-expect-error odd column counts were cut in v4
      <Grid key="five" columns={5} />,
      // @ts-expect-error responsive column objects became minChildWidth ceilings
      <Grid key="responsive" columns={{ base: 1, md: 2 }} />,
    ];
    expect(cut).toBeTypeOf("function");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Grid columns={2}>
        <Grid.Item>A</Grid.Item>
        <Grid.Item>B</Grid.Item>
      </Grid>
    );
    await expectNoA11yViolations(container);
  });
});
