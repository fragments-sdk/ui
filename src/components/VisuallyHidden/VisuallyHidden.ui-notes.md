# VisuallyHidden — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the revealed chip floats, so it is the floating surface: raised, the popup shadow, no edge (the strong hairline is gone). Its words take the `ui-standard` role. The duplicate forced-colours block went with the edge.
- **What works** — `VisuallyHidden.test.tsx` checks the surface recipe, no border, `clip-path: none` and the role; the fixture leaves room above the paragraph so the chip covers nothing it tests.

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — new `focusable`: while focus is inside, the content reveals as a chip pinned to the top inline-start corner (surface plane with a strong hairline — the style lint forbids a shadow in a focus rule —, `--fui-control-height-md`, `--fui-radius-control`, the focus ring drawn by the chip, the child's own outline delegated). The skip-link example finally works. The hide takes `clip-path: inset(50%)` from the shared `visually-hidden` mixin, beside its clip rectangle; the module carries no hide of its own. Contract examples are rebuilt on real components and tokens (the old ones named tokens that do not exist and painted literal white on an accent fill). New `VisuallyHidden.states.tsx` (`@family:primitives`).
- **What works** — `VisuallyHidden.test.tsx` covers the focusable marker, focus landing inside, the chip's tokens and the modern hide.
- **What doesn't** — the chip is pinned to the viewport; a skip link inside a scrolled container still reveals at the viewport corner.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: the hand-copied sr-only block became `@include visually-hidden`, which deleted three scoped `fragments-allow FUI2004` exceptions along with the duplicated geometry.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — none.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-border-default`. Corners now read the radius roles (`control`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-04 — Glass PR5 review fixes: stories

- **Fixed** — Stories compose library parts: the icon label sits in a ghost `Button`, the skip link is a `Link`, the hint is `Text`. Not browser-checked.
