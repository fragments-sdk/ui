# Listbox — UI notes

## 2026-09-03 Wave 0

- `--fui-listbox-min-inline` (single reader) inlined as `layout.measure("menu-min")`; popup insets carry raw-space fallbacks.
- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.listbox`; the old per-item outlines were dropped in favour of the single mixin.
- Still open: confirm in a browser that high-contrast users still see the highlighted item without the per-item outline.
