# Header / AppShell — UI notes

## 2026-08-13 — header matches the reading pane

`.header` and AppShell's header slot paint `--fui-app-main-bg` (fallback
`--fui-main-bg`) so the topbar is the same plane as main — paper rail,
tertiary canvas in light; lifted rail, deeper body in dark.

`Header.Search` paints the semantic `--fui-header-search-bg` surface. The
default aliases `--fui-bg-subtle`, so search remains visible on the reading
plane without a consumer reaching into Button's private styling hooks.
