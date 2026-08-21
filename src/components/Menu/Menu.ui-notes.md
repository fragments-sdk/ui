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
