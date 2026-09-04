# Checkbox — UI notes

## What works

- Check/indeterminate marks draw themselves in (2026-08-21): stroke-dashoffset
  over `pathLength`-normalized glyphs (budget 24 for both marks), replacing the
  scale pop. Polyline point order is draw order — short arm first, then the
  long stroke — so the check draws the way a hand writes it. Un-check reverses
  the draw. Draw rides `--fui-transition-normal`; indicator opacity rides
  `--fui-transition-fast` so exits don't linger. Verified live on
  /components/checkbox (offset sampled 0→24 over ~200ms).
- `keepMounted` on the Base UI Indicator is load-bearing: without it the
  indicator mounts on check and no transition runs.

## What to watch

- The draw budget (dasharray/dashoffset 24) must match the SVG `pathLength`
  attribute in index.tsx. Changing the glyphs means keeping both in sync.
- Menu/Select check indicators intentionally do NOT draw — popup remounts on
  every open would replay the animation and read as noise.

## 2026-09-03 Wave 0

- `variant="card"` is now `variant="outline"` (`.wrapperOutline`); absence of `variant` is the plain control, there is no `default` value.
- Disabled rides `@include disabled-state;`; the hand-rolled `prefers-contrast` block is `@include high-contrast-outline;` on `.checkbox`.
- The checked sheen no longer uses raw `white`: it is a `color-mix` of `--fui-control-checked-color`; the offset reads `--fui-stroke-hairline`.
- Still open: a dedicated highlight token (`--fui-color-highlight`) would be cleaner than deriving the sheen from the on-accent color.
