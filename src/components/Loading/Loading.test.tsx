import { describe, it, expect, vi, afterEach } from "vitest";
import { act } from "@testing-library/react";
import { compiledModuleRules } from "../../test/compiled-css";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Loading } from "./index";

const rules = compiledModuleRules("src/components/Loading/Loading.module.scss");
const styleRules = (list: CSSRule[]) =>
  list.filter((rule): rule is CSSStyleRule => rule.type === CSSRule.STYLE_RULE);

function declared(className: string, property: string) {
  return styleRules(rules)
    .filter((rule) => rule.selectorText.split(",").some((part) => part.trim() === `.${className}`))
    .map((rule) => rule.style.getPropertyValue(property))
    .filter(Boolean);
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Loading", () => {
  it('renders a status named "Loading…" by default', () => {
    render(<Loading delay={0} />);
    expect(screen.getByRole("status", { name: "Loading…" })).toBeInTheDocument();
  });

  it("shows nothing for the first second, then the spinner and its words", () => {
    vi.useFakeTimers();
    const { container } = render(<Loading label="Loading findings" />);
    const status = screen.getByRole("status", { name: "Loading findings" });
    expect(container.querySelector("svg")).toBeNull();
    expect(status).toHaveTextContent("");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.querySelector("svg")).not.toBeNull();
    expect(status).toHaveTextContent("Loading findings");
  });

  it("shows at once with delay={0}", () => {
    const { container } = render(<Loading delay={0} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("takes the surrounding ink and one 16px size", () => {
    expect(declared("loading", "color")).toContain("currentColor");
    expect(declared("loading", "--_fui-loading-size").join(" ")).toContain("--fui-icon-md");
    expect(declared("inline", "--_fui-loading-size")).toContain("1em");
  });

  it("turns on the spin token and is never stopped under reduced motion", () => {
    const animation = declared("spinner", "animation").join(" ");
    expect(animation).toContain("fui-loading-spin");
    expect(animation).toContain("--fui-duration-spin");
  });

  it("inline and fill set their classes", () => {
    const { rerender } = render(<Loading delay={0} inline />);
    expect(screen.getByRole("status").className).toMatch(/inline/);
    rerender(<Loading delay={0} fill />);
    expect(screen.getByRole("status").className).toMatch(/fill/);
  });

  it("Loading.Screen is one status on the canvas and can show its label", () => {
    render(<Loading.Screen delay={0} label="Opening the workspace" showLabel />);
    const status = screen.getByRole("status", { name: "Opening the workspace" });
    expect(status).toHaveTextContent("Opening the workspace");
    expect(declared("screen", "background-color").join(" ")).toContain("--fui-app-canvas-bg");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Loading delay={0} label="Loading findings" />);
    await expectNoA11yViolations(container);
  });
});
