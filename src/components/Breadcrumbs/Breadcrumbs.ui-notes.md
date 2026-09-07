# Breadcrumbs — UI notes

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
