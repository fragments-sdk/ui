# Blocks — UI notes

Covers `ActivityFeed`, `DashboardLayout`, `LoginForm`, `StatsCard` (the
`.block.ts` source strings and the `components/*.tsx` renderers).

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- Block source strings moved to the Wave 0 vocabulary: `Card variant="solid"`,
  `Button variant="solid"`, `Link tone="neutral"`, `Text scale=`,
  `Badge tone="success"`, `Icon tone="success"`.
- `StatsCard` renderer: `changeVariant` → `changeTone` (`success | warning |
  danger`), passed to `Badge tone`.
- The `.tsx` renderers already sat on `scale` / `variant="solid"`; nothing else
  moved there.

What still does not work

- `LoginForm.tsx` fakes its "Forgot password?" link with an underlined `Text`
  and a cursor style; the block string uses `Link`. The two should agree.
- `DashboardLayout.tsx` and the block string drift (the string carries a
  `ThemeToggle` and metrics grid the renderer does not).

Improvement candidates

- Generate the block string from the renderer (or the reverse) so vocabulary
  cuts touch one source.
