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
