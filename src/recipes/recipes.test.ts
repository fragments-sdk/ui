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

  it("compiles boolean marks, card rows, switches, and range anatomy", () => {
    const css = compile(`
      @use "recipes/boolean-range" as boolean;
      .checkbox { @include boolean.row("sm"); @include boolean.mark("sm"); }
      .card { @include boolean.card("lg"); }
      .switch { @include boolean.switch-track("md"); }
      .rail { @include boolean.slider-track; }
      .thumb { @include boolean.slider-thumb; }
    `);

    expect(css).toContain("--_fui-boolean-mark-size: var(--fui-icon-sm, 14px)");
    expect(css).toContain("min-block-size: var(--fui-field-track-lg, 40px)");
    expect(css).toContain("--_fui-switch-inline-size: var(--fui-control-track-md, 32px)");
    expect(css).toContain(
      "--_fui-switch-block-size: calc(var(--fui-raw-space-16, 16px) + var(--fui-raw-space-2, 2px))"
    );
    expect(css).toContain("--_fui-switch-thumb-size: var(--fui-icon-sm, 14px)");
    expect(css).toContain("block-size: var(--fui-raw-space-4, 4px)");
    expect(css).toContain("inline-size: var(--fui-icon-md, 16px)");
  });

  it("compiles fixed navigation rows and optical anatomy", () => {
    const css = compile(`
      @use "recipes/navigation";
      .row { @include navigation.row; }
      .section { @include navigation.section-row; }
      .leading { @include navigation.leading; }
      .active { @include navigation.active-indicator("end"); }
      .collapsed { @include navigation.collapsed-shell; }
    `);

    expect(css).toContain("--fui-navigation-row-track: var(");
    expect(css).toContain("--fui-control-track-md");
    expect(css).toContain("--fui-navigation-gutter: var(--fui-navigation-sidebar-gutter, 8px)");
    expect(css).toContain("min-block-size: var(--fui-navigation-row-track)");
    expect(css).toContain("inline-size: var(--fui-navigation-leading-box)");
    expect(css).toContain("inline-size: var(--fui-navigation-active-dot)");
    expect(css).toContain("inline-size: var(--fui-navigation-sidebar-collapsed-width, 56px)");
  });

  it("compiles the closed surface inset roles", () => {
    const css = compile(`
      @use "recipes/surface";
      .panel { @include surface.apply-inset("panel"); }
      .compact { @include surface.apply-inset("compact"); }
      .default { @include surface.apply-inset("default"); }
      .roomy { @include surface.apply-inset("roomy"); }
    `);

    expect(css).toContain("padding: var(--fui-surface-inset-panel, 0)");
    expect(css).toContain("padding: var(--fui-surface-inset-compact, 12px)");
    expect(css).toContain("padding: var(--fui-surface-inset-default, 16px)");
    expect(css).toContain("padding: var(--fui-surface-inset-roomy, 24px)");
  });

  it.each([
    ['@use "recipes/action"; .x { @include action.size("xl"); }', "Unknown action role"],
    ['@use "recipes/field"; .x { @include field.size("xs"); }', "Unknown field size"],
    ['@use "recipes/target"; .x { @include target.hit-area("small"); }', "Unknown hit-target role"],
    [
      '@use "recipes/boolean-range" as boolean; .x { @include boolean.mark("xl"); }',
      "Unknown boolean size",
    ],
    [
      '@use "recipes/navigation"; .x { @include navigation.active-indicator("middle"); }',
      "Unknown navigation indicator placement",
    ],
    [
      '@use "recipes/surface"; .x { @include surface.apply-inset("hero"); }',
      "Unknown surface inset role",
    ],
  ])("rejects an unsupported closed recipe role", (source, message) => {
    expect(() => compile(source)).toThrow(message);
  });
});
