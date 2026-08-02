import { resolve } from "node:path";

import * as sass from "sass";
import { describe, expect, it } from "vitest";
import { MEASUREMENT_PROFILES, measurementPx } from "../../measurements";
import { render, screen } from "../../test/utils";
import {
  CIRCULAR_PROGRESS_GEOMETRY,
  resolveCircularStrokeWidth,
  type ProgressSize,
} from "./geometry";
import { CircularProgress } from "./index";

const compiledStyles = sass.compile(
  resolve(process.cwd(), "src/components/Progress/Progress.module.scss"),
  { style: "expanded" }
).css;

describe("Progress geometry", () => {
  it.each([
    ["sm", 32],
    ["md", 48],
    ["lg", 64],
  ] as const)("uses the generated raw-space diameter for %s", (size, step) => {
    expect(CIRCULAR_PROGRESS_GEOMETRY[size].diameter).toBe(
      measurementPx(MEASUREMENT_PROFILES.rawSpace[step], `rawSpace.${step}`)
    );
  });

  it("accepts positive custom strokes, rejects invalid values, and clamps oversized strokes", () => {
    const geometry = CIRCULAR_PROGRESS_GEOMETRY.md;

    expect(resolveCircularStrokeWidth(geometry)).toBe(geometry.strokeWidth);
    expect(resolveCircularStrokeWidth(geometry, Number.NaN)).toBe(geometry.strokeWidth);
    expect(resolveCircularStrokeWidth(geometry, 0)).toBe(geometry.strokeWidth);
    expect(resolveCircularStrokeWidth(geometry, 6)).toBe(6);
    expect(resolveCircularStrokeWidth(geometry, geometry.diameter)).toBe(geometry.diameter / 2);
  });

  it.each(["sm", "md", "lg"] as const)(
    "keeps the %s root, SVG, radius, and circumference on one generated system",
    (size: ProgressSize) => {
      const geometry = CIRCULAR_PROGRESS_GEOMETRY[size];
      const { container } = render(<CircularProgress size={size} value={50} />);
      const root = screen.getByRole("progressbar");
      const svg = container.querySelector("svg");
      const indicator = container.querySelector("circle[class*='circularIndicator']");
      const radius = (geometry.diameter - geometry.strokeWidth) / 2;

      expect(root.style.getPropertyValue("--_progress-diameter")).toBe(`${geometry.diameter}px`);
      expect(svg).toHaveAttribute("viewBox", `0 0 ${geometry.diameter} ${geometry.diameter}`);
      expect(indicator).toHaveAttribute("r", String(radius));
      expect(indicator).toHaveAttribute("stroke-width", String(geometry.strokeWidth));
      expect(indicator).toHaveAttribute("stroke-dasharray", String(2 * Math.PI * radius));
    }
  );

  it("binds circular sizing and indeterminate animation to private runtime properties", () => {
    expect(compiledStyles).toContain("inline-size: var(--_progress-diameter)");
    expect(compiledStyles).toContain("block-size: var(--_progress-diameter)");
    expect(compiledStyles).toContain("stroke-dashoffset: var(--_progress-dash-full)");
    expect(compiledStyles).toContain("stroke-dashoffset: var(--_progress-dash-quarter)");
    expect(compiledStyles).not.toContain("!important");
    expect(compiledStyles).not.toContain("[data-complete]");
  });
});
