# ComponentDefaults — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — no prop renamed; the provider gained its first `ComponentDefaults.contract.json`, filed under `utilities` with a one-sentence lead (UIR-D24), and dropped out of `publicUiPrimitiveNames()` so `components/prefer-library` never points authors at a provider (UIR-D25).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — none.
