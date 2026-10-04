# ScrollArea — UI notes

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-08-14 — opt-in overflow cues

Logical-edge fade indicators remain opt-in so existing consumers do not gain
observers, animation frames, or visual overlays during a minor release. Fragments
Header, NavigationMenu, Sidebar, and Docs page asides pass `showFades` explicitly
where off-screen content needs a stronger cue.

## 2026-09-03 — private hooks only (UI refinement, Wave 0)

The unused public `--fui-scrollarea-track-size/-inline-fade/-block-fade`
hooks are deleted; the private `--_fui-scrollarea-*` properties read from
`--fui-raw-space-*` with Sass twins, and every mask/fade read carries a
fallback. Override fade depth via the raw-space tokens on the root.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-transition-fast`. motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — navigation core on Glass

- **What changed** — `scrollbarVisibility="hover"` is merged into `auto`, which now differs from `always`: `auto` shows the thin thumb while scrolling (a `data-scrolling` mark that lapses 800ms after the last scroll), on hover where the pointer can hover, and while focus is inside; `always` keeps it. The thumb reads `--fui-scrollbar-thumb` (line-strong) and `--fui-scrollbar-thumb-hover`, so the background-planes baseline row is gone. A viewport that scrolls and holds nothing focusable takes `tabIndex={0}`; `aria-label`/`aria-labelledby` move to the viewport and name it as a region; keyboard focus rings inside the edge. Edge measuring moved into `use-scroll-edges.ts`, shared with the Tabs row, and now always runs (one observer pair per area) because the keyboard decision needs it; fades still draw only with `showFades`.
- **What works** — unit tests cover fades on and off, the focusable named region, focusable content keeping the keyboard, and the scrolling mark. New `ScrollArea.states.tsx`.
- **What doesn't** — fixtures not rendered in this lane; the inset ring sits under the edge mask when fades are on.
- **Candidates** — Base UI ScrollArea once its custom scrollbar matches the thin thumb.

## 2026-10-04 — Glass PR5 review fixes: the ring leaves the mask

- **Fixed** — a focused viewport no longer rings inside its own edge: the viewport carries the edge mask, which faded the ring where the fades draw. The root now draws the ring outside its edge (`:has(> .viewport:focus-visible)`), and the viewport delegates. The root's `overflow: hidden` clips content, not its own outline.
- **What works** — a unit test reads the compiled ring; the new `lifecycleFocus` fixture checks the root ring and the bare viewport while the harness holds keyboard focus.
- **What doesn't** — the states lane was not run; a parent that clips flush to the area would cut the outside ring, as for any control.

## 2026-10-04 — Glass PR5 review fixes: stories

- **Fixed** — Stories compose library parts (`Text` rows, `Stack` lists, small soft `Button`s in the geometry matrix), and every area caps at the canvas width, so a 390 canvas no longer scrolls sideways; the matrix fits as many 280 columns as the width allows. Not browser-checked.

## 2026-10-04 — PR6 review fix: a disabled child hands the keyboard back

- **Fixed** — the scroller now re-reads its keyboard stops when a descendant's `disabled`, `href`, `tabindex` or `contenteditable` changes, not only when children are added or removed. Before, disabling the only button left the viewport without `tabindex`, so keyboard users could not reach it.
- **What works** — a unit test disables the only button and checks the viewport takes `tabindex="0"`; Tabs, which shares the hook, still passes.
- **What doesn't** — a control disabled through an ancestor `fieldset[disabled]` still counts as focusable (the selector reads attributes, not `:disabled`). Not browser-checked.

## 2026-10-04 — a control in a disabled fieldset hands the keyboard back

- **Fixed** — the focusable check reads `:disabled` rather than the `disabled` attribute, so a button locked by a disabled `fieldset` no longer counts as a keyboard stop, and the viewport takes `tabindex="0"`.
- **What works** — a unit test puts the only button in a disabled fieldset; it fails on the old selector and passes now. Tabs, which shares the hook, still passes.
- **What doesn't** — the observer watches the scroller's own subtree, so a fieldset outside the area (Form's pending lock) changes nothing until the next mutation inside it. Not browser-checked.
