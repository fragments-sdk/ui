# RadioGroup — UI notes

## 2026-09-03 Wave 0

- `variant="card"` is now `variant="outline"` (`.itemWrapperOutline`); `RadioVariantContext` carries `"outline" | undefined`, no `default` value.
- Disabled rides `@include disabled-state;`; `prefers-contrast` block replaced by `@include high-contrast-outline;`.
- Still open: same highlight-token wish as Checkbox for the checked sheen.
