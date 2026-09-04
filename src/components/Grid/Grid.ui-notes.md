# Grid — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: the gap reads `layout.gap("md")` directly instead of an undeclared `--_fui-grid-gap`, and `--_cols` gained a declared fallback.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.
