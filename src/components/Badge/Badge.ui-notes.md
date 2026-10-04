# Badge — UI notes

## 2026-10-03 — Glass v4: one badge

- **What changed** — one 20px step (`badge-track("sm")`), the indicator corner, 11/550 type. `size`, `variant` (outline merged into soft; ghost cut), `active`, `dotPulse` and `dotColor` are gone. Neutral paints the band with ink2 inside this module; the tones paint their soft fill and ink. The dot takes the tone's ink. The label truncates inside its container. Remove is a phosphor `X` in a 16px tile, hover tint gated to `(hover: hover)`, focus ring, 24/44 hit area.
- **What works** — unit tests cover the cut props, the paint source, the gated remove hover and hit area, truncation, the named remove button and axe. A states fixture covers populated (paint checks), overflow and remove.
- **What doesn't** — not browser-checked in this lane. The shared `tone.channels-neutral` still tints with the hover tint, so neutral is painted here instead; Chip still reads the shared mixin.
- **Candidates** — move the band tint into `channels-neutral` (shared recipe) and drop the local override; retire the `representation.badge` mixin's md/lg branches. The unused `--fui-badge-dot-color` token is removed.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — The small badge takes the strong weight (600). Only `--fui-badge-track-sm` (20px) is the badge's own; md and lg sit on `--fui-control-height-xs` and `-sm`. The `--fui-badge-track-md` and `-lg` hooks are gone. Stories read the raw scale.
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked with a count in a table row.
- **Candidates** — None.

## 2026-09-06 — the fill is earned

- **What changed** — soft tone fills no longer read the semantic `-bg` tokens (panel tints: 10% of the seed in light, 15% in dark, right for an Alert, invisible on a pill). Each tone mixes its seed directly — `light-dark(24%, 28%)` over transparent — and the accent tone follows the same mix. Ink and outline are unchanged (the contrast-derived `-text` and `-border` tokens).
- **What was browser-verified** — Cloud pull-requests page, warning tone, measured with computed colours composited over the page: light fill vs page 1.24:1 (was 1.05), ink vs fill 4.68:1; dark fill vs page 1.61:1, ink vs fill 5.18:1. Both AA for text.
- **Candidates** — the light ink for warning is an olive (oklch L 0.50 C 0.09): a more chromatic ink would need the contrast derivation to target the tint, not the page.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` carries chrome only (`soft` · `outline` · `ghost`; `label` → `outline`, `dim` → `ghost`) and the colour values moved to a new `tone` axis (`neutral` · `accent` · `info` · `success` · `warning` · `danger`; `error` → `danger`, `default` → `neutral`) — UIR-D9.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Actions + Feedback + Display category pass.

## 2026-09-08 — one tone ramp, one recipe

- **What changed** — the per-component tone mixins are gone. `recipes/_tone.scss` publishes the shared ramp as channels (`--_fui-tone-fill/-fill-hover/-fill-active/-on-fill/-tint/-tint-hover/-tint-active/-wash/-wash-active/-ink/-line`) from the `--fui-color-<tone>-*` tokens; `channels("<tone>")` on each `.tone*` class, `channels-neutral()` on the root. Variants only read channels, so a tone looks the same in Badge, Chip and Button.
- **Ramp** — `-tint` (18% light / 26% dark of the seed) is the compact soft surface; `-wash` (10% / 16%) is the panel surface; `-text` is the contrast-derived ink; `-border` is ink at 40%; `-fill-hover/-fill-active` mix the seed toward its ink; `-on-fill` is picked by contrast (white or ink) at build time. Accent has the full ramp too (`--fui-color-accent-tint/-wash/-text`), so `tone="accent"` is no longer a one-off.
- **Neutral** — secondary ink on `--fui-bg-tertiary`; outline line is `--fui-border-strong`.
- **Undo** — restore the private `_tint`/`_tone` mixins from the previous revision of `Badge.module.scss`.

## 2026-10-03 — v4 surface and token pass

- **What changed** — Neutral sits on the band (`--fui-bg-secondary`); `--fui-badge-radius` is removed, the corner is `--fui-radius-indicator`.
- **Token reads** — the legacy reads are gone: `--fui-badge-radius`, `--fui-bg-tertiary`, `--fui-radius-l3`, `--fui-radius-lg`, `--fui-transition-fast`. Corners now read the radius roles (`indicator`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
