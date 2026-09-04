# Alert — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — the `severity` prop is deleted; colour, icon and live-region role are now `tone` (`info` · `success` · `warning` · `danger`, `error` → `danger`). The `AlertSeverity` type is `AlertTone`. The hand-rolled `prefers-contrast` block is `@include high-contrast-outline`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Actions + Feedback + Display category pass.
