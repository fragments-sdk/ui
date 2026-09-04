# Prompt — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — the positioning values left `variant` for a new `placement` axis (`inline` · `fixed` · `sticky`; `default` → `inline`) and the deleted `appearance` axis became `variant` (`panel` → `outline`, `seamless` → `ghost`) — UIR-D16. Types: `PromptVariant` → `PromptPlacement`, `PromptAppearance` → `PromptVariant`. The mode row reads `segmented-selection`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 2 AI surfaces (the eight primitives + AI blocks).
