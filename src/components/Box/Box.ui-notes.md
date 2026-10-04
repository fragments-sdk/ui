# Box — UI notes

## 2026-10-03 — Glass v4: Box is the plane primitive

- **What changed** — Box now does one job: put content on a plane. The props are `plane` (canvas, band, surface, raised), `border` (`true`, `block-start` or `block-end`, the one `--fui-border` hairline), `radius` (none, control, nested, surface) and `inset` (none, compact, default from the surface inset recipe). Cut: `shadow`, `background`, `padding*`, `margin*`, `rounded`, the four physical border sides, `borderColor`, `color`, `display`, `overflow` and the six size props. Each plane resets ink to `--fui-text-primary`.
- **What works** — the unit tests cover every plane, border side, radius and inset class, plus type-level checks that the cut props are gone. The Sass compiles and the module carries no baseline exceptions. A new states fixture checks each plane's paint, that no plane casts a shadow, and the hairline colour.
- **What doesn't** — not browser-checked; the states lane was not run in this batch. Clipping to the radius is not automatic, because it would clip child focus rings.
- **Candidates** — `inline-start` / `inline-end` borders if a rail ever needs them (Sidebar owns its own edge today).

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: `border-radius: 0` reads the new `--fui-radius-none` (UIR-D20) and every hairline border reads `$fui-stroke-hairline`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-10-03 — role tokens

- **What changed** — `shadow="md"` and `shadow="lg"` read `--fui-shadow-popup`; `shadow="sm"` keeps `--fui-shadow-sm`. The radius props still read the deprecated aliases, which now resolve to the radius roles (UIR-D115, UIR-D117).
- **What doesn't** — `md` and `lg` now cast the same shadow, so the prop has one real step above `sm`.
- **Candidates** — collapse the `shadow` prop to `none` / `sm` / `popup` at v4.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-bg-tertiary`, `--fui-border-default`, `--fui-color-danger-border`, `--fui-radius-lg`, `--fui-radius-md`, `--fui-radius-sm`. Corners now read the radius roles (`control`, `indicator`, `surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
