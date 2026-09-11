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

## 2026-09-08 — one tone ramp, one recipe

- **What changed** — the per-component tone mixins are gone. `recipes/_tone.scss` publishes the shared ramp as channels (`--_fui-tone-fill/-fill-hover/-fill-active/-on-fill/-tint/-tint-hover/-tint-active/-wash/-wash-active/-ink/-line`) from the `--fui-color-<tone>-*` tokens; `channels("<tone>")` on each `.tone*` class, `channels-neutral()` on the root. Variants only read channels, so a tone looks the same in Badge, Chip and Button.
- **Ramp** — `-tint` (18% light / 26% dark of the seed) is the compact soft surface; `-wash` (10% / 16%) is the panel surface; `-text` is the contrast-derived ink; `-border` is ink at 40%; `-fill-hover/-fill-active` mix the seed toward its ink; `-on-fill` is picked by contrast (white or ink) at build time. Accent has the full ramp too (`--fui-color-accent-tint/-wash/-text`), so `tone="accent"` is no longer a one-off.
- **Chip API** — `variant` is `soft` (default, the tinted pill) or `outline`; `solid` is deleted (it was the same pill under another name). New `tone` axis (`neutral · accent · info · success · warning · danger`, default `neutral`) — the info-only `soft` is now `tone="info"`. Removable chips carry `data-tone` on the wrapper so the remove button shares the channels.
- **Selection** — unchanged; still the `--fui-field-selection-*` family.
- **Undo** — hard cut. Restoring `solid` means re-adding the class and enum; there is no alias.
