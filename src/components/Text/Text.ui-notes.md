# Text — UI notes

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `size` → `scale` (`TextScale`, values unchanged); `variant="section-label"`
  / `"eyebrow"` → `role` values on the existing `TextRole` union. The legacy
  `size` / `variant` props are deleted (TypeScript errors, no shims).
- A role owns the whole setting: `role="eyebrow"` cannot be combined with
  `scale` / `weight` / `font` / `letterSpacing` (they were combinable on the old
  `variant`). The runtime still warns and ignores them when an untyped spread
  passes both.
- Classes: `.scale-*`, `.role-section-label`, `.role-eyebrow`. `margin: 0`
  reads `--fui-raw-space-0`.
- The contract now lists `role` as a prop (it was undocumented).

What still does not work

- `.lineClamp` reads `var(--fui-line-clamp, 2)` with a bare `2` fallback; the
  contract property lives in `_component-properties.scss` but has no Sass twin.

Improvement candidates

- Retire `scale` once every consumer sits on a role; `weight`/`font`/tracking
  then become role modifiers instead of a parallel axis.
