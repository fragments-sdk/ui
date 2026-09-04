# Skeleton — UI notes

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant` → `shape` (`SkeletonShape`: `text` | `heading` | `avatar` |
  `button` | `input` | `rect`); values unchanged, the old prop is a TypeScript
  error (UIR-D16). `Skeleton.Text` `gap` stays `sm` | `md`, inside the ruled set.
- `radius="none"` paints `--fui-raw-space-0` instead of a literal `0`; the
  button-width and line-gap fallbacks read `measurements.raw-space()` instead
  of bare px; physical `width`/`height` became logical properties.

What still does not work

- `text` / `heading` heights are em literals (`1em`, `1.5em`), tied to the
  surrounding font rather than a typography role.

Improvement candidates

- Drive `text` / `heading` from `typography.line-height()` so a heading
  skeleton matches the real `title-*` roles exactly.
