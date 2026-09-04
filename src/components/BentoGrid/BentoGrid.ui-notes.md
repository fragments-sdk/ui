# BentoGrid — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: the hand-rolled `prefers-contrast: more` block became `@include high-contrast-outline`, and the `--_col-span` / `--_row-span` channels gained declared fallbacks.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.
