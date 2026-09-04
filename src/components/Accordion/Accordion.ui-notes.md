# Accordion — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: the literal `opacity: 0.5` became `@include disabled-state` (`--fui-opacity-disabled`), and the hairline plus `margin: 0` read `$fui-stroke-hairline` and `measurements.raw-space(0)`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.
