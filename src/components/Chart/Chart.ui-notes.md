# Chart — UI notes

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- No vocabulary move: Chart has no `variant` / `tone` props of its own.
- Tooltip item spacing reads `--_fui-chart-tooltip-item-gap` with a
  `--fui-raw-space-8` fallback (the private hook was never declared); the
  dashed marker's square corners read `--fui-raw-space-0`; the two remaining
  `px` fallbacks now go through `measurements.raw-space()`.

What still does not work

- Series colours are still chosen by the caller; there is no shared
  `--fui-chart-series-N` ramp, so two charts on one page can disagree.

Improvement candidates

- Declare `--fui-chart-tooltip-item-gap` in `_component-properties.scss` once
  a second reader (Table sparkline, StatsCard trend) appears.
