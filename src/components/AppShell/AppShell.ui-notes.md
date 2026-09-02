# AppShell — UI notes

## 2026-08-13 — header slot is the reading pane

The header grid area uses `--fui-app-main-bg` (and forces the child
`<header>` to the same) so the topbar is the reading pane, not the rail.

## 2026-08-13 — motion

Sidebar-column interpolation is disabled under `prefers-reduced-motion`.

## 2026-09-02 — full-height rail, one ground (Brief 03)

The sidebar **column** (`align-self: stretch`, `height: auto`) carries the
`--fui-border-subtle` hairline so the rail runs the full content height.
The sticky inner `<aside>` is viewport-tall for nav scrolling and has no
end border. Do not move the border back onto Sidebar `.root` — that only
paints one viewport.

Header and main already share `--fui-app-main-bg`. Docs must not paint
`main` with `--fui-main-bg` (paper in light) or the header reads as a
different band. Fix ground at this layer, not with a docs override.
