# Stack — UI notes

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — one gap vocabulary: `gap` takes `none | xs | sm | md | lg | xl` only (numeric 1–8 and the responsive gap object are cut) and lands as a class, so the Stack writes no custom property for it. The responsive direction object is merged into `collapseBelow` (a CSS length): children share the row while the Stack itself is at least that wide and fold into a column below it. It answers the Stack's own width, so it holds inside panes and cards; no viewport breakpoints remain. `separator` is merged into `divided`, which renders the Separator component (horizontal in a column, vertical in a row); inside `ul`/`ol` each divider is a hidden `li`, so lists keep only `li` children. `divided` is ignored while `collapseBelow` is set. The five `data-direction-*` attributes and every public `--fui-stack-*` property are gone (the one internal value is `--_fui-stack-collapse`). New `Stack.states.tsx` (`@family:primitives`).
- **What works** — `Stack.test.tsx` covers the gap classes, the divided column, row and list (axe-clean), the collapse class and private property, and type errors on every cut form.
- **What doesn't** — `collapseBelow` makes children equal shares of the row; a row that needs uneven shares should use Grid. The collapse is not browser-checked here.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: every divider hairline reads `$fui-stroke-hairline`, and the contract example snippets moved to the ruled Button vocabulary (UIR-D31).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-10-04 — Glass PR5 review fixes: stories

- **Fixed** — Stories set the demo panes in `Text`; the collapse panes cap at the canvas width, so on a 390 canvas both fold and nothing scrolls sideways. Not browser-checked.
