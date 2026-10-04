import { describe, it, expect } from "vitest";
import { compiledModuleRules } from "../../test/compiled-css";
import { render, expectNoA11yViolations } from "../../test/utils";
import { Skeleton } from "./index";

const rules = compiledModuleRules("src/components/Skeleton/Skeleton.module.scss");
const styleRules = (list: CSSRule[]) =>
  list.filter((rule): rule is CSSStyleRule => rule.type === CSSRule.STYLE_RULE);
const reducedMotionRules = rules
  .filter((rule): rule is CSSMediaRule => rule.type === CSSRule.MEDIA_RULE)
  .filter((rule) => rule.conditionText.includes("prefers-reduced-motion: reduce"))
  .flatMap((rule) => styleRules(Array.from(rule.cssRules)));

/** The base declaration of `.className` outside any at-rule, merged in source order. */
function baseStyle(className: string, property: string): string {
  const matching = styleRules(rules).filter((rule) =>
    rule.selectorText.split(",").some((part) => part.trim() === `.${className}`)
  );
  return (
    matching
      .map((rule) => rule.style.getPropertyValue(property))
      .filter(Boolean)
      .at(-1) ?? ""
  );
}

function reducedMotionStyle(className: string, property: string): string {
  const matching = reducedMotionRules.filter((rule) =>
    rule.selectorText.split(",").some((part) => part.trim() === `.${className}`)
  );
  return (
    matching
      .map((rule) => rule.style.getPropertyValue(property))
      .filter(Boolean)
      .at(-1) ?? ""
  );
}

describe("Skeleton", () => {
  it('renders with aria-hidden="true"', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("applies shape classes", () => {
    const { container: c1 } = render(<Skeleton shape="text" />);
    expect(c1.firstElementChild).toHaveClass("text");

    const { container: c2 } = render(<Skeleton shape="avatar" />);
    expect(c2.firstElementChild).toHaveClass("avatar", "avatar-md");

    const { container: c3 } = render(<Skeleton shape="control" />);
    expect(c3.firstElementChild).toHaveClass("control", "control-md");
  });

  it.each(["sm", "md", "lg"] as const)("applies the %s size to the control track", (size) => {
    const { container } = render(<Skeleton shape="control" size={size} />);
    expect(container.firstElementChild).toHaveClass(`control-${size}`);
  });

  it("sizes the avatar square from Avatar's xs, sm and md", () => {
    expect(baseStyle("avatar-sm", "inline-size")).toContain("--fui-avatar-size-xs");
    expect(baseStyle("avatar-md", "inline-size")).toContain("--fui-avatar-size-sm");
    expect(baseStyle("avatar-lg", "inline-size")).toContain("--fui-avatar-size-md");
    expect(baseStyle("avatar", "border-radius")).toBe("");
    expect(baseStyle("skeleton", "border-radius")).toContain("--fui-radius-indicator");
  });

  it("draws a 10px text bar, a 12px heading bar and the control radius", () => {
    expect(baseStyle("text", "block-size")).toContain("--fui-raw-space-10");
    expect(baseStyle("textLine", "block-size")).toContain("--fui-raw-space-10");
    expect(baseStyle("heading", "block-size")).toContain("--fui-raw-space-12");
    expect(baseStyle("control", "border-radius")).toContain("--fui-radius-control");
  });

  it("renders a row as the row track holding one bar", () => {
    const { container } = render(<Skeleton shape="row" width="60%" />);
    const row = container.firstElementChild as HTMLElement;
    expect(row).toHaveClass("row");
    expect(row).toHaveAttribute("aria-hidden", "true");
    const bar = row.firstElementChild as HTMLElement;
    expect(bar).toHaveClass("skeleton", "text");
    expect(bar.style.width).toBe("60%");
    expect(baseStyle("row", "block-size")).toContain("--fui-control-height-md");
  });

  it("applies custom dimensions via style", () => {
    const { container } = render(<Skeleton width={200} height={100} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("200px");
    expect(el.style.height).toBe("100px");
  });

  it("applies fill class", () => {
    const { container } = render(<Skeleton fill />);
    expect(container.firstElementChild).toHaveClass("fill");
  });

  it("renders Skeleton.Text with multiple lines", () => {
    const { container } = render(<Skeleton.Text lines={4} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    const lines = container.querySelectorAll(".textLine");
    expect(lines).toHaveLength(4);
  });

  describe("motion", () => {
    it("animates only with keyframes the stylesheet defines", () => {
      const defined = rules
        .filter((rule): rule is CSSKeyframesRule => rule.type === CSSRule.KEYFRAMES_RULE)
        .map((rule) => rule.name);
      const used = [...styleRules(rules), ...reducedMotionRules]
        .map((rule) => rule.style.getPropertyValue("animation").split(" ")[0])
        .filter((name) => name && name !== "none");

      expect(defined).toEqual(["fui-skeleton-pulse"]);
      expect(used.length).toBeGreaterThan(0);
      for (const name of used) expect(defined).toContain(name);
    });

    it("pulses Skeleton.Text lines like the base skeleton: the band, the press tint over it", () => {
      expect(baseStyle("skeleton", "background-color")).toContain("var(--fui-bg-secondary");
      expect(baseStyle("skeleton::after", "background-color")).toContain("var(--fui-bg-active");
      expect(baseStyle("skeleton::after", "animation")).toMatch(/^fui-skeleton-pulse /);
      expect(baseStyle("skeleton::after", "animation")).toContain("alternate");
      expect(baseStyle("textLine::after", "animation")).toBe(
        baseStyle("skeleton::after", "animation")
      );
      expect(baseStyle("textLine", "background-color")).toBe(
        baseStyle("skeleton", "background-color")
      );
      // No gradient and nothing travelling: only the tint's opacity moves.
      for (const rule of styleRules(rules)) {
        expect(rule.style.getPropertyValue("background-image")).not.toContain("gradient");
      }
    });

    it("holds Skeleton and Skeleton.Text still under reduced motion", () => {
      for (const className of ["skeleton", "textLine"]) {
        expect(reducedMotionStyle(`${className}::after`, "animation")).toBe("none");
        expect(reducedMotionStyle(`${className}::after`, "opacity")).toBe("0");
      }
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Skeleton shape="text" />
        <Skeleton shape="avatar" />
        <Skeleton.Text lines={3} />
      </div>
    );
    await expectNoA11yViolations(container);
  });

  it("forwards DOM props on Skeleton and Skeleton.Text", () => {
    const { container } = render(
      <div>
        <Skeleton data-testid="sk" id="skeleton-root" />
        <Skeleton.Text data-testid="sk-text" id="skeleton-text" lines={2} />
      </div>
    );

    expect(container.querySelector("#skeleton-root")).toHaveAttribute("data-testid", "sk");
    expect(container.querySelector("#skeleton-text")).toHaveAttribute("data-testid", "sk-text");
  });
});
