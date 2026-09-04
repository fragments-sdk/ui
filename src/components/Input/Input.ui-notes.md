# Input — UI notes

## 2026-09-03 Wave 0

- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.input`.
- Stories: `RENDER_STATES` render states, new `Sizes` (sm/md/lg) and `Invalid` stories alongside `Disabled`.
- Vocabulary already conformed (size sm/md/lg); no variant axis.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Invalid + focus is now `field.invalid-focus-state` (danger edge, 34% danger ring), the same ring shape as focus. The three-layer `focus-ring-error` box-shadow is gone.
- `success` prop deleted (UIR-D39): no consumer, decorative chroma.
- Verified on :6006: rest, error, disabled, keyboard focus, error + focus.
