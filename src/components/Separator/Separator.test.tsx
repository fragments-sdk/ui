import { describe, it, expect } from "vitest";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Separator } from "./index";

describe("Separator", () => {
  it("renders one rule with role separator", () => {
    render(<Separator />);
    const rule = screen.getByRole("separator");
    expect(rule).toHaveClass("rule", "horizontal");
    expect(rule.childElementCount).toBe(0);
  });

  it("renders a vertical rule that stretches by default", () => {
    render(<Separator orientation="vertical" />);
    const rule = screen.getByRole("separator");
    expect(rule).toHaveAttribute("aria-orientation", "vertical");
    expect(rule).toHaveClass("vertical");
    expect(rule).not.toHaveClass("control");
  });

  it("stops a vertical rule at the control height when length is control", () => {
    render(<Separator orientation="vertical" length="control" />);
    expect(screen.getByRole("separator")).toHaveClass("vertical", "control");
  });

  it("ignores length on a horizontal rule", () => {
    render(<Separator length="control" />);
    expect(screen.getByRole("separator")).not.toHaveClass("control");
  });

  it("keeps the label outside the separator role", () => {
    render(<Separator label="Or" />);
    const rules = screen.getAllByRole("separator");
    expect(rules).toHaveLength(1);
    const words = screen.getByText("Or");
    expect(rules[0]).not.toContainElement(words);
    expect(words.parentElement).toHaveClass("labelled");
  });

  it("forwards the ref and props to the root", () => {
    let node: HTMLDivElement | null = null;
    render(
      <Separator
        ref={(el) => {
          node = el;
        }}
        data-testid="root"
        label="Or"
      />
    );
    expect(node).toBe(screen.getByTestId("root"));
  });

  it("drops the cut props at the type level", () => {
    const cut = () => [
      // @ts-expect-error soft was cut in v4
      <Separator key="soft" soft />,
      // @ts-expect-error gap was cut in v4; the parent owns spacing
      <Separator key="gap" gap="md" />,
    ];
    expect(cut).toBeTypeOf("function");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Separator />
        <Separator label="Or" />
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
