# Breadcrumbs — UI notes

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — Gaps read `--fui-raw-space-6` (was 7px); the text reads the body-compact role (12px) and the current crumb takes the semibold weight.
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked with a long trail.
- **Candidates** — None.

## 2026-09-06 — a plain item hands clicks to its own control

- **What changed** — `Breadcrumbs.Item` with neither `href` nor `current` renders its child in a plain `.content` span (layout only) instead of the `.link` span. The link span's `hit-area("micro")` `::after` overlay sat over an interactive child (Cloud's header org menu and repository picker) and took every click.
- **What works** — `Breadcrumbs.test.tsx` covers a button inside a plain item receiving its click; link and current items are unchanged.
- **Candidates** — an `asChild` item so a router link can be the crumb without the `href` anchor.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: `margin`/`padding` zeros read `measurements.raw-space(0)` and the hairline reads `$fui-stroke-hairline`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass, which also owns the pre-existing bare px in `Breadcrumbs.module.scss` (follow-ups in `docs/fragments-v1/ARCHITECTURE.md`).

## 2026-09-04 Wave 1 — navigation parity (UIR-D41)

- **What changed** — both `max-width: 200px` truncation caps read `layout.measure("menu-min")` (192px, the nearest existing measure) instead of a raw pixel value.
- **What was browser-verified** — Default: every crumb computes `max-width: 192px` with `text-overflow: ellipsis` intact.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-radius-sm`, `--fui-transition-fast`. Corners now read the radius roles (`control`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — navigation core on Glass

- **What changed** — the last item is the current page by position: never a link, `aria-current="page"`, ink 1, no separator after it (`Item current` is cut). One separator, the ink 3 caret at icon-xs, sits inside each item so the list counts only crumbs; `separator` and `Breadcrumbs.Separator` are cut. `Item icon` is cut. A crumb is a link with `href`, the given element with `render` (router links), a button with `onClick` alone, or a plain slot for a control of its own. Crumbs are h24 at the control radius, ink 2, the hover tint and ink 1 on gated hover, and the hit area grows under a coarse pointer (truncation moved to an inner label so the hit area is not clipped). `maxItems` folds the items after the first into one menu behind a `…` trigger with no border; the folded crumbs are menu links. The flat `BreadcrumbsRoot/Item/Separator` exports are cut.
- **What works** — unit tests cover the implicit current page, separator placement, `href`, `render`, `onClick`, a plain slot keeping its own clicks, the fold menu, and axe with and without the fold. New `Breadcrumbs.states.tsx`.
- **What doesn't** — fixtures not rendered in this lane; the fold menu is built on the menu primitive directly with the popup recipes rather than through `Menu`, whose trigger still takes `asChild`.
- **Candidates** — move the fold onto `Menu` once its trigger takes `render`.
