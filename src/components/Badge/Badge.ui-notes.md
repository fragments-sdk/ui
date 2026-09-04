# Badge — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` carries chrome only (`soft` · `outline` · `ghost`; `label` → `outline`, `dim` → `ghost`) and the colour values moved to a new `tone` axis (`neutral` · `accent` · `info` · `success` · `warning` · `danger`; `error` → `danger`, `default` → `neutral`) — UIR-D9.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Actions + Feedback + Display category pass.
