# IconButton — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` values join the five chrome families: `subtle` → `soft`, `outlined` → `outline`; `ghost` is unchanged and stays the default.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Actions + Feedback + Display category pass.

## 2026-09-07 — Press feedback (better-ui rule)

- **What changed** — `:active` scales to `0.96` under `prefers-reduced-motion: no-preference`, disabled states excluded; same block as `Button` so the two controls press identically.
- **What works** — the IconButton suite is green at this HEAD.
- **Unverified** — browser proof; touch.
