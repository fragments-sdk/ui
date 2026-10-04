# Table — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the head could never stick: the wrapper scrolls inline, so it is the head's scrollport on both axes. New `maxHeight` bounds the wrapper; the rows scroll inside it, the head sticks to its top and fills the surface plane only once rows pass under it (`data-scrolled`). Unbounded, the head scrolls with the page and draws no band on the canvas. The first column starts 12 in on every table and every other cell pads 8 (the unbordered flush edge is cut), so content never meets a selected row's ring. The dividers on both sides of a selected row go clear, so the ring alone draws its edges: WebKit painted the collapsed divider over the ring's top edge. The header-content gap reads the space token.
- **What works** — `Table.test.tsx` covers the edge inset, the clear dividers, the bounded wrapper and its scroll mark; `Table.states.tsx` `lifecycleStickyHead` scrolls a bounded table and checks the head holds and fills, and `populated` checks the 12 inset and the clear head.
- **What doesn't** — the WebKit ring fix is reasoned from the collapsed-border paint order, not yet re-traced in WebKit.

## 2026-10-03 — Glass: the states harness pass

- **What changed** — the scroll wrapper takes a tab stop while a wide table overflows (the shared overflow-focusable hook, now on either axis), with the inset ring. The `populated` fixture reads the row against the hit-area floor, so the coarse project expects 44px.
- **What works** — `DataTable.states.tsx` `overflow` passes axe `scrollable-region-focusable`; `Table.states.tsx` `populated` passes on the coarse project.

## 2026-10-03 — Glass PR5: data on Glass

- **What changed** — one row track, the control track (32px; 44px under a coarse pointer). `size`, `density` (with `condensed`, `regular`, `relaxed`), `striped` and `Row.band` are cut; `Caption.hidden` merges into `visuallyHidden`. Column heads are ui-compact 11 in ink 2, cells body-compact 12 in ink 1. Rows are transparent and hover is instant (no transition), gated to hover-capable pointers, painted over the row so a selected row keeps its wash and ring. The sticky head is opaque on `--fui-bg-primary` and its line is an inset hairline on each head cell, so the line travels with the head. The footer line is `--fui-border`. `bordered` draws the sheet with `surface.plane` (plane, hairline, surface radius). An unbordered table zeroes the end inset of the last column as well as the start inset of the first (decision 28). New parts: `Table.Empty` (a full-width row holding a compact EmptyState) and `Table.Loading` (placeholder rows, one band bar per cell, the header kept real).
- **What works** — `Table.test.tsx` reads the compiled module (one track, no stripe or density selectors, opaque sticky head, inset head line, sheet) and the Empty/Loading markup; `Table.states.tsx` renders populated (with token checks: 32px row, 11/12px type, ink 2 heads, transparent rows, no transition, opaque head), bordered, empty, loading, overflow and a selected row.
- **What doesn't** — the head sticks to the table's own scroll wrapper; it does not stick to the page when the wrapper does not scroll vertically. In an unbordered table the ring of a selected row touches the first and last cells' text.
- **Candidates** — a scroll container prop so the sticky head can stick to the page; an inset on the end cells when a row can be selected.
- **Not run here** — `test:states` (run once for the whole release).

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — a selected row is the selection marking (UIR-D126): the `--fui-table-row-selected-bg` wash plus a 1px ring that each cell draws (top and bottom on every cell, start and end on the first and last, swapped right to left), so zebra stripes never hide it. `--fui-table-row-selected-border` now points at `--fui-control-selected-border` (was `--fui-border-strong`). Hover is the hover tint as a background image over the row. Rows take `max(density track, --fui-hit-area)`: 44px under a coarse pointer (UIR-D127).
- **What works** — `SelectionRecipe.states.tsx` reads the wash, a ring on every cell and the tint over a hovered selected striped row; `Table.states.tsx` (new, `@family:tables`) renders populated, empty, overflow and a striped selected row; `FocusRecipe.states.tsx` (`stackedRows`) reads 44px coarse rows with no overlap.
- **What doesn't** — in an unbordered table the first cell has no inline-start padding, so the ring touches the first cell's text.
- **Candidates** — give an unbordered table's first and last cells an inline inset when a row can be selected.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-08-13 — bordered overflow

Bordered tables keep horizontal scrolling on their canonical wrapper instead of
clipping wide columns. The wrapper still hides vertical overflow so rounded
border chrome remains contained.

## 2026-08-24 — bordered cell inset

Only unbordered, card-integrated ledgers remove the first cell's inline-start
inset. A bordered Table owns its frame, so header and body content keep the
density recipe's inline inset on both edges, including hover and selected rows.
The flush selector is anchored to the owning Table structure so an unbordered
outer ledger cannot remove the inset from a bordered Table nested in one of its
cells.

## 2026-09-03 Wave 0

- `--fui-table-row-bg` falls back to `--fui-bg-primary`; `--fui-table-divider-size` falls back to `--fui-stroke-hairline`.
- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.row` and `.thead > tr` (CanvasText dividers dropped).
- Still open: `Table.test.tsx` "removes the leading cell inset…" fails because the uncommitted `recipes/_table-chrome.scss` declares `$_cell-inline-inset: cell-inline-inset("regular")` before the function exists (orchestrator-owned).

## 2026-10-03 — v4 surface and token pass

- **What changed** — Rows are transparent over the plane the table sits on; only the stripe and the row states paint. Header and subrow fills read the band.
- **Token reads** — the legacy reads are gone: `--fui-bg-subtle`, `--fui-main-bg`, `--fui-radius-md`, `--fui-table-bg`, `--fui-table-border`, `--fui-table-header-border`, `--fui-table-subrow-bg`, `--fui-transition-fast`. Corners now read the radius roles (`surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
