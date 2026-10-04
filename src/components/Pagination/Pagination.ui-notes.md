# Pagination — UI notes

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the current page is the nav marking (UIR-D126): `--fui-bg-active`, ink 1, the semibold weight, no ring (was the selection wash). Hover paints the hover tint over an item, only where the pointer can hover, so the current page keeps its fill.
- **What works** — `Pagination.states.tsx` (new, `@family:navigation`) renders populated, empty, overflow and a hovered, focused lifecycle row; `Pagination.test.tsx` asserts `@include selection.current`.
- **What doesn't** — the current page is not read by a computed-style check; only the source assertion and the screenshot cover it.
- **Candidates** — add Pagination to `SelectionRecipe.states.tsx` if the marking drifts.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 Wave 0

- Zero margin/padding read `--fui-raw-space-0`; `.itemDisabled` rides `@include disabled-state;`; `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.itemActive`.
- Raw `<button>`s kept: the kit Button/IconButton are mid-migration in G2's folders and the swap would couple to in-flight files. Candidate for Wave 1.

## 2026-10-03 — v4 surface and token pass

- **What changed** — The current page takes `selection.current`: the selection wash plus its inset ring at the regular weight.
- **Token reads** — the legacy reads are gone: `--fui-radius-md`, `--fui-transition-fast`. Corners now read the radius roles (`control`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — motion, type and state recipes

- **What changed** — the current item (`selection.current` via `navigation.link-active`) now takes the selection wash plus the 1px selection ring at the regular weight, the same marking as a selected row (UIR-D142); nav links round at the control radius and move in the micro role. No module change.
- **What works** — `SelectionRecipe.states.tsx` checks the current nav item's wash, ring, ink 1 and regular weight.
- **What doesn't** — not browser-checked in this component's own stories in this lane.
- **Candidates** — a current-item state in this component's fixture.

## 2026-10-03 — navigation core on Glass

- **What changed** — pages draw at the regular weight with tabular figures; the current page keeps `.itemActive` on `selection.current` (wash + ring) with `aria-current="page"`. Items use `action.motion` (m.micro), gated hover tint, `focus.visible` and `action.disabled` (the separate disabled class is gone). Steps use the library caret glyph, turned for right-to-left pages. Nothing renders when there are no pages (the empty `<nav>` is gone). `renderLink(page)` makes every page and step a link (anchor or router link) that still reports the page; a boundary step stays a disabled button. Cut: `size="lg"` (resolves to `md`), `edgeCount` (the first and last page always show), the manual `Pagination.Item`/`Pagination.Ellipsis` parts (use `Pagination.Items`), the flat `Pagination*` exports and the empty nav-button SCSS block.
- **What works** — unit tests cover the range with fixed edges, the one-page-gap rule, nothing at zero pages, the size clamp, link mode, step handlers that prevent the change, and axe.
- **What doesn't** — fixtures not rendered in this lane.
- **Candidates** — a page-size picker beside the row belongs to DataTable, not here.
