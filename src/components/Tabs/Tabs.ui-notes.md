# Tabs — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` is chrome only: `underline` → `ghost`, `pills` → `soft`, on both `Tabs` and `Tabs.List`. The selected treatment moved onto the shared `segmented-selection` mixin.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass (`docs/ui-refinement/BRIEF.md`, Waves).
