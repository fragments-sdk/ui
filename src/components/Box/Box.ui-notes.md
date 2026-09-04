# Box — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: `border-radius: 0` reads the new `--fui-radius-none` (UIR-D20) and every hairline border reads `$fui-stroke-hairline`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.
