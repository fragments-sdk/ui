import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { VisuallyHidden } from "./index";

const visuallyHiddenStyles = readFileSync(
  resolve(process.cwd(), "src/components/VisuallyHidden/VisuallyHidden.module.scss"),
  "utf8"
);
const sharedMixins = readFileSync(resolve(process.cwd(), "src/tokens/_mixins.scss"), "utf8");

describe("VisuallyHidden", () => {
  it("renders content that is accessible to screen readers", () => {
    render(<VisuallyHidden>Hidden label</VisuallyHidden>);
    expect(screen.getByText("Hidden label")).toBeInTheDocument();
  });

  it("applies visually hidden class", () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    expect(screen.getByText("Hidden")).toHaveClass("visuallyHidden");
  });

  it("renders as a different element via " as " prop", () => {
    render(<VisuallyHidden as="div">Hidden</VisuallyHidden>);
    expect(screen.getByText("Hidden").tagName).toBe("DIV");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<VisuallyHidden ref={ref}>Hidden</VisuallyHidden>);
    expect(ref).toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<VisuallyHidden>Accessible hidden text</VisuallyHidden>);
    await expectNoA11yViolations(container);
  });

  it("forwards DOM props and composes className", () => {
    render(
      <VisuallyHidden data-testid="vh" id="vh-id" className="extra">
        Hidden
      </VisuallyHidden>
    );
    const el = screen.getByTestId("vh");
    expect(el).toHaveAttribute("id", "vh-id");
    expect(el).toHaveClass("visuallyHidden");
    expect(el).toHaveClass("extra");
  });

  it("composes the shared visually-hidden mixin instead of a hand-rolled clip box", () => {
    expect(visuallyHiddenStyles).toContain("@include visually-hidden;");
    expect(visuallyHiddenStyles).not.toContain("clip-path: inset(50%)");
    const mixin = sharedMixins.slice(sharedMixins.indexOf("@mixin visually-hidden {"));
    expect(mixin.slice(0, mixin.indexOf("\n}\n"))).toContain("clip-path: inset(50%);");
    expect(visuallyHiddenStyles).not.toContain("1px");
    expect(visuallyHiddenStyles).not.toContain("fragments-allow");
  });

  it("marks a focusable reveal and keeps it hidden until focus arrives", () => {
    render(
      <VisuallyHidden focusable data-testid="skip">
        <a href="#main">Skip to main content</a>
      </VisuallyHidden>
    );
    const host = screen.getByTestId("skip");
    expect(host).toHaveClass("visuallyHidden", "focusable");
    screen.getByRole("link", { name: "Skip to main content" }).focus();
    expect(host).toContainElement(document.activeElement as HTMLElement);
  });

  it("reveals the focusable chip as the floating surface: raised, shadow, no edge", () => {
    const reveal = visuallyHiddenStyles.slice(
      visuallyHiddenStyles.indexOf(".focusable:focus-within")
    );
    expect(reveal).toContain("@include overlay.surface;");
    expect(reveal).not.toMatch(/\bborder:/);
    expect(reveal).toContain("clip-path: none;");
    expect(reveal).toContain("var(--fui-control-height-md");
    expect(reveal).toContain("var(--fui-radius-control");
    expect(reveal).toContain('@include typography.role("ui-standard");');
    expect(reveal).toContain("@include focus.ring;");
  });

  it("does not mark the plain form as focusable", () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    expect(screen.getByText("Hidden")).not.toHaveClass("focusable");
  });
});
