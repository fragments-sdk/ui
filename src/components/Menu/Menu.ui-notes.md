# Menu — UI notes

## What works

- Enter/exit motion restored (2026-08-21): fade + scale(0.95) from
  `--transform-origin`, `--fui-transition-fast`, matching Popover/Select. The
  previous `opacity: 1; transform: none` zero-block (from the geometry
  standardization PR) had no documented rationale and left Menu the only
  static overlay in the kit. Verified live on docs /components/menu — enter,
  settle, and exit fade all render; submenu viewport height transition
  unaffected. Reduced-motion guard already covers `.viewport`; popup
  transitions are opacity/transform only.
- Rows are `user-select: none` via the popup `row` recipe — rapid pointer
  travel can't start a text selection.

## What to watch

- FUI2015 resolved (2026-08-21): `--fui-menu-min-inline` replaced with
  `layout.measure("menu-min")` — `menu-min: 192px` was added to the
  layoutMeasure catalog (measurements.json + generator hash update, a
  contract-vocabulary addition). Submenu caret vars replaced with
  `--fui-raw-space-4/6`. No consumer overrode the removed hooks.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: `--fui-overlay-layer-anchored`, `--fui-popup-indicator-box` and the caret sizes gained dual fallbacks through `measurements.raw-space()`, and the contract example snippets moved to the ruled Button vocabulary (UIR-D31).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- No local change; `popup.container` now renders `--fui-radius-l1` and rows round to l2 on highlight. Checked WithGroups open in Storybook.
