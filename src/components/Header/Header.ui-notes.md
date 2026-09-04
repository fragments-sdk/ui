# Header / AppShell — UI notes

## 2026-08-13 — header matches the reading pane

`.header` and AppShell's header slot paint `--fui-app-main-bg` (fallback
`--fui-main-bg`) so the topbar is the same plane as main — paper rail,
tertiary canvas in light; lifted rail, deeper body in dark.

`Header.Search` paints the semantic `--fui-header-search-bg` surface. The
default aliases `--fui-bg-subtle`, so search remains visible on the reading
plane without a consumer reaching into Button's private styling hooks.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: `$fui-stroke-hairline` / `$fui-stroke-default` and `measurements.raw-space(0)` replace the bare `1px`/`2px`/`0` literals, and the stories plus contract examples moved to the ruled Button vocabulary (UIR-D31).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass, which also owns the pre-existing bare px in `Header.module.scss` (follow-ups in `docs/ui-refinement/00-foundations.md`).

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- `.navMenuPopup` dropped its duplicate `box-shadow` (the recipe already sets it); it now renders at `--fui-radius-l1` like every other floating surface. Not browser-checked in this lane — the navigation lane owns Header.

## 2026-09-04 Wave 1 — navigation parity (UIR-D41, UIR-D42, UIR-D44)

- **What changed** — `.mobileNavBackdrop` is `overlay.backdrop`, `.mobileNavDrawer` is `overlay.side-panel("end")`; the raw 98/99 z-indexes, the local widths and the `border-left` are gone (the recipe surface carries the hairline edge). `.navMenuPositioner` reads `--fui-overlay-layer-anchored`, `.skipLink` reads `--fui-overlay-layer-tooltip`. Mobile nav links take `navigation.link-states` / `navigation.link-active`; `.mobileNavBody` takes the navigation gutter so its rows inset like NavigationMenu (UIR-D42). A `MobileNav` story was added — the surface previously had none (UIR-D44).
- **What was browser-verified** — mobile1, drawer opened with a real click, in `light`, `dark` and `sharp`: panel inset 16px on all sides (288x536 in a 320x568 frame); light `l1` 8px / dark `#262421` on `#343029` hairline / sharp 0px. Rows: active `--fui-text-primary` on the 9% `--fui-control-selected-bg` wash, inactive secondary ink, `l2` radius following the profile (6px default, 0 sharp).
- **Not re-checked in this lane** — the desktop nav popup (UIR-D40) and the sticky/elevated-on-scroll header.
- **Candidates** — rest/active weight is inert (see UIR-D43); the type role owns it.

## 2026-09-04 Wave 1 — four render states, measured (UIR-D46)

- Mobile nav panel measured at 320x568 in all four render states: **288x536 at (16, 16)**, elevated fill, `z-index: 51`, scrim at `z-index: 50`; radius 7.994 / 7.994 / 0 / 14px. Byte-identical to NavigationMenu's drawer on every measured value.
- The entrance parks at `overlay.side-panel-offscreen("end")` so the 16px inset is not painted before the slide (UIR-D46).
