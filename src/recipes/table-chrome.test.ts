import { resolve } from "node:path";

import * as sass from "sass";
import { describe, expect, it } from "vitest";
import { MEASUREMENT_PROFILES, measurementPx } from "../measurements";
import { resolveTableDensity, resolveTableRowTrack, TABLE_ROW_TRACKS } from "./table-chrome";

const compiledStyles = sass.compileString(
  '@use "table-chrome"; .fixture { @include table-chrome.root; @include table-chrome.density("regular"); }',
  { loadPaths: [resolve(process.cwd(), "src/recipes")], style: "expanded" }
).css;

describe("table chrome", () => {
  it.each([
    ["compact", 32],
    ["regular", 40],
    ["relaxed", 48],
  ] as const)("uses the generated %s row track", (density, step) => {
    const expected = measurementPx(MEASUREMENT_PROFILES.rawSpace[step], `rawSpace.${step}`);
    expect(TABLE_ROW_TRACKS[density]).toBe(expected);
    expect(resolveTableRowTrack(density)).toBe(expected);
  });

  it("resolves aliases and gives explicit density precedence", () => {
    expect(resolveTableDensity({})).toBe("regular");
    expect(resolveTableDensity({ size: "sm" })).toBe("compact");
    expect(resolveTableDensity({ size: "compact" })).toBe("compact");
    expect(resolveTableDensity({ size: "md" })).toBe("regular");
    expect(resolveTableDensity({ density: "condensed", size: "md" })).toBe("compact");
    expect(resolveTableDensity({ density: "relaxed", size: "sm" })).toBe("relaxed");
  });

  it("compiles one generated property vocabulary", () => {
    expect(compiledStyles).toContain(
      "--fui-table-row-track-compact: var(--fui-raw-space-32, 32px)"
    );
    expect(compiledStyles).toContain(
      "--fui-table-row-track-regular: var(--fui-raw-space-40, 40px)"
    );
    expect(compiledStyles).toContain(
      "--fui-table-row-track-relaxed: var(--fui-raw-space-48, 48px)"
    );
    expect(compiledStyles).toContain("--_fui-table-row-track: var(--fui-table-row-track-regular)");
  });
});
