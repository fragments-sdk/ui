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

    expect(css).toContain("--fui-bg-primary: light-dark(#faf8f5, #171614)");
    expect(css).toContain("--fui-bg-secondary: light-dark(#faf8f5, #171614)");
    expect(css).toContain("--fui-bg-tertiary: light-dark(#f2ede7, #1e1c19)");
    expect(css).toContain("--fui-bg-elevated: light-dark(#ffffff, #262421)");
    expect(css).toContain("--fui-bg-subtle: light-dark(#fdfcfa, #1b1a17)");
    expect(css).toContain("--fui-bg-hover: light-dark(rgba(96, 48, 16, 0.06), #2a2723)");
    expect(css).toContain("--fui-bg-active: light-dark(rgba(96, 48, 16, 0.1), #322e29)");
    expect(css).toContain("--fui-body-bg: light-dark(#faf8f5, #171614)");
    expect(css).toContain("--fui-main-bg: light-dark(#faf8f5, #171614)");
    expect(css).toContain("--fui-code-bg: light-dark(#1d1c1a, #121110)");
    expect(css).toContain("--fui-card-header-bg: var(--fui-bg-subtle)");
    expect(css).toContain("--fui-header-search-bg: var(--fui-bg-hover)");
    expect(css).toContain("--fui-field-selection-bg: var(--fui-control-selected-bg)");
    expect(css).toContain("--fui-sidebar-item-active-bg: var(--fui-control-selected-bg)");
    expect(css).toContain("--fui-table-row-selected-bg: var(--fui-control-selected-bg)");
    expect(css).toContain("--fui-tabs-pill-active-bg: var(--fui-control-selected-bg)");
    expect(css).toContain("--fui-toggle-group-selected-bg: var(--fui-control-selected-bg)");
    expect(css).toContain("--fui-toggle-group-selected-border: transparent");
    expect(css).toContain("--fui-control-checked-bg: var(--fui-color-accent)");
    expect(css).toContain("--fui-control-checked-bg-hover: var(--fui-color-accent-hover)");
    expect(css).toContain("--fui-control-checked-color: var(--fui-color-on-accent)");
  });
});
