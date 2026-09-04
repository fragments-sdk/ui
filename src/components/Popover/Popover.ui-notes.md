# Popover — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: `--fui-overlay-*` measurement targets replace the raw panel widths (UIR-D15), `--fui-raw-space-*` and `$fui-stroke-hairline` replace bare `0`/`1px`, and the contract example snippets moved to the ruled Button vocabulary (UIR-D31).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.
