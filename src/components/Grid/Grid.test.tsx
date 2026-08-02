import { describe, it, expect, vi } from "vitest";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Grid } from "./index";

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

  it("applies fixed column class", () => {
    const { container } = render(<Grid columns={3}>Content</Grid>);
    expect(container.firstChild).toHaveClass("columns3");
  });

  it("applies responsive column CSS variables", () => {
    const { container } = render(<Grid columns={{ base: 1, md: 2, lg: 3 }}>Content</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("columnsResponsive");
    expect(el.style.getPropertyValue("--fui-grid-cols")).toBe("1");
    expect(el.style.getPropertyValue("--fui-grid-cols-md")).toBe("2");
    expect(el.style.getPropertyValue("--fui-grid-cols-lg")).toBe("3");
  });

  it("maps named gaps to the fixed layout recipe", () => {
    const { container } = render(<Grid gap="lg">Content</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue("--_fui-grid-gap")).toBe("var(--fui-raw-space-16, 16px)");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Grid ref={ref}>Content</Grid>);
    expect(ref).toHaveBeenCalled();
  });

  it("renders Grid.Item with colSpan", () => {
    const { container } = render(
      <Grid columns={3}>
        <Grid.Item colSpan={2}>Wide</Grid.Item>
        <Grid.Item>Normal</Grid.Item>
      </Grid>
    );
    // The item that contains "Wide" should have colSpan class
    expect(container.querySelector(".colSpan2")).toBeInTheDocument();
  });

  it("maps every numeric gap, including seven, to the fixed layout recipe", () => {
    const { container } = render(<Grid gap={7}>Content</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.getPropertyValue("--_fui-grid-gap")).toBe("var(--fui-raw-space-32, 32px)");
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
