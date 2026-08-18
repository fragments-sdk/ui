# AppShell — UI notes

## 2026-08-13 — header slot is the reading pane

The header grid area uses `--fui-main-bg` (and forces the child `<header>`
to the same) instead of `background-color: inherit`. Inherit pulled the
canvas through and made light-mode headers match the sidebar.

## 2026-08-13 — motion

Sidebar-column interpolation is disabled under `prefers-reduced-motion`.
