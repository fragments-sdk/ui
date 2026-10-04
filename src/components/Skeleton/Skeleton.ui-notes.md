# Skeleton — UI notes

## 2026-10-03 — Glass PR5: data on Glass

- **What changed** — one band bar with the press-tint pulse (the recipe), at the indicator radius by default. The text bar is 10px (the ink of a 12px line) and the heading bar 12px (the same ratio for a 15px title); Skeleton.Text lines sit at the 18px body pitch (10px bar, 8px gap). The avatar is a square at the indicator radius at Avatar's xs/sm/md sizes (24/32/40). `shape="button"` and `shape="input"` merge into `shape="control"` (control radius, tracks 28/32/40). New `shape="row"`: the 32px row track holding one text bar, for a list or table row that has not arrived. Cut: `radius`, `static` (reduced motion already holds every bar still), `Skeleton.Circle` (use `shape="avatar"`), and Skeleton.Text `gap` (one gap left, so the prop went).
- **What works** — `Skeleton.test.tsx` reads the compiled module (bar heights, avatar sizes, control radius, row track, pulse and reduced motion); `Skeleton.states.tsx` adds rows and a control and checks a 10px text bar.
- **What doesn't** — no 24px control placeholder: no public control renders at 24 and the size vocabulary is sm|md|lg. The shared `representation.skeleton` recipe still carries the old avatar map (32/40/48) and the button/field kinds; this module no longer reads it.
- **Candidates** — delete `representation.skeleton` once nothing reads it.
- **Not run here** — `test:states` (run once for the whole release).

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — The contract and stories read `--fui-raw-space-*` instead of `--fui-space-*`.
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Stories and contract only; no component change.
- **Candidates** — None.

## 2026-10-03 — Skeleton.Text shimmer (3.1.3)

- **What changed** — `Skeleton.Text` lines animated `skeleton-pulse`, which no `@keyframes` defined, so they never moved. Lines now share `Skeleton`'s fill through one local `shimmer-fill` mixin: the `--fui-skeleton` base, the `--fui-skeleton-hi` highlight and `skeleton-shimmer`. The base moved from `--fui-bg-tertiary` to `--fui-skeleton` (the same bar `shape="text"` draws). Under reduced motion both drop the animation and the gradient: a still, flat bar.
- **What works** — `Skeleton.test.tsx` compiles the module, parses it with the DOM's CSS parser, and checks every `animation` names a defined `@keyframes`, text lines match the base shimmer, and reduced motion is still. Headless Chromium, WebKit and Firefox report `animation-name: skeleton-shimmer`, and `none` with `background-image: none` under `reduce`.
- **What doesn't** — `Skeleton.Text` has no `static` prop (only `Skeleton` does); it relies on the media query.
- **Candidates** — a library-wide check that every `animation` in a module names a defined `@keyframes`.

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant` → `shape` (`SkeletonShape`: `text` | `heading` | `avatar` |
  `button` | `input` | `rect`); values unchanged, the old prop is a TypeScript
  error (UIR-D16). `Skeleton.Text` `gap` stays `sm` | `md`, inside the ruled set.
- `radius="none"` paints `--fui-raw-space-0` instead of a literal `0`; the
  button-width and line-gap fallbacks read `measurements.raw-space()` instead
  of bare px; physical `width`/`height` became logical properties.

What still does not work

- `text` / `heading` heights are em literals (`1em`, `1.5em`), tied to the
  surrounding font rather than a typography role.

Improvement candidates

- Drive `text` / `heading` from `typography.line-height()` so a heading
  skeleton matches the real `title-*` roles exactly.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — the band comes from `recipes/_skeleton.scss` (`skeleton.band`, keyframes `fui-skeleton-shimmer`); under reduced motion it is one still band (`skeleton.still`). New `Skeleton.states.tsx` (`@family:feedback`): loading and loadingReducedMotion.
- **What works** — every bar shimmers in the fill colour; under emulated reduced motion each bar is flat and nothing animates (all four projects).
- **What doesn't** — the other states are argued n/a: a skeleton is only ever loading.
- **Candidates** — none from this pass.

## 2026-10-03 — v4 surface and token pass

- **What changed** — The bar reads the band (`--fui-bg-secondary`) with the press tint as its highlight; `--fui-skeleton` and `--fui-skeleton-hi` are removed. The motion recipe lane owns the pulse that replaces the shimmer.
- **Token reads** — the legacy reads are gone: `--fui-radius-lg`, `--fui-radius-md`, `--fui-radius-sm`, `--fui-skeleton`. Corners now read the radius roles (`control`, `indicator`, `surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — motion, type and state recipes

- **What changed** — the bar is the band with the press tint pulsing over it on `::after` (`fui-skeleton-pulse`, opacity only, alternate, UIR-D144); no gradient, nothing travels. Reduced motion holds a still band. `--fui-skeleton` and `--fui-skeleton-hi` are no longer read.
- **What works** — module and recipe tests pin the band, the tint, the keyframes and the absence of any gradient; `Skeleton.states.tsx` reads the `::after` computed style.
- **What doesn't** — the bar's own `::after` is taken.
- **Candidates** — none open: `--fui-skeleton` / `--fui-skeleton-hi` are already gone from the token sources (UIR-D145).
