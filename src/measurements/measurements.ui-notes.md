# Measurement targets — UI notes

## 2026-10-03 — units and scales

- **What changed** — `measurements.json` stays in px; the generator writes type, space and the catalog in rem against `spacing.baseFontSize` (16px), strokes stay px, radius profiles are whole px. New: `legacy.space` and `legacy.typography.fontSizeRole` (the deprecated alias tables, checked as nearest-step), `targets.badgeTrack.sm` (20px), `fieldInlineInset.xs` (8px). The control track emits `--fui-control-height-*`; the field track emits nothing (one height family). `typography` holds the D88 roles; weights read `--fui-font-weight-normal` or `-semibold`. The 23 typography cases in `geometry/cases.json` follow the new roles and the system stack.
- **What works** — `pnpm run check:measurements` (generator, hashes and parity) and `pnpm run test:geometry` pass; the parity check fails on a hand edit to either generated file.
- **What doesn't** — The aliases are declared in `_variables.scss` from the tables, not by the generator; a new alias family needs both.
- **Candidates** — Generate `TYPOGRAPHY_CLASSES` from `measurements.json` (unchanged); emit the alias block from the generator.

## 2026-10-03 — display role specimen (geometry lane)

- **What changed** — the MeasurementTargets story renders the `display` type role. The geometry lane's foundation cases cover every role in `measurements.json`, and `display` had no specimen, so its cases could not resolve.
- **What works** — `pnpm run test:geometry` resolves all 40 automated cases on a non-authoritative runner. The two manual 200% zoom records are pending.
- **What doesn't** — the story declares no density, because the density axis was deleted (UIR-D36). Geometry cases run at the default density only.
- **Candidates** — generate `TYPOGRAPHY_CLASSES` from `measurements.json`, so a new role cannot ship without a specimen.
