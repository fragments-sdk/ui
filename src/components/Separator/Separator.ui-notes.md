# Separator — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the module drops its needless `"use client"` directive: it holds no hook, context or handler, so `Separator` and its compound parts render in a server component (the server-components baseline no longer lists it).
- **What works** — the style lane no longer holds a baseline entry for this file.
- **What doesn't** — the server-components lane was not run this pass.
- **Candidates** — none new.

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — `soft` and `gap` are cut: the rule is one hairline in `--fui-border` with no opacity (the old `soft` dimmed labelled rules twice), and the parent owns the space around it (Stack `gap`). The rule paints the Base UI separator element itself; the extra inner span is gone. The labelled break is now rule, label, rule: only the first rule carries `role="separator"`, the label is a sibling in caption ink 3 and the gap is `layout.gap("sm")` (was raw-space-20). New `length="full" | "control"` for vertical rules: `control` stops at `--fui-control-height-xs` with 4px either side, the toolbar divider; Stack `divided` and the Editor toolbar render this component. `label` accepts a node. New `Separator.states.tsx` (`@family:primitives`).
- **What works** — `Separator.test.tsx` covers the role, orientation, the control length, the label sitting outside the role, ref forwarding and type errors on the cut props.
- **What doesn't** — the control length is fixed at the extra-small control height; a toolbar of larger controls would want the rule to follow its own height.
- **Candidates** — a `length` that reads the toolbar's track through a custom property if a toolbar ever ships at another size.

## 2026-10-03 — Glass v4: no soft rule

- **What changed** — `soft` is cut: it drew the rule at half opacity, and no separator takes opacity on Glass. A quieter break is more space (`gap`), not a fainter line.
- **What works** — a type test proves `soft` is gone; `Separator.states.tsx` checks the plain and labelled rules paint at full opacity in the border ink, plus a long label in a narrow column.
- **What doesn't** — the fixture has not run in the browser in this lane.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — The label gap reads `--fui-raw-space-20` (was 21px).
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked.
- **Candidates** — None.

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

- Fold the labelled rule onto `Text variant="section-label"` so the label ink and
  tracking come from one place.

2026-09-07: the uppercase transform is gone (library-wide rule: no
`text-transform: uppercase`). The label keeps its size, weight and colour.

## 2026-10-04 — Glass PR5 review fixes: stories

- **Fixed** — Stories set their copy in `Text`; the toolbar-length story uses small ghost `Button`s, and the 300 stacks cap at the canvas width. Not browser-checked.
