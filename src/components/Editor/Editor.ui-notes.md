# Editor — UI notes

## 2026-09-03 Wave 0

- `--fui-editor-min-block-sm/md/lg` (single reader) inlined via `_min-block($size)` = 3/5/10 rows × `--fui-raw-space-40`.
- Disabled rides `@include disabled-state;` (+ pointer-events).
- Still open: a real editor min-block token (or a layout measure role) would replace the row math.
