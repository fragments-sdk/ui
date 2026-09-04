# Pagination — UI notes

## 2026-09-03 Wave 0

- Zero margin/padding read `--fui-raw-space-0`; `.itemDisabled` rides `@include disabled-state;`; `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.itemActive`.
- Raw `<button>`s kept: the kit Button/IconButton are mid-migration in G2's folders and the swap would couple to in-flight files. Candidate for Wave 1.
