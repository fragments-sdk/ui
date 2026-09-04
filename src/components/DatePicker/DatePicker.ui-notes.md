# DatePicker — UI notes

## 2026-09-03 Wave 0

- `--_day-size` reads `action.track("md")` as fallback; `padding: 0` sites read `--fui-raw-space-0`.
- `.disabled` rides `@include disabled-state;` (+ pointer-events). `.outside` borrows `--fui-opacity-disabled`; a muted-opacity token would be the right home.
- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.trigger`.
