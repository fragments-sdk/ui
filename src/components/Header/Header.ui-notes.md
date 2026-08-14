# Header / AppShell — UI notes

## 2026-08-13 — header matches the reading pane

`.header` and AppShell's header slot paint `--fui-main-bg` instead of
inheriting the shell canvas (`--fui-body-bg`). Docs (and any AppShell
consumer) now get a search/chrome bar that matches the main sheet in both
modes. Previously light mode inherited paper and matched the sidebar.

`Header.Search` paints the semantic `--fui-header-search-bg` surface. The
default aliases `--fui-bg-subtle`, so search remains visible on the reading
plane without a consumer reaching into Button's private styling hooks.
