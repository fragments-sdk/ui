import { createHash } from "node:crypto";
import symbol from "./fragments-symbol.json";
import { describe, expect, it } from "vitest";
import { render, screen } from "../test/utils";
import { FragmentsLogo, fragmentsLogoSvg } from "./fragments-logo";

describe("FragmentsLogo", () => {
  it("preserves the supplied connected symbol exactly", () => {
    // Golden geometry from the user's fragments-solid.svg, including (86, 100).
    // Optical sizing must change framing/strokes, never disconnect these paths.
    expect(createHash("sha256").update(symbol.paths.join("\n")).digest("hex")).toBe(
      "5edf13069b2820c7bf34820a2fb06d8ac6e3496f51fecad3889013168c38268e"
    );
  });

  it("inherits color and exposes one accessible name", () => {
    const { container } = render(<FragmentsLogo className="brand" />);
    expect(screen.getByRole("img", { name: "Fragments" })).toHaveAttribute("fill", "currentColor");
    expect(screen.getByRole("img")).toHaveClass("brand");
    expect(container.querySelectorAll("path")).toHaveLength(3);
  });

  it("tightens small solid framing without changing the original connected geometry", () => {
    const { rerender } = render(<FragmentsLogo size={16} />);
    const small = screen.getByRole("img").innerHTML;
    rerender(<FragmentsLogo size={24} />);
    expect(screen.getByRole("img").innerHTML).toBe(small);
    rerender(<FragmentsLogo size={48} variant="outline" />);
    expect(screen.getByRole("img").innerHTML).toBe(small);
    expect(screen.getByRole("img")).toHaveAttribute("fill", "none");
    expect(screen.getByRole("img")).toHaveAttribute("stroke", "currentColor");
  });

  it("exports a self-contained SVG without fonts or external assets", () => {
    const svg = new DOMParser().parseFromString(fragmentsLogoSvg, "image/svg+xml");
    expect(svg.querySelector("parsererror, text, image, script, foreignObject")).toBeNull();
    expect(svg.querySelectorAll("path")).toHaveLength(3);
  });
});
