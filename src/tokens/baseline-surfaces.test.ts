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

describe("default Fragments surface tokens", () => {
  it("emits mirrored light and dark neutral roles from the shared library", () => {
    const css = compileDefaultSurfaceTokens();

    expect(css).toMatch(/font-size: 14px;\s+--fui-base-font-size: 14px;/);
    expect(css).toContain("--fui-bg-primary: light-dark(#faf8f5, #171614)");
    expect(css).toContain("--fui-bg-secondary: light-dark(#faf8f5, #171614)");
    expect(css).toContain("--fui-bg-tertiary: light-dark(#f2ede7, #1e1c19)");
    expect(css).toContain("--fui-bg-elevated: light-dark(#ffffff, #262421)");
    expect(css).toContain("--fui-bg-subtle: light-dark(#fdfcfa, #1b1a17)");
    // Interaction ladder: ink alpha in both themes, dark two points stronger.
    expect(css).toMatch(
      /--fui-bg-hover: light-dark\(\s*color-mix\(in srgb, var\(--fui-text-primary\) 7%, transparent\),\s*color-mix\(in srgb, var\(--fui-text-primary\) 9%, transparent\)\s*\)/
    );
    expect(css).toMatch(
      /--fui-control-selected-bg: light-dark\(\s*color-mix\(in srgb, var\(--fui-text-primary\) 12%, transparent\),\s*color-mix\(in srgb, var\(--fui-text-primary\) 14%, transparent\)\s*\)/
    );
    expect(css).toMatch(
      /--fui-bg-active: light-dark\(\s*color-mix\(in srgb, var\(--fui-text-primary\) 14%, transparent\),\s*color-mix\(in srgb, var\(--fui-text-primary\) 16%, transparent\)\s*\)/
    );
    expect(css).not.toContain("--fui-bg-highlight");
    expect(css).toContain("--fui-body-bg: light-dark(#faf8f5, #171614)");
    expect(css).toContain("--fui-main-bg: light-dark(#faf8f5, #171614)");
    expect(css).toContain("--fui-code-bg: light-dark(#f2ede7, #1e1c19)");
    // Rail recessed, reading sheet raised, in both themes (DRG-D50, 2026-09-03).
    expect(css).toContain("--fui-app-main-bg: var(--fui-body-bg)");
    expect(css).toContain("--fui-app-sidebar-bg: var(--fui-bg-tertiary)");
    // The earned-moment capsule sits in the tertiary well, not on an
    // elevated white plane (lifted-verdict direction, 2026-08-22).
    expect(css).toContain("--fui-card-accent-bg: var(--fui-bg-tertiary)");
    expect(css).toContain("--fui-card-header-bg: var(--fui-bg-subtle)");
    expect(css).toContain("--fui-header-search-bg: var(--fui-bg-hover)");
    expect(css).toContain("--fui-field-selection-bg: var(--fui-control-selected-bg)");
    expect(css).toContain("--fui-sidebar-item-active-bg: var(--fui-control-selected-bg)");
    expect(css).toContain("--fui-table-row-selected-bg: var(--fui-control-selected-bg)");
    expect(css).toContain("--fui-control-selected-border: transparent");
    expect(css).toContain("--fui-control-checked-bg: var(--fui-color-accent)");
    expect(css).toContain("--fui-control-checked-bg-hover: var(--fui-color-accent-hover)");
    expect(css).toContain("--fui-control-checked-color: var(--fui-color-on-accent)");
  });
});
