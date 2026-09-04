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
