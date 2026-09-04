# Loading — UI notes

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
