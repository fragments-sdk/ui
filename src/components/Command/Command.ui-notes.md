# Command — UI notes

## 2026-09-03 Wave 0

- Content gap, container inset, indicator box and row insets now carry raw-space fallbacks; `padding: 0` reads `--fui-raw-space-0`.
- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.command`.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- No local change; the palette box follows `popup.container` (l1 radius, l2 rows). Not re-checked in this lane.
