# Chip — UI notes

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant="filled"` → `solid`, `variant="outlined"` → `outline` (the
  `outline` alias is now the only spelling); `soft` unchanged. `ChipVariant`
  is exported. `size` keeps `xs` (glyph-scale component) and stays the default.
- Classes `.solid` / `.outline` replace `.filled` / `.outlined`, including the
  `+ .remove` pairings.
- The four square corners on a removable chip (`.withRemove`, `.remove`) read
  `--fui-raw-space-0` instead of `0`, on logical corner properties; hairline
  fallbacks read `$fui-stroke-hairline`; avatar `width`/`height` are logical.

What still does not work

- `soft` is hard-wired to the info tint; it has no `tone` axis yet.

Improvement candidates

- Give Chip a `tone` axis so `soft` can carry the shared status ramp like
  Badge, then fold the info-only tint into `tone="info"`.
