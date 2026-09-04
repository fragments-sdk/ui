# Theme — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — the deleted `appearance` axis splits the control in two: `Theme.Toggle` is the segmented light/dark/system control and `Theme.Button` the single icon button (UIR-D11). `ThemeProvider` renders no chrome and its contract lead is a one-sentence utility-provider description (UIR-D24).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 2 Docs proof (the theming page renders this provider); no Wave 1 category owns it.
