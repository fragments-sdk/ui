# AppShell — UI notes

## 2026-08-13 — header slot is the reading pane

The header grid area uses `--fui-app-main-bg` (and forces the child
`<header>` to the same) so the topbar is the reading pane, not the rail.

## 2026-08-13 — motion

Sidebar-column interpolation is disabled under `prefers-reduced-motion`.
