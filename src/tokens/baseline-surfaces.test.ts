import * as sass from "sass";
import { describe, expect, it } from "vitest";

function compileDefaultSurfaceTokens(): string {
  return sass.compileString(
    `
      @use "tokens/variables" as tokens;
      @include tokens.fui-css-variables;
    `,
    { loadPaths: [`${process.cwd()}/src`], style: "expanded" }
  ).css;
}

const THEMED = ":where(:root, [data-fui-theme]) {";
const ENGINE = "@supports (color: oklch(from red l c h)) {";

/** The declarations of the first block that opens with `opener`. */
function block(css: string, opener: string): string {
  const start = css.indexOf(opener);
  expect(start, `missing ${opener}`).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let index = start + opener.length - 1; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(start, index + 1);
  }
  throw new Error(`unclosed ${opener}`);
}

const plane = (light: [number, number], dark: [number, number]) =>
  `light-dark(oklch(from var(--fui-seed-neutral) ${light[0]} calc(min(c, 0.04) * ${light[1]}) h), ` +
  `oklch(from var(--fui-seed-neutral) ${dark[0]} calc(min(c, 0.04) * ${dark[1]}) h))`;

describe("default Fragments surface tokens", () => {
  const css = compileDefaultSurfaceTokens();
  const root = block(css, ":root {");
  const themed = block(css, THEMED);
  const engine = block(css, ENGINE);

  it("declares the L0 inputs once, on :root, at the Glass default", () => {
    // The library never sets the root font size (UIR-D65).
    expect(root).not.toMatch(/^\s*font-size:/m);
    expect(root).toContain("--fui-seed-brand: #3d5ae8;");
    expect(root).toContain("--fui-seed-neutral: oklch(50% 0.012 80deg);");
    expect(root).toContain("--fui-seed-danger: #d13d1f;");
    expect(root).toContain("--fui-seed-success: #2fbf8f;");
    expect(root).toContain("--fui-seed-warning: #f2a100;");
    expect(root).toContain("--fui-seed-info: oklch(58% 0.13 245deg);");
    expect(root).toContain("--fui-radius: 5px;");
    expect(root).toContain("--fui-scale: 1;");
    expect(themed).not.toMatch(/^\s*--fui-seed-[a-z]+:/m);
    // Constants no input reaches are declared once, on :root.
    expect(root).toContain("--fui-base-font-size: 16px;");
    // v4 cut the legacy type-size aliases; the type roles are the only size names.
    expect(css).not.toMatch(/--fui-font-size-[a-z0-9]+:/);
  });

  it("derives the planes, inks and lines from the neutral at the Glass steps", () => {
    expect(engine).toContain(`--fui-body-bg: ${plane([0.97, 0.35], [0.182, 0.2])};`);
    expect(engine).toContain(`--fui-bg-secondary: ${plane([0.95, 0.4], [0.248, 0.2])};`);
    expect(engine).toContain(`--fui-bg-primary: ${plane([0.998, 0.1], [0.214, 0.2])};`);
    expect(engine).toContain(`--fui-bg-elevated: ${plane([0.998, 0.1], [0.268, 0.33])};`);
    expect(engine).toContain(`--fui-text-primary: ${plane([0.216, 0.6], [0.935, 1.05])};`);
    expect(engine).toContain(`--fui-text-secondary: ${plane([0.415, 0.9], [0.768, 1.15])};`);
    expect(engine).toContain(`--fui-text-tertiary: ${plane([0.498, 1.15], [0.668, 1.2])};`);
    expect(engine).toContain(`--fui-border: ${plane([0.905, 0.6], [0.286, 0.4])};`);
    expect(engine).toContain(`--fui-border-strong: ${plane([0.86, 0.8], [0.33, 0.55])};`);
    expect(engine).toContain(`--fui-field-border: ${plane([0.62, 1.15], [0.545, 1])};`);
  });

  it("gives every engine role a literal light and dark twin outside @supports", () => {
    for (const name of [
      "body-bg",
      "bg-secondary",
      "bg-primary",
      "bg-elevated",
      "text-primary",
      "field-border",
      "control-checked-bg",
      "focus-ring-color",
      "color-accent-text",
    ]) {
      expect(themed).toMatch(
        new RegExp(`--fui-${name}: light-dark\\(#[0-9a-f]{6}, #[0-9a-f]{6}\\);`)
      );
    }
    expect(themed).toMatch(/--fui-color-on-accent: #ffffff;/);
  });

  it("names the canvas and field roles on the four planes and ships no retired plane", () => {
    for (const [role, target] of [
      ["app-canvas-bg", "body-bg"],
      ["bg-inverse", "text-primary"],
      ["text-inverse", "bg-primary"],
    ]) {
      expect(themed).toContain(`--fui-${role}: var(--fui-${target});`);
    }
    // A field is the surface in light and the band in dark.
    expect(themed).toContain(
      "--fui-field-bg: light-dark(var(--fui-bg-primary), var(--fui-bg-secondary));"
    );
    // v4 hard cut: the retired planes and per-component plane hooks are gone.
    for (const removed of [
      "main-bg",
      "bg-tertiary",
      "bg-subtle",
      "border-default",
      "border-subtle",
      "app-main-bg",
      "app-sidebar-bg",
      "card-accent-bg",
      "card-header-bg",
      "code-bg",
    ]) {
      expect(css).not.toContain(`--fui-${removed}:`);
    }
  });

  it("steps hover and press in ink 1 and washes selection at 12% with a selection ring", () => {
    expect(themed).toMatch(
      /--fui-bg-hover: light-dark\(\s*color-mix\(in oklab, var\(--fui-text-primary\) 6%, transparent\),\s*color-mix\(in oklab, var\(--fui-text-primary\) 4\.5%, transparent\)\s*\)/
    );
    expect(themed).toMatch(
      /--fui-bg-active: light-dark\(\s*color-mix\(in oklab, var\(--fui-text-primary\) 11%, transparent\),\s*color-mix\(in oklab, var\(--fui-text-primary\) 8%, transparent\)\s*\)/
    );
    expect(themed).toMatch(
      /--fui-control-selected-bg: color-mix\(\s*in oklab,\s*var\(--fui-control-checked-bg\) 12%,\s*transparent\s*\)/
    );
    // A neutral ring at 3:1: the accent ring is focus's alone (UIR-D152).
    expect(themed).toContain("--fui-control-selected-border: var(--fui-field-border)");
    expect(themed).toContain("--fui-opacity-disabled: 0.45");
    expect(css).not.toContain("--fui-header-search-bg:");
    expect(themed).toContain("--fui-field-selection-bg: var(--fui-control-selected-bg)");
    // The sidebar's current row takes the selection wash and no ring (UIR-D152).
    expect(themed).toContain("--fui-sidebar-item-active-bg: var(--fui-control-selected-bg)");
    expect(themed).toContain("--fui-sidebar-item-active-border: transparent");
    expect(themed).toContain("--fui-table-row-selected-border: var(--fui-control-selected-border)");
    expect(themed).toContain("--fui-table-row-selected-bg: var(--fui-control-selected-bg)");
    expect(themed).toContain("--fui-link-ink: var(--fui-color-accent-text)");
    expect(css).not.toContain("--fui-bg-highlight");
  });

  it("derives the radius roles and control heights from --fui-radius and --fui-scale", () => {
    expect(themed).toContain(
      "--fui-radius-control: min(var(--fui-radius), var(--fui-control-height-md) / 2);"
    );
    expect(themed).toContain("--fui-radius-popup: min(var(--fui-radius) * 2.4, 18px);");
    expect(themed).toContain("--fui-control-height-md: calc(var(--fui-scale, 1) * 2rem);");
    expect(css).not.toMatch(/--fui-(?:control-track-[a-z]+|input-height(?:-[a-z]+)?):/);
    expect(css).not.toMatch(/--fui-radius-(?:sm|md|lg|xl):/);
  });
});
