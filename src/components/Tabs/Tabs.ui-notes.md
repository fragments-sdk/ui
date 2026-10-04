# Tabs — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the scrolling row clipped the outside focus ring on three sides. The ghost row now pads by the ring's reach (width plus offset) and pulls back by the same, so the one ring geometry fits inside the scrollport and no tab moves; the indicator sits at that inset. Soft segments draw the ring inside the edge (the track scrolls, and a segment has room inside). The ghost hit area grows only in the block axis, and a ghost tab is at least the pointer floor wide: short names (`npm`, `pnpm`) used to overflow the row by their hit area, which set the edge fade off and masked the second tab.
- **What works** — `Tabs.test.tsx` checks the ring room, the inset soft ring and the block-only hit area; `Tabs.states.tsx` `lifecycle` asserts the focused ring lands inside the row on every side and that a row of short names does not scroll.
- **What doesn't** — under a coarse pointer a ghost tab is at least 44 wide, which spaces very short names further apart.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — soft Tabs take the thumb through `segmented-selection` (UIR-D126). The panel's `outline: none` is gone, so a focused panel draws the one ring (UIR-D125).
- **What works** — the thumb is read on ToggleGroup in `SelectionRecipe.states.tsx`; Tabs shares the mixin.
- **What doesn't** — Tabs has no state fixture of its own; the panel ring is not read in a browser.
- **Candidates** — a Tabs fixture with the panel focused.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` is chrome only: `underline` → `ghost`, `pills` → `soft`, on both `Tabs` and `Tabs.List`. The selected treatment moved onto the shared `segmented-selection` mixin.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Upstream, no local change** — the indicator accounts for 3D transforms; no update loop from unstable refs; roving focus survives tabs being added or removed. Paired captures pixel-identical.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — the indicator jumps to the new tab under reduced motion (its own `@media (prefers-reduced-motion: reduce)` block), now that globals no longer cut every transition (UIR-D140).
- **What works** — `fui/media-queries/reduced-motion` passes for the module without a baseline entry.
- **What doesn't** — no browser check of the reduced-motion jump.
- **Candidates** — a reduced-motion state in a Tabs fixture.

## 2026-10-03 — v4 surface and token pass

- **What changed** — Pill items no longer read `--fui-tabs-pill-*`; the track reads the band.
- **Token reads** — the legacy reads are gone: `--fui-radius-l1`, `--fui-radius-l2`, `--fui-radius-l3`, `--fui-tabs-pill-hover-bg`, `--fui-tabs-pills-bg`, `--fui-tabs-pills-border`, `--fui-transition-fast`. Corners now read the radius roles (`control`, `indicator`, `segment`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — motion, type and state recipes

- **What changed** — soft tabs draw the shared segmented control (`segmented.track` + `segment("[data-active]")`, UIR-D143): band track, hairline, control radius, pad 2, the active tab on the lifted thumb at the strong weight. `Tabs.List` carries `data-size` so the track picks its step. Default and ghost tab hover is gated to `(hover: hover)`. The `--fui-tabs-pills-*` hooks are gone.
- **What works** — `SelectionRecipe.states.tsx` checks the soft Tabs track and thumb compute the same as the soft ToggleGroup; new `Tabs.states.tsx` (populated, overflow, lifecycle).
- **What doesn't** — the state fixtures were not run in this lane (no `test:states`); overflow on a narrow soft track just clips, it does not scroll.
- **Candidates** — horizontal scroll with edge fades on an overflowing soft track; a reduced-motion state for the indicator.

## 2026-10-03 — navigation core on Glass

- **What changed** — `variant` and `size` live on the root only (the `Tabs.List` copies are cut). `size` is sm 28 / md 32; `lg`, `orientation="vertical"` and Panel `flush` are cut, and the panel carries no padding. Ghost tabs: regular ink 2 at rest, hover brightens the words only (gated), the open tab ink 1 at the strong weight over a 2px ink 1 indicator that moves by transform only; tabs sit 16 apart and the name reserves the strong width so nothing shifts. One disabled dim. `Tabs.Tab` forwards HTML props, refs and `render`, and takes `count` (ink 3, tabular) and `dot` (words read with the name). `Tabs.List` names `activateOnFocus` and takes `actions`, drawn outside the tablist. `onReselect` reports a second press on the open tab. The row scrolls inline with edge fades and scrolls the open tab into view.
- **What works** — the unit suite covers forwarding, count and dot names, re-press, actions outside the tablist, `activateOnFocus`, and the size clamp; `lint:styles` no longer needs the layout-transition baseline row.
- **What doesn't** — the fixtures were not rendered in this lane (no `test:states`); edge fades and scroll-into-view are not browser-checked.
- **Candidates** — an overflow menu past the fades; a reduced-motion capture of the indicator.
