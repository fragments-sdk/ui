# Icon — UI notes

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant` is deleted. Semantic values live on `tone` (`accent` | `info` |
  `success` | `warning` | `danger`; old `error` → `danger`); the text
  hierarchy lives on `color` (`primary` | `secondary` | `tertiary`), the same
  axis as Text. `tone` wins when both are set. The deprecated semantic `color`
  values are gone; the old `default` value is the absence of the prop.
- `size="2xl"` is folded into `xl` (24px, the largest glyph step). The catalog
  keeps an `icon.2xl` target (EmptyState's md icon reads `--fui-icon-2xl`), but
  `Icon` no longer exposes it.
- Classes follow the axes: `.toneAccent` … `.toneDanger`, `.colorPrimary` …
  `.colorTertiary`; `.size2xl` and the bare `.primary` / `.error` classes are
  gone. No kit-internal caller passed `variant` / `color` (blocks use `tone`).

What still does not work

- An `Icon` inside an `EmptyState.Icon` at `size="xl"` renders 24px while the
  slot reserves 32px; pass the icon component's own `size` or a raw svg.

Improvement candidates

- Decide whether the `icon.2xl` measurement target survives Wave 1; if it does,
  restore it as an Icon size with a named job (empty-state and hero glyphs).
