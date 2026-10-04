import { describe, it, expect } from "vitest";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Icon } from "./index";

type MockIconProps = {
  size?: number | string;
  weight?: string;
};

function MockIcon(props: MockIconProps) {
  return <svg data-testid="mock-icon" data-size={props.size} data-weight={props.weight} />;
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
    ["lg", 18],
    ["xl", 24],
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

  it.each(["secondary", "tertiary", "accent", "info", "success", "warning", "danger"] as const)(
    "applies the %s tone class",
    (tone) => {
      const { container } = render(<Icon icon={MockIcon} tone={tone} />);
      expect(container.firstChild).toHaveClass(
        `tone${tone.charAt(0).toUpperCase()}${tone.slice(1)}`
      );
    }
  );

  it("inherits currentColor when no tone is set", () => {
    const { container } = render(<Icon icon={MockIcon} />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/tone/);
  });

  it.each(["regular", "bold", "fill"] as const)("forwards the %s weight to the glyph", (weight) => {
    const { container } = render(<Icon icon={MockIcon} weight={weight} />);
    expect(container.querySelector('[data-testid="mock-icon"]')).toHaveAttribute(
      "data-weight",
      weight
    );
  });

  it("defaults the glyph weight to regular", () => {
    const { container } = render(<Icon icon={MockIcon} />);
    expect(container.querySelector('[data-testid="mock-icon"]')).toHaveAttribute(
      "data-weight",
      "regular"
    );
  });

  it("has no color or iconProps escape hatch", () => {
    // Type-level only: each cut prop is a compile error.
    const cut = () => [
      // @ts-expect-error -- color merged into tone at v4
      <Icon key="color" icon={MockIcon} color="tertiary" />,
      // @ts-expect-error -- iconProps cut at v4
      <Icon key="props" icon={MockIcon} iconProps={{ size: 99 }} />,
      // @ts-expect-error -- 2xl is off the glyph ladder
      <Icon key="2xl" icon={MockIcon} size="2xl" />,
    ];
    expect(cut).toBeTypeOf("function");
  });

  it("ships hidden from assistive technology by default", () => {
    const { container } = render(<Icon icon={MockIcon} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstChild).not.toHaveAttribute("role");
  });

  it("is announced once, as an image, when labelled", () => {
    render(<Icon icon={MockIcon} aria-label="Close" />);
    const icon = screen.getByRole("img", { name: "Close" });
    expect(icon.tagName).toBe("SPAN");
    expect(icon).toHaveAttribute("aria-label", "Close");
    expect(icon).not.toHaveAttribute("aria-hidden");
  });

  it("treats aria-labelledby as a label", () => {
    render(
      <>
        <span id="icon-name">Settings</span>
        <Icon icon={MockIcon} aria-labelledby="icon-name" />
      </>
    );
    expect(screen.getByRole("img", { name: "Settings" })).not.toHaveAttribute("aria-hidden");
  });

  it("lets an explicit aria-hidden or role win", () => {
    const { container, rerender } = render(<Icon icon={MockIcon} aria-hidden={false} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "false");

    rerender(<Icon icon={MockIcon} aria-label="Status" role="presentation" />);
    expect(container.firstChild).toHaveAttribute("role", "presentation");
  });

  it("has no accessibility violations, hidden or labelled", async () => {
    const { container } = render(
      <div>
        <Icon icon={MockIcon} />
        <Icon icon={MockIcon} aria-label="Close" />
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
