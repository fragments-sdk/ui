# Listbox — UI notes

## 2026-09-03 Wave 0

- `--fui-listbox-min-inline` (single reader) inlined as `layout.measure("menu-min")`; popup insets carry raw-space fallbacks.
- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.listbox`; the old per-item outlines were dropped in favour of the single mixin.
- Still open: confirm in a browser that high-contrast users still see the highlighted item without the per-item outline.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- Uses the new `popup.inline-container` (the popup box without a shadow) because the listbox sits in the page flow; the `--fui-form-group-border` edge override is gone. Rows now round to l2 on highlight (checked WithGroups in Storybook).
