# Loading — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the `LoadingRoot` and `LoadingScreen` flat exports are cut (`Loading`, `Loading.Screen`).
- **What works** — unit tests pass.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant` → `kind` (`LoadingKind`: `spinner` | `dots` | `pulse`) on `Loading`
  and `Loading.Screen`; `variant` is not chrome here, so it is gone (UIR-D16).
  `size` keeps `xl` (glyph-scale component).
- Seven literal dim opacities in `Loading.module.scss` now read tokens:
  spinner/inline reduced-motion `0.7` and dots reduced-motion `0.6` →
  `--fui-opacity-muted`; bounce trough `0.4`, pulse ring rest `0.3`, pulse
  ring reduced-motion `0.2` and the ring keyframe `0.5` → `--fui-opacity-disabled`.
  The ring at rest and under reduced motion is therefore a touch heavier than
  before (0.5 instead of 0.3 / 0.2); a `--fui-opacity-faint` token would
  restore the lighter step.
- Dot stagger is a fraction of the pulse loop (`--fui-duration-pulse` / 8, / 4)
  instead of `0.2s` / `0.4s`.
- `--inline-size` (an unprefixed property that could collide with a consumer)
  is `--_loading-inline-size`, read with an `--fui-icon-md` fallback.
- `Loading.Screen` and the overlay backdrop sit on `--fui-overlay-layer-modal`
  / `--fui-overlay-layer-backdrop` with Sass twins instead of `100` / `50`.

What still does not work

- `--_loading-inline-size` is still an em literal (`0.875em`, `1.125em`);
  there is no text-relative measurement in the catalog to point at.

Improvement candidates

- Fold `color` (`accent` | `current` | `muted`) onto the shared `tone` axis
  once a `current` tone value has a ruling.

## 2026-09-12 — Connected Fragments drawing

- `kind="fragments"` adds an opt-in outline drawing built from the canonical
  symbol. The top/stem junction stays connected as in the supplied artwork.
- Each path draws, holds and releases over 1.2 times the shimmer duration,
  staggered by 0.08/0.16 times that duration. A faint complete track persists.
- Small loaders increase stroke width; all sizes retain the same paths.
- Reduced motion disables animation and shows the complete outline at full opacity.
- `Loading.Screen` accepts the existing `color` choices and has one accessible
  status announcement. Its inner visual is decorative.
- Existing spinner/dots/pulse defaults and inline loaders remain available.
- Cloud sign-in/account full-page gates use `kind="fragments" color="current"`.
  Page-specific skeletons and navigation behavior are unchanged.

Verification: component/a11y tests, Cloud route-loading and gate tests, UI/Cloud
TypeScript, plus the offline browser verifier for light/dark, 390/768/1440px,
playback controls, and reduced motion. The Cloud governance check is unavailable
in this checkout because its existing connection configuration is invalid.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — the spinner comes from `recipes/_loading.scss` (keyframes `fui-loading-spin`) and keeps turning under reduced motion: it is essential progress (UIR-D102); the old reduced-motion stop is gone. New `Loading.states.tsx` (`@family:feedback`): loading and loadingReducedMotion.
- **What works** — the fixture checks the spinner turns at 0.7s and its current time advances, with and without reduced motion. This only holds since the globals blanket was removed (UIR-D140); before, the spinner froze.
- **What doesn't** — the other states are argued n/a.
- **Candidates** — pair with `useLoadingPhase` so callers show nothing for the first second.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-radius-md`. Corners now read the radius roles (`surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — AI surface on Glass

- **What changed** — one spinner at the icon md size (16px), `currentColor`, from the loading recipe. `kind`, `size`, `color`, `centered` and `overlay` are cut. `inline` (1em, sits in a line of text) replaces `Loading.Inline`; `fill` centres it in its parent (replaces `centered`). `delay` (default 1s) keeps the status region mounted and empty until it passes, so fast loads show nothing; `useLoadingDelay` is exported. `Loading.Screen` keeps the fixed canvas cover with an optional visible label. The previous decorative mark is gone.
- **What works** — 8 unit tests; states: loading, loadingReducedMotion, lifecycle (nothing for the first second).
- **What doesn't** — not browser-checked in this lane.
- **Candidates** — a progress variant when the wait has a known length.
- **States fixture** — the size check reads the spinner's layout width, not its bounding box, which grows as the square turns (it read 18–20px mid-turn).
