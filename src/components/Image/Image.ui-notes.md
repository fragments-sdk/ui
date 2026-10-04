# Image — UI notes

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — `rounded` became `radius` with the radius roles (`none`, `control`, `nested`, `surface`), the same names as Box; `none` leaves the corner to the container that clips it, and `rounded="full"` is cut (Avatar owns circles). `aspectRatio="21:9"` and `objectFit="fill" | "none"` are cut. The frame carries `data-state="loading|loaded|error"` instead of an inline opacity: loading pulses the band (the skeleton recipe) with `aria-busy`, the image fades in over `--fui-duration-micro` (none under reduced motion), and a failed image shows a built-in fallback (glyph plus the alt words in caption ink 3) unless `fallback` replaces it. Width and height land as logical sizes. New `Image.states.tsx` (`@family:primitives`).
- **What works** — `Image.test.tsx` covers the three states, the built-in and caller fallbacks, the radius roles and type errors on every cut value.
- **What doesn't** — the loading fixture draws the frame from the module class rather than a slow network request, so it proves the look, not the timing.
- **Candidates** — `srcSet`/`sizes` passthrough is reachable through `imgProps` only; a `caption` part if a product surface needs one.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- Nothing in the component: no vocabulary move, no governance findings.

What still does not work

- No known defects this wave.

Improvement candidates

- Re-scan after the Wave 1 token pass; both files read only shared tokens.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-radius-lg`, `--fui-radius-md`, `--fui-radius-sm`, `--fui-transition-normal`. Corners now read the radius roles (`control`, `indicator`, `surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
