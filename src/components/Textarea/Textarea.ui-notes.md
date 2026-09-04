# Textarea — UI notes

## 2026-09-03 Wave 0

- Every private `--_fui-*` property reads a fallback (`field.track("md")`, `field.stroke()`, raw-space accessors).
- Row bounds authored from `minRows`/`maxRows` are now `--fui-textarea-min-rows` / `--fui-textarea-max-rows`, declared in `tokens/_component-properties.scss` (was an undeclared `--_fui-textarea-*` pair).
- `prefers-contrast` block replaced by `@include high-contrast-outline;`.
