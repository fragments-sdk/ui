import { describe, it, expect } from "vitest";
import { render, expectNoA11yViolations } from "../../test/utils";
import { Icon } from "./index";

type MockIconProps = {
  size?: number | string;
  weight?: string;
  tone?: "warm" | "cool";
};

function MockIcon(props: MockIconProps) {
  return (
    <svg
      data-testid="mock-icon"
      data-size={props.size}
      data-weight={props.weight}
      data-tone={props.tone}
    />
  );
}

describe("Icon", () => {
  it("renders the icon component inside a span", () => {
    const { container } = render(<Icon icon={MockIcon} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe("SPAN");
    expect(wrapper.querySelector("svg")).toBeInTheDocument();
  });

  it.each([
    ["xs", 12],
    ["sm", 14],
    ["md", 16],
    ["lg", 20],
    ["xl", 24],
    ["2xl", 32],
  ] as const)("passes the generated %s pixel size to the icon", (size, pixels) => {
    const { container } = render(<Icon icon={MockIcon} size={size} />);
    const svg = container.querySelector('[data-testid="mock-icon"]');
    expect(svg).toHaveAttribute("data-size", String(pixels));
  });

  it.each(["xs", "sm", "md", "lg", "xl"] as const)(
    "applies the %s representation class to the outer box",
    (size) => {
      const { container } = render(<Icon icon={MockIcon} size={size} />);
      expect(container.firstChild).toHaveClass(size);
    }
  );

  it("applies an internal CSS-safe class for the public 2xl size", () => {
    const { container } = render(<Icon icon={MockIcon} size="2xl" />);
    expect(container.firstChild).toHaveClass("size2xl");
  });

  it("applies variant color class", () => {
    const { container } = render(<Icon icon={MockIcon} variant="error" />);
    expect(container.firstChild).toHaveClass("error");
  });

  it("forwards custom icon props to arbitrary icon components", () => {
    const { container } = render(<Icon icon={MockIcon} iconProps={{ tone: "warm" }} />);
    const svg = container.querySelector('[data-testid="mock-icon"]');
    expect(svg).toHaveAttribute("data-tone", "warm");
  });

  it("does not override an explicit iconProps.size", () => {
    const { container } = render(<Icon icon={MockIcon} size="lg" iconProps={{ size: 99 }} />);
    const svg = container.querySelector('[data-testid="mock-icon"]');
    expect(svg).toHaveAttribute("data-size", "99");
  });

  it("does not add aria-hidden by default (wrapping span is presentational)", () => {
    const { container } = render(<Icon icon={MockIcon} aria-hidden="true" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Icon icon={MockIcon} aria-hidden="true" />);
    await expectNoA11yViolations(container);
  });
});
