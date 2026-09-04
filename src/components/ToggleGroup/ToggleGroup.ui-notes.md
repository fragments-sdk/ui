# ToggleGroup — UI notes

## 2026-09-03 Wave 0

- `variant`: `default`→`soft`, `pills`→`ghost`, `outline`/`outlined`→`outline`; default is `soft`. `.default`/`.pills` classes are gone.
- Selected item styling is `@include segmented-selection;` in all three variants; the `--fui-toggle-group-selected-*` hooks are no longer read.
- Disabled rides `@include disabled-state;`; `gap: 0` reads `--fui-raw-space-0`; `--_fui-segmented-track` falls back to `segmented.track("md")`.
