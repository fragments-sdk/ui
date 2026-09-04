# Progress — UI notes

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant` → `tone` on both `Progress` and `Progress.Circular` (`ProgressTone`:
  `accent` default, `neutral`, `success`, `warning`, `danger`). The old
  `default` value is `accent`; the old prop is a TypeScript error.
- The ring now takes `neutral` too (`.circularIndicatorNeutral`), so a meter
  reads the same in bar and ring form.
- The ring geometry is authored on the instance through public properties
  `--fui-progress-diameter`, `--fui-progress-dash-full`,
  `--fui-progress-dash-quarter` (declared in
  `tokens/_component-properties.scss`; were `--_progress-*`). Consumers that
  overrode the outer box via `--_progress-diameter` must use the public name.
- Every `var()` read carries a Sass twin or measurement fallback (track size,
  ring diameter, dash offsets).

What still does not work

- `strokeWidth` is a raw number prop; the defaults in `geometry.ts` are
  unitless px, not measurement targets.

Improvement candidates

- Fold `size` on the ring onto the shared `--fui-icon-*` ladder so a
  `Progress.Circular size="sm"` lines up with an `Icon size="xl"` next to it.
