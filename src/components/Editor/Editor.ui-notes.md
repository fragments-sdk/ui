# Editor — UI notes

## 2026-09-03 Wave 0

- `--fui-editor-min-block-sm/md/lg` (single reader) inlined via `_min-block($size)` = 3/5/10 rows × `--fui-raw-space-40`.
- Disabled rides `@include disabled-state;` (+ pointer-events).
- Still open: a real editor min-block token (or a layout measure role) would replace the row math.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Container focus-within is `field.focus-state` (was the solid button ring). Toolbar button hover ground is `--fui-bg-hover`.
- Not browser-verified: synthetic clicks do not focus the ProseMirror content in this harness; the rule is one line.
