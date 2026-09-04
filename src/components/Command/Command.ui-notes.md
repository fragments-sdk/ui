# Command — UI notes

## 2026-09-03 Wave 0

- Content gap, container inset, indicator box and row insets now carry raw-space fallbacks; `padding: 0` reads `--fui-raw-space-0`.
- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.command`.
