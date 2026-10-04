# Grid — UI notes

## 2026-10-03 — Glass: the governance scan

- **What changed** — the six gap classes are written out instead of generated in a loop: the scan's token-source loader could not give a looped `--_fui-grid-gap` one value, and `check --changed` refused the whole token source. The compiled CSS is unchanged.
- **What works** — `Grid.test.tsx` reads the same compiled gap values; `check --changed` loads every token source.

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — tracks are `repeat(N, minmax(0, 1fr))`, so a long word or code line can no longer widen a column. Column counts are `1 | 2 | 3 | 4 | 6 | 12 | "auto"` (5, 7–11 cut). The responsive column object is merged into a ceiling: `columns={3} minChildWidth="14rem"` keeps up to three tracks and drops them one at a time as the grid itself narrows, so it holds inside panes and cards with no viewport breakpoints. `"auto"` tracks are clamped to the grid width. The numeric gap and `padding` are cut (the shell owns the gutter, surfaces own inset); `gap` lands as a class that writes the private `--_fui-grid-gap`, which the ceiling maths reads back. The compound is `Object.assign(GridRoot, { Root, Item })` (was mutation). `--fui-grid-cols-*` and `--fui-grid-min-child-width` are gone; the internal values are `--_fui-grid-min` and `--_fui-grid-max`. New `Grid.states.tsx` (`@family:primitives`).
- **What works** — `Grid.test.tsx` reads the compiled tracks and gap from the stylesheet, covers auto and capped columns, every Item placement and type errors on every cut value.
- **What doesn't** — the ceiling formula is not browser-checked here; `colSpan` larger than the tracks left after a collapse creates implicit columns, as plain CSS grid does.
- **Candidates** — absorb BentoGrid's feature-tile spans into `Grid.Item` (BentoGrid is not in this batch).

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — Stories read `--fui-raw-space-*` gaps instead of `--fui-space-*`.
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Stories only; no component change.
- **Candidates** — None.

## 2026-10-03 — gap prop honoured (3.1.3)

- **What changed** — the `gap` prop wrote `--_fui-grid-gap` inline, but `.grid` hard-coded `layout.gap("md")`, so every grid had a 12px gap. `.grid` now reads `gap: var(--_fui-grid-gap, <md>)`, the pattern Stack uses; `md` is only the fallback.
- **What works** — `Grid.test.tsx` compiles the module and checks the declaration, then resolves it against `<Grid gap="lg">` to `var(--fui-raw-space-16, 16px)`. Headless Chromium, WebKit and Firefox compute 16px for `lg` and 12px without the variable.
- **What doesn't** — `gap` takes one value; there is no responsive gap like Stack's.
- **Candidates** — share Stack's responsive gap shape if a grid needs it.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: the gap reads `layout.gap("md")` directly instead of an undeclared `--_fui-grid-gap`, and `--_cols` gained a declared fallback.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-radius-sm`. Corners now read the radius roles (`indicator`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-04 — Glass PR5 review fixes: stories

- **Fixed** — Stories set cells in `Text`; the capped-columns panes cap at the canvas width and the twelve-track row drops inline padding, so a 390 canvas no longer scrolls sideways. Not browser-checked.
