import * as sass from "sass";
import { describe, expect, it } from "vitest";

function compile(source: string): string {
  return sass.compileString(source, { loadPaths: [`${process.cwd()}/src`], style: "expanded" }).css;
}

describe("geometry recipes", () => {
  it("compiles the fixed action ladder and governed typography", () => {
    const css = compile(`
      @use "recipes/action";
      .micro { @include action.size("micro"); }
      .sm { @include action.icon-only("sm"); }
      .md svg { @include action.glyph("md"); }
      .lg { @include action.size("lg"); }
    `);

    expect(css).toContain("--_fui-action-track: var(--fui-control-track-micro, 24px)");
    expect(css).toContain("--_fui-action-track: var(--fui-control-track-sm, 28px)");
    expect(css).toContain("inline-size: var(--fui-icon-md, 16px)");
    expect(css).toContain("--_fui-action-track: var(--fui-control-track-lg, 40px)");
    expect(css).toContain("--_fui-action-type-size: var(--fui-type-ui-standard-size, 14px)");
  });

  it("compiles fixed field tracks, insets, stroke, and type roles", () => {
    const css = compile(`
      @use "recipes/field";
      .sm { @include field.size("sm"); @include field.shell; }
      .md { @include field.size("md"); @include field.shell; }
      .lg { @include field.size("lg"); @include field.shell; }
    `);

    expect(css).toContain("--_fui-field-track: var(--fui-field-track-sm, 28px)");
    expect(css).toContain("--_fui-field-inline-inset: var(--fui-field-inline-inset-md, 12px)");
    expect(css).toContain("--_fui-field-track: var(--fui-field-track-lg, 40px)");
    expect(css).toContain("--_fui-field-stroke: var(--fui-stroke-hairline, 1px)");
  });

  it("compiles non-layout hit areas and coarse-pointer popup rows", () => {
    const css = compile(`
      @use "recipes/target";
      @use "recipes/popup";
      .target { @include target.hit-area("compact"); }
      .popup { @include popup.container; @include popup.viewport; }
      .row { @include popup.row; }
    `);

    expect(css).toContain("--_fui-target-hit-size: var(--fui-control-track-md, 32px)");
    expect(css).toContain("pointer-events: auto");
    expect(css).toContain("--fui-popup-row-pitch: var(--fui-raw-space-32, 32px)");
    expect(css).toContain("@media (pointer: coarse)");
    expect(css).toContain("--_fui-popup-effective-row-pitch: var(--fui-raw-space-48, 48px)");
  });

  it.each([
    ['@use "recipes/action"; .x { @include action.size("xl"); }', "Unknown action role"],
    ['@use "recipes/field"; .x { @include field.size("xs"); }', "Unknown field size"],
    ['@use "recipes/target"; .x { @include target.hit-area("small"); }', "Unknown hit-target role"],
  ])("rejects an unsupported closed recipe role", (source, message) => {
    expect(() => compile(source)).toThrow(message);
  });
});
