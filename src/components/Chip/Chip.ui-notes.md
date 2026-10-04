# Chip — UI notes

## 2026-10-03 — Glass v4 actions pass

- **What changed** — one look (UIR-D146): the micro track (24), the control radius (the pill is cut), the band fill `--fui-bg-secondary` with one `--fui-border` hairline, the compact label in ink 2, truncated. Cut (UIR-D75): `variant` (soft is the one look, outline goes), every tone but neutral (the prop goes: a chip is never toned), `size` (xs is the only step; the prop goes), `avatar` (merged into `icon`, the one leading slot). Selected is `selection.selected` at rest with the ring as the edge (UIR-D142), the hover tint over it, hover gated to `(hover: hover)`. A chip is a toggle button only when it selects or clicks (`selected`, `onClick`, or inside Chip.Group); otherwise it is a static `<span>`. The remove control is an X glyph with the indicator radius, the micro hit area and its own label (`removeLabel`, default "Remove <label>"); a removable toggle is two sibling buttons, never nested. Chip.Group is `role="group"` with a required name (typed, dev warning) and reports `onValueChange(string[])`; `onChange` is cut.
- **What works** — `Chip.test.tsx` covers static vs toggle, the remove control and its label, sibling buttons, the one-look rule and the group's name, values and warning; `Chip.states.tsx` (new) renders tags, an icon, a removable chip, a group, an empty filter row, truncation and the lifecycle row.
- **What doesn't** — not browser-checked in this lane; the remove control's visible box is 16 inside a 24 hit area, so two removable chips need the group gap to keep their hit areas apart.
- **Candidates** — keyboard Backspace to remove a focused chip inside a field.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

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

## 2026-09-08 — one tone ramp, one recipe

- **What changed** — the per-component tone mixins are gone. `recipes/_tone.scss` publishes the shared ramp as channels (`--_fui-tone-fill/-fill-hover/-fill-active/-on-fill/-tint/-tint-hover/-tint-active/-wash/-wash-active/-ink/-line`) from the `--fui-color-<tone>-*` tokens; `channels("<tone>")` on each `.tone*` class, `channels-neutral()` on the root. Variants only read channels, so a tone looks the same in Badge, Chip and Button.
- **Ramp** — `-tint` (18% light / 26% dark of the seed) is the compact soft surface; `-wash` (10% / 16%) is the panel surface; `-text` is the contrast-derived ink; `-border` is ink at 40%; `-fill-hover/-fill-active` mix the seed toward its ink; `-on-fill` is picked by contrast (white or ink) at build time. Accent has the full ramp too (`--fui-color-accent-tint/-wash/-text`), so `tone="accent"` is no longer a one-off.
- **Chip API** — `variant` is `soft` (default, the tinted pill) or `outline`; `solid` is deleted (it was the same pill under another name). New `tone` axis (`neutral · accent · info · success · warning · danger`, default `neutral`) — the info-only `soft` is now `tone="info"`. Removable chips carry `data-tone` on the wrapper so the remove button shares the channels.
- **Selection** — unchanged; still the `--fui-field-selection-*` family.
- **Undo** — hard cut. Restoring `solid` means re-adding the class and enum; there is no alias.

## 2026-10-03 — v4 surface and token pass

- **What changed** — A selected chip wears the selection mark (UIR-D142): the wash plus the inset ring, with the hover tint painted over both. `--fui-field-selection-bg-hover` is gone.
- **Token reads** — the legacy reads are gone: `--fui-bg-tertiary`, `--fui-field-selection-bg-hover`, `--fui-field-selection-border`. motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
