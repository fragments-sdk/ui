import { describe, it, expect, vi } from "vitest";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Box, type BoxProps } from "./index";

describe("Box", () => {
  it("renders a div by default", () => {
    render(<Box>Content</Box>);
    const el = screen.getByText("Content");
    expect(el.tagName).toBe("DIV");
  });

  it('renders as a different element via "as" prop', () => {
    render(<Box as="section">Content</Box>);
    const el = screen.getByText("Content");
    expect(el.tagName).toBe("SECTION");
  });

  it("forwards className and ref", () => {
    const ref = vi.fn();
    const { container } = render(
      <Box ref={ref} className="custom">
        Content
      </Box>
    );
    expect(ref).toHaveBeenCalled();
    expect(container.firstChild).toHaveClass("custom");
  });

  it("is transparent with no props", () => {
    const { container } = render(<Box>Content</Box>);
    expect((container.firstChild as HTMLElement).className).toBe("box");
  });

  it.each(["canvas", "band", "surface", "raised"] as const)("paints the %s plane", (plane) => {
    const { container } = render(<Box plane={plane}>Content</Box>);
    expect(container.firstChild).toHaveClass(`plane-${plane}`);
  });

  it("draws the hairline on every side or on one logical block side", () => {
    const { container, rerender } = render(<Box border>Content</Box>);
    expect(container.firstChild).toHaveClass("border");
    rerender(<Box border="block-start">Content</Box>);
    expect(container.firstChild).toHaveClass("border-block-start");
    expect(container.firstChild).not.toHaveClass("border");
    rerender(<Box border="block-end">Content</Box>);
    expect(container.firstChild).toHaveClass("border-block-end");
    rerender(<Box border={false}>Content</Box>);
    expect((container.firstChild as HTMLElement).className).toBe("box");
  });

  it("maps radius and inset to their roles", () => {
    const { container } = render(
      <Box radius="nested" inset="compact">
        Content
      </Box>
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("radius-nested");
    expect(el).toHaveClass("inset-compact");
  });

  it("carries no cut props", () => {
    // @ts-expect-error shadow is cut: only floating surfaces cast shadow
    const shadow: BoxProps = { shadow: "md" };
    // @ts-expect-error background is now plane
    const background: BoxProps = { background: "secondary" };
    // @ts-expect-error padding is now inset
    const padding: BoxProps = { padding: "md" };
    // @ts-expect-error margins are cut: the parent owns spacing
    const margin: BoxProps = { marginX: "auto" };
    // @ts-expect-error size props are cut
    const width: BoxProps = { width: 200 };
    // @ts-expect-error physical border sides are cut
    const borderTop: BoxProps = { borderTop: true };
    expect([shadow, background, padding, margin, width, borderTop]).toHaveLength(6);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Box plane="surface" border radius="surface" inset="default">
        Accessible
      </Box>
    );
    await expectNoA11yViolations(container);
  });

  it("forwards DOM props and event handlers", () => {
    const onClick = vi.fn();
    render(
      <Box data-testid="box" id="box-id" aria-label="Box label" onClick={onClick}>
        Content
      </Box>
    );
    const el = screen.getByTestId("box");
    el.click();
    expect(el).toHaveAttribute("id", "box-id");
    expect(el).toHaveAttribute("aria-label", "Box label");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
