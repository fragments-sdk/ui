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
