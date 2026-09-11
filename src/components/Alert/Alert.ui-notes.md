# Alert — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — the `severity` prop is deleted; colour, icon and live-region role are now `tone` (`info` · `success` · `warning` · `danger`, `error` → `danger`). The `AlertSeverity` type is `AlertTone`. The hand-rolled `prefers-contrast` block is `@include high-contrast-outline`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Actions + Feedback + Display category pass.

## 2026-09-08 — one tone ramp, one recipe

- **What changed** — the private `_tone` mixin and `--_alert-*` vars are deleted; `.alert` includes `tone.channels("info")` and each `.tone*` class re-includes the recipe. The panel paints `--_fui-tone-wash` (10% light / 16% dark), hairline `--_fui-tone-line`, ink `--_fui-tone-ink`; the icon disc is the ink. `emphasis="surface"` is unchanged.
- **Why** — Alert, Toast, Card, Message and Badge each derived the tone separately (`-bg` tokens for panels, private mixes for pills). One ramp, one place to tune.
