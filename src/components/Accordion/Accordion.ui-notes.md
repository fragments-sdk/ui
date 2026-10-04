# Accordion — UI notes

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: the literal `opacity: 0.5` became `@include disabled-state` (`--fui-opacity-disabled`), and the hairline plus `margin: 0` read `$fui-stroke-hairline` and `measurements.raw-space(0)`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-radius-sm`, `--fui-transition-normal`. Corners now read the radius roles (`control`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — navigation core on Glass

- **What changed** — rebuilt on `@base-ui/react/accordion`. `type` single|multiple is now the `multiple` boolean, and `value`/`defaultValue`/`onValueChange` always carry a string array; `collapsible` is cut (a single accordion always closes the open item when it is pressed again) and so is the hand-written `data-state`. The trigger is the fold row shared with Collapsible: h32 (44 under a coarse pointer), r.ctl, inline pad 10, a leading ink 3 caret turning 90° in the micro role, 12 body at the strong weight in ink 1, gated tint hover, the shared focus ring. Open and close are instant: the grid-template-rows and opacity transition is gone. The hairline between items stays; a disabled item dims once on its trigger. Arrow keys now move between triggers (Base UI's accordion keyboard model). The shared `feedback.disclosure-row` recipe still draws ui-standard 14 semibold with pad 8, so the row is drawn in the module until the recipe lane fixes it.
- **What works** — unit tests cover single and multiple, controlled arrays, close-on-second-press, canceled changes, heading levels, `keepMounted`, `hiddenUntilFound` with `beforematch`, and the leading caret. New `Accordion.states.tsx`.
- **What doesn't** — fixtures not rendered in this lane; the row is duplicated with Collapsible until the recipe carries it.
- **Candidates** — move the fold row into `feedback.disclosure-row` and include it from both modules.
