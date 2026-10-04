# Collapsible — UI notes

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — IME-safe Enter (3.1.3)

- **What changed** — the trigger's Enter toggle skips a composing keydown, through the shared `isComposingEnter` helper (`src/utils/isComposingEnter.ts`). No visual or API change.
- **What works** — `src/utils/isComposingEnter.test.ts` scans `src/**` and fails if an Enter check here skips the helper; the component's own tests stay green. Headless Chromium, WebKit and Firefox (2026-10-03 pass): plain Enter and Space toggle the trigger exactly once each, the same as with the guard stubbed out.
- **What doesn't** — no composition test of its own; the trigger is not a text field.
- **Candidates** — none beyond a composition fixture in the browser render-state harness.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: two duplicated `opacity: 0.5; cursor: not-allowed` blocks collapsed into `@include disabled-state`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-radius-md`, `--fui-transition-fast`, `--fui-transition-normal`. Corners now read the radius roles (`control`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — navigation core on Glass

- **What changed** — rebuilt on `@base-ui/react/collapsible`. The trigger is the fold row: h32 (44 under a coarse pointer), r.ctl, inline pad 10, a leading ink 3 caret that turns 90° in the micro role, the label in 12 body at the strong weight in ink 1, gated tint hover, one disabled dim, the shared focus ring. The content shows and hides at once; the grid-template-rows transition is gone. Cut: `asChild` (→ `render`), `showChevron` and `chevronPosition` (the caret always leads), `forceMount` (→ `keepMounted`), the public `useCollapsibleContext`, the flat `CollapsibleRoot`/`Trigger`/`Content` exports and the hand-written keydown toggle. The module is server-safe: the caret comes from the icon set's server entry.
- **What works** — unit tests cover open and close, `keepMounted` hiding, `render` triggers without the caret, the leading caret and `data-panel-open`, and the focusable disabled trigger. New `Collapsible.states.tsx`.
- **What doesn't** — fixtures not rendered in this lane; the Sidebar section trigger now leads with the caret and needs the Sidebar lane's restyle.
- **Candidates** — a trailing count slot on the fold row (tabular ink 3).

## 2026-10-04 — Glass PR5 review fixes: stories

- **Fixed** — Stories compose library parts: copy is `Text`, the custom trigger renders a ghost `Button`, the stacked sections sit in a `Stack`. Not browser-checked.
