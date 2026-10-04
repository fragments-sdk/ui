# Chart — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — a failed load is the errbox every data surface shows (DataTable, ConversationList, Message): the danger glyph, the words and, with the new `onRetry` (`retryLabel`, default "Retry"), one way out; it is an alert. The empty state is the full EmptyState: a chart glyph tile, the `empty` title, new `emptyDescription` copy and one `emptyAction`. The state frame now spans the box and starts at its inline start instead of centring a shrink-wrapped block. The state fixtures moved from the feedback family to theme-reach, with the other series-colour surfaces.
- **What works** — `Chart.test.tsx` covers the alert, the retry, the no-retry case and the empty parts; the stories and state fixtures show both states with copy and an action.
- **What doesn't** — the browser lanes were not re-run for the new states this pass.
- **Candidates** — Chart is the one compound that still ships its parts flat (`ChartContainer` is the documented root); moving it to `Chart` / `Chart.Tooltip` is a docs rewrite.

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — config entries take `series: 1..6` instead of a free `color`; the tooltip and legend paint `var(--fui-chart-N)` and the frame no longer writes `--chart-<key>`. The tooltip is a floating panel (raised, popup corner, popup shadow, no edge) at 11px with a strong label and tabular values; axis and legend text are 11px in ink2. The swatch shape follows the series — dashed stroke, stroke-only line, or filled dot — and is hidden for a single series, so `indicator` and `hideIndicator` are gone. `loading` draws a skeleton at chart height, an empty `data` array shows an EmptyState (copy via `empty`), `error` replaces the chart, and a missing recharts shows the data table or "Chart unavailable". A config `icon` now renders in the legend.
- **What works** — 21 unit tests (states, marker inference, series colours, type-level cuts, axe on ready and empty); stories and contract carry only series tokens.
- **What doesn't** — marker inference reads recharts' payload shape (`stroke`, `fill`, `strokeDasharray`, legend `type`); a custom shape outside those falls back to a dot. Bars stay square: recharts takes a numeric radius, so no role can drive it. Not browser-checked.
- **Candidates** — a `Chart.color(n)` helper if call sites keep writing `var(--fui-chart-N)` by hand; empty detection only reads the chart child's own `data` (a Pie's data lives on `<Pie>`).

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — Legend and tooltip text read the body-compact role (12px); labels take the semibold weight.
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked with a dense legend.
- **Candidates** — None.

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

## 2026-10-03 — role tokens

- **What changed** — the floating tooltip reads `--fui-shadow-popup` (was `--fui-shadow-md`, UIR-D117). `--fui-chart-{1..6}` now exist as brand-derived series (UIR-D118).
- **What doesn't** — the series colours are not wired into the chart palette yet; that is the chart sweep.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-radius-md`. Corners now read the radius roles (`popup`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
