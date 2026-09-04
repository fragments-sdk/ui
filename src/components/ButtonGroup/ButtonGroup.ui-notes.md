# ButtonGroup — UI notes

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- No vocabulary move: `gap` already reads `none | xs | sm | md`.
- The fused rail (`gapNone`) reads `--fui-raw-space-0` for its zero gap and
  the four squared inner corners (now logical corner properties); the hairline
  overlap fallback is `$fui-stroke-hairline` instead of `1px`.

What still does not work

- `gap` stops at `md`; `lg` / `xl` are not offered because a button cluster
  wider than `md` is a toolbar, not a group.
- The rail squares corners on any child, so a non-Button child (an IconButton
  or Select) fuses too — intended, but undocumented in the contract.

Improvement candidates

- Promote `--fui-button-group-overlap` if a second fused cluster (Pagination,
  segmented ToggleGroup) starts reading the hairline overlap.
