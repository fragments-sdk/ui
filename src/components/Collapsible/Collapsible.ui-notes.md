# Collapsible — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: two duplicated `opacity: 0.5; cursor: not-allowed` blocks collapsed into `@include disabled-state`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.
