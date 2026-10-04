# ButtonGroup — UI notes

## 2026-10-03 — Glass v4 actions pass

- **What changed** — one job: the fused group (split button). `gap` (xs/sm/md → Stack `gap`), `align` (→ Stack `justify`) and `wrap` are cut (UIR-D75); fused is the only mode. One opaque `--fui-border` hairline divides every pair, whatever the child's variant (it used to appear only between outline children), drawn as a `::before` on the seam; the outer corners keep the control radius and the inner corners go square (UIR-D146). The root is `role="group"` and needs `aria-label` or `aria-labelledby` (typed, plus a dev warning). The guideline is at most two; a third verb goes in a Menu.
- **Split button** — the menu half is `<Menu.Trigger render={<IconButton …>} />` in the story and contract example (Menu.Trigger has no `asChild` in v4).
- **What works** — `ButtonGroup.test.tsx` covers the name, labelledby, the dev warning and the divider rule; `ButtonGroup.states.tsx` (new) renders solid, soft, ghost and xs split buttons, a long label in a narrow box, and hover, focus and disabled halves. Button stories and the fragment moved their spaced rows to Stack.
- **What doesn't** — the divider is the one hairline at 5% ink, so it is faint on a solid accent half; no solid IconButton exists, so a solid split pairs a solid Button with a soft trigger. Not browser-checked in this lane.
- **Candidates** — a contrast check of the divider on a solid half once the harness lane can run it.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

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
