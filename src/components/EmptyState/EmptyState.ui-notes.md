# EmptyState — UI notes

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant="plain"` → `ghost` (default), `variant="outlined"` → `outline`; the
  old values are TypeScript errors. Class `.outlined` → `.outline`.
- `--fui-feedback-section-gap` (read only here, declared nowhere) is inlined
  as `--fui-raw-space-16` with its measurement fallback.
- Every `--_fui-feedback-empty-*` channel the size recipe authors is read with
  a fallback: the md type roles (`ui-standard` title, `body-compact` copy),
  `--fui-icon-2xl` for the icon, and `--fui-overlay-tooltip-max` (320px) for
  the copy measure. Both `margin: 0` sites read `--fui-raw-space-0`.
- The contract examples use `Button variant="soft"` for the secondary action.

What still does not work

- `recipes/_feedback.scss` (orchestrator-owned) still reads
  `--fui-feedback-empty-max-inline-sm|md|lg` and `--fui-feedback-empty-icon-lg`,
  which no token file declares; the fallbacks there are bare px.

Improvement candidates

- Promote the three copy measures to `_variables.scss` so the recipe stops
  carrying literal widths.
