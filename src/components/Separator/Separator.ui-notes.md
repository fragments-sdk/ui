# Separator — UI notes

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `spacing` → `gap` (`SeparatorGap`: `none` | `xs` | `sm` | `md` | `lg` |
  `xl`), the shared spacing axis; `xs` and `xl` are new steps on
  `layout.gap()`. Classes are `.gapNone`, `.gapXs` … `.gapXl`, generated from
  one loop. The labelled rule now honours `gap` too (it was horizontal-only).
- `soft` reads `--fui-opacity-disabled` (0.5, the same value it had) for both
  the rule and the labelled rule's flanks; a `--fui-opacity-soft` token would
  name the intent.
- `padding: 0` reads `--fui-raw-space-0`; hairline fallbacks read
  `$fui-stroke-hairline`; physical `width`/`height` became logical.

What still does not work

- A vertical separator still needs a parent with a set block size.

Improvement candidates

- Fold the labelled rule onto `Text role="section-label"` so the label ink and
  tracking come from one place.

2026-09-07: the uppercase transform is gone (library-wide rule: no
`text-transform: uppercase`). The label keeps its size, weight and colour.
