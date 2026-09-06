# Badge — UI notes

## 2026-09-06 — the fill is earned

- **What changed** — soft tone fills no longer read the semantic `-bg` tokens (panel tints: 10% of the seed in light, 15% in dark, right for an Alert, invisible on a pill). Each tone mixes its seed directly — `light-dark(24%, 28%)` over transparent — and the accent tone follows the same mix. Ink and outline are unchanged (the contrast-derived `-text` and `-border` tokens).
- **What was browser-verified** — Cloud pull-requests page, warning tone, measured with computed colours composited over the page: light fill vs page 1.24:1 (was 1.05), ink vs fill 4.68:1; dark fill vs page 1.61:1, ink vs fill 5.18:1. Both AA for text.
- **Candidates** — the light ink for warning is an olive (oklch L 0.50 C 0.09): a more chromatic ink would need the contrast derivation to target the tint, not the page.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` carries chrome only (`soft` · `outline` · `ghost`; `label` → `outline`, `dim` → `ghost`) and the colour values moved to a new `tone` axis (`neutral` · `accent` · `info` · `success` · `warning` · `danger`; `error` → `danger`, `default` → `neutral`) — UIR-D9.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Actions + Feedback + Display category pass.
