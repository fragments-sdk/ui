# Message — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — the `status` value `sending` is `pending`, so Message sits on the shared lifecycle axis (`idle` · `pending` · `streaming` · `complete` · `error`). No other prop renamed.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 2 AI surfaces (the eight primitives + AI blocks).
