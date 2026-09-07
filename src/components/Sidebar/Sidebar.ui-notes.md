# Sidebar — UI notes

## 2026-08-13 — docs density hooks

`.section:not(:first-child)` reads `--fui-sidebar-section-gap` (fallback
16px). Docs sets it to 32px so sparse nav groups read as clusters.

Item lists read `--fui-sidebar-item-gap` (fallback 2px) and
`--fui-sidebar-item-font-size` / `--fui-sidebar-item-line-height` (fallback
ui-compact 12/16). Docs uses 4px / 14px / 20px.

Section labels read `--fui-sidebar-section-label-color` and
`--fui-sidebar-section-label-weight`. Docs uses secondary + 600.

Active rail still honors `--fui-sidebar-item-active-indicator`; docs sets it
transparent so the active row is only the gray rect.

## 2026-08-13 — mobile focus containment

A closed mobile Sidebar now combines `aria-hidden` with native `inert`.
Translating the drawer off-canvas is therefore visual only; descendants cannot
remain in the keyboard focus order.

## 2026-08-21 — section labels become eyebrows

Default section-label voice changed from quiet title-case to small tracked
uppercase (2xs / 0.07em / medium) so groups can't be mistaken for items.
Existing `--fui-sidebar-section-label-*` hooks still override; new hooks:
`-size`, `-tracking`, `-transform`.

## 2026-09-02 — no viewport cap (Brief 03)

`.root` is `height: 100%` with no `max-height: 100vh`. AppShell owns the
full-content-height rail border on the grid column; capping the inner
sidebar at one viewport made the hairline stop mid-page. Standalone
Sidebar still draws its own `border-inline-end`; inside AppShell the
column border wins and the inner edge is zeroed.

## 2026-09-03 — alias layer deleted (UI refinement, Wave 0)

The private `--fui-sidebar-row-height/-gutter/-row-gap/-row-radius/-icon-size/
-leading-size/-row-padding-x/-active-dot-size` aliases are gone; rows read
`--fui-navigation-*` hooks straight from the recipe with Sass twins from the
new `navigation.gutter()` / `row-track()` / `leading-box()` / `active-rail()`
getters. Public `--fui-sidebar-item-*`, `--fui-sidebar-bg/-border/-footer-border`
hooks stay (declared in `tokens/_variables.scss`); `--fui-sidebar-section-label-size`
joins them because docs sets it. The undeclared `--fui-sidebar-section-gap`,
`-section-label-tracking/-transform/-color/-weight`, `-item-gap`,
`-item-font-size/-line-height` hooks are inlined (single reader, no writer).
Disabled rows use the shared `disabled-state` mixin; the collapsed rail
reads `--fui-opacity-muted`.

### 2026-09-03 — `--fui-sidebar-item-radius` (UIR-D25)

- The row radius is a public hook again, in the documented `--fui-sidebar-item-*` family: `--fui-sidebar-item-radius` defaults to `var(--fui-radius-full)` in `_variables.scss`; `.item` and `.subItem` read it with the Sass twin as fallback. Products that want restrained rows set it on the `Sidebar.Root` element (Cloud sets `--fui-radius-sm`).
- `.sectionAction` and `.submenu` keep the full radius directly; they are not rows.

## 2026-09-04 Wave 1 — navigation parity (UIR-D41)

- **What changed** — the mobile panel stays a _shell_ surface (flush, full height, app background) and took only the layer tokens plus `overlay.backdrop` for its scrim, not the Drawer panel. In-shell stacking is no longer on the overlay scale: `.rail` 10 → 1, `.collapseToggleFloating` 20 → 2. The rail-indicator active grammar is unchanged, and `navigation.link-states` / `link-active` are deliberately NOT applied here.
- **What was browser-verified** — mobile1: the mobile aside measures 240 x 568 (full viewport height), `border-radius: 0`, `inset: 0`, and computes `z-index: 51` from `--fui-overlay-layer-modal` — no raw value left.
- **Not re-checked in this lane** — the open-state slide and the submenu stories; the panel is closed by default in Storybook and no story exposes a trigger.

## 2026-09-07 — glyphs in the rail, no capitals

Group labels carry no glyph (Conan: only the items themselves get icons).
`.sectionHeader` pads by the item's hairline so the label's left edge sits
on the item glyph column (browser: both at x=17).

Group labels no longer transform to uppercase and carry no tracking. The
voice is now: `xs` size (token default moved from `2xs` to `xs`), semibold,
`--fui-sidebar-faint` ink, on the shorter section track with no hover
surface. Items stay ui-compact / normal weight / muted ink, each with a glyph.
Long group names (repository slugs) truncate with an ellipsis.

The navigation glyph set lives in `assets/nav-glyph.tsx` (`NavGlyph
name="…"`): overview, repository, pullRequest, finding, contract, adoption,
component, setup, settings. 16-unit
grid, 1.5 stroke, round caps, `currentColor`; the component glyph is the
isometric cube from the illustrated cards.

Each glyph has one hover verb (`nav-glyph.module.scss`), like the cards:
overview tiles dip in turn, the repository spine cracks open, the pull
request branch draws in and its head pops, the finding flag waves, the
contract lines write themselves, the adoption bars rise, the cube's inner
edges redraw, the setup prompt nudges while its cursor blinks, the settings
knobs slide. The trigger is the enclosing `a`/`button` `:hover` or
`:focus-visible`, so it works in any nav; nothing moves at rest, and the
whole block sits under `prefers-reduced-motion: no-preference`. Browser:
every row fires its verb with the intended stagger; the flag's rotation
does not clip (`overflow: visible`).

Corrections to the 2026-08-13 note above: the library never read
`--fui-sidebar-item-font-size` / `-line-height` or
`--fui-sidebar-section-label-color` / `-weight`; only `-size` is a live
hook. Cloud's dead `-item-font-size` assignment is removed.

Known: in the light theme `--fui-text-tertiary` and `--fui-text-secondary`
are near-identical (88,83,76 vs 89,84,79), so the group label's ink barely
differs from an item's; weight and the shorter track do the work. A mixed-down ink
was tried and rejected — it fell under 4.5:1 in dark. Fix belongs in the
theme tokens.
