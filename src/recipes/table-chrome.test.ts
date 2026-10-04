import { resolve } from "node:path";

import * as sass from "sass";
import { describe, expect, it } from "vitest";
import { MEASUREMENT_PROFILES, measurementPx } from "../measurements";
import { TABLE_ROW_TRACK } from "./table-chrome";

const compiledStyles = sass.compileString(
  '@use "table-chrome"; .fixture { @include table-chrome.root; } .row { @include table-chrome.row; }',
  { loadPaths: [resolve(process.cwd(), "src/recipes")], style: "expanded" }
).css;

describe("table chrome", () => {
  it("uses the control track as the one row track", () => {
    expect(TABLE_ROW_TRACK).toBe(
      measurementPx(MEASUREMENT_PROFILES.targets.controlTrack.md, "targets.controlTrack.md")
    );
    expect(TABLE_ROW_TRACK).toBe(32);
  });

  it("compiles one track and no density channels", () => {
    expect(compiledStyles).toContain("--fui-table-row-track: var(--fui-control-height-md, 32px)");
    expect(compiledStyles).not.toMatch(/-(compact|regular|relaxed)\b(?!-)|--_fui-table/);
    expect(compiledStyles).toMatch(
      /height: max\(var\(--fui-table-row-track, var\(--fui-control-height-md, 32px\)\), var\(--fui-hit-area, 24px\)\)/
    );
  });
});
