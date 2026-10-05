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

## 2026-10-05 — body-standard role (13 / 20)

- **What changed** — `typography` gains `body-standard`: 13px on a 20px line, normal weight, 0.005em tracking, the body roles' pretty wrapping (UIR-D151). It sits between `body-compact` (12 / 18) and `ui-standard` (14 / 20, semibold) and emits `--fui-type-body-standard-size`, `-line`, `-weight` and `-tracking` (0.8125rem / 1.25rem at the 16px host). The specimen story renders it; geometry gains its dark and light rest-1440 cases (pending, like the rest).
- **What works** — `check:measurements` (with the 100-column formatter, see below), the typography recipe contract test, the geometry self-test (44 cases) and `check:tokens-css`.
- **What doesn't** — No component reads the role yet, and `Text` has no `type` for it: Text's ladder is 11/12/15/24, and `type="body"` already means 12. In a standalone clone the generator formats with Prettier's defaults (80 columns) because no Prettier config ships here, so `check:measurements` (and `build`, which runs it first) reports the committed 100-column files as stale; that is true on main too.
- **Candidates** — A `Text` type for the 13 role once a product surface needs it; ship the 100-column Prettier config (or pin the options in `formatGenerated`) so the check passes outside the monorepo.
