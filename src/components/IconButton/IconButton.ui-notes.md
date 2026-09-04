# IconButton — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` values join the five chrome families: `subtle` → `soft`, `outlined` → `outline`; `ghost` is unchanged and stays the default.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Actions + Feedback + Display category pass.
