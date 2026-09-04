# Textarea — UI notes

## 2026-09-03 Wave 0

- Every private `--_fui-*` property reads a fallback (`field.track("md")`, `field.stroke()`, raw-space accessors).
- Row bounds authored from `minRows`/`maxRows` are now `--fui-textarea-min-rows` / `--fui-textarea-max-rows`, declared in `tokens/_component-properties.scss` (was an undeclared `--_fui-textarea-*` pair).
- `prefers-contrast` block replaced by `@include high-contrast-outline;`.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Same as Input: `field.invalid-focus-state` on error + focus; `success` prop deleted (UIR-D39).
- Verified on :6006: rest, error, focus.
