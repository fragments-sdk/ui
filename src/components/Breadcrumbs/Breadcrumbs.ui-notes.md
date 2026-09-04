# Breadcrumbs — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: `margin`/`padding` zeros read `measurements.raw-space(0)` and the hairline reads `$fui-stroke-hairline`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass, which also owns the pre-existing bare px in `Breadcrumbs.module.scss` (follow-ups in `docs/ui-refinement/00-foundations.md`).

## 2026-09-04 Wave 1 — navigation parity (UIR-D41)

- **What changed** — both `max-width: 200px` truncation caps read `layout.measure("menu-min")` (192px, the nearest existing measure) instead of a raw pixel value.
- **What was browser-verified** — Default: every crumb computes `max-width: 192px` with `text-overflow: ellipsis` intact.
