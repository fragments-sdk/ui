# Tooltip — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: the arrow offsets read `measurements.raw-space()`, the hairline reads `$fui-stroke-hairline`, and the stories/contract examples moved to the ruled Button vocabulary (UIR-D31).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- Inverse fill, `--fui-text-inverse`, l2 radius and shadow moved into `overlay.tooltip`; the raw `60` z-index fallback now reads `$fui-overlay-layer-tooltip`. Checked on hover in Storybook.
