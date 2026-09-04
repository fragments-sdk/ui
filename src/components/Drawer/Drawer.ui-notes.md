# Drawer — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `Drawer.Content size` is `width` (panel width, or height for top/bottom; default `md`) — UIR-D16. Panel widths read the `--fui-overlay-*` measurement targets (UIR-D15).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.
