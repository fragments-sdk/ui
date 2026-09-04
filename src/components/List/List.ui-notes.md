# List — UI notes

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant` → `marker` (`ListMarker`: `none` | `disc` | `decimal` | `icon`);
  values unchanged, the old prop is a TypeScript error (UIR-D16). The context
  value is `marker` too.
- `gap` gains `xl` so the axis matches the ruled set (`none` … `xl`); it maps to
  `layout.gap("xl")`.
- The `ul`/`ol` reset reads `--fui-raw-space-0` for margin and padding; the
  icon-slot floor reads `measurements.raw-space(12)` instead of a bare px.

What still does not work

- `List.Item icon` only renders on `marker="icon"`; passing an icon on a disc
  list silently drops it.

Improvement candidates

- Warn in development when `icon` is passed without `marker="icon"`.
