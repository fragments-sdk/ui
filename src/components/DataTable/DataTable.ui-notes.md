# DataTable fragment notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — sub-rows sit on the band (`--fui-bg-secondary`, at zero specificity so the selection wash wins). The tree content is a block-level flex row, so the expanded parent keeps the 32 track (it measured 33 from the cell's line box). The expand button is IconButton `size="xs"`; the module override is gone. The sort button carries the 24 pointer hit area (44 coarse) without moving the head. `maxHeight` passes through to Table for a sticky head; the first column takes Table's 12 edge inset, so a checked row checkbox no longer meets the ring.
- **What works** — `DataTable.test.tsx` covers the band, the flex tree row, the xs expand button and the sort hit area.
- **What doesn't** — the 32 parent row is reasoned, not re-measured in a browser.

## 2026-10-03 — Glass: the states harness pass

- **What changed** — the table engine load re-renders even when it settles between a render and its effect; before, that window (seen in WebKit under a two-worker run) left the loading rows up for good and the fixtures timed out.
- **What works** — every DataTable fixture mounts the live table in all four projects; `overflow` passes axe through Table's focusable scroll wrapper.

## 2026-10-03 — Glass PR5: data on Glass

- **What changed** — DataTable composes Table (Table.Root, Head, Row, HeaderCell, Cell, Empty, Loading); the forked row, stripe, selection, sheet, header-fill and gradient skeleton CSS is deleted, along with `DataTable.icons.tsx` and the skeleton-row helper. Rows, the 32px track, the wash and ring, the gated hover tint, the opaque sticky head and the sheet are Table's. Cut: `size`, `density` (with `condensed`, `regular`, `relaxed`), `striped`; `emptyMessage` merges into `emptyState` (EmptyState parts in a compact EmptyState; default one line "No data"). New: `error`, `onRetry`, `retryLabel` draw the errbox row (danger tint, glyph, words, one Retry) under the real header; loading wins over error, error over empty. Loading and empty keep the header real. The sort glyph is always visible: ink 3 at rest, ink 1 on the sorted column. Clickable rows add a press tint as an image layer (selection survives hover and press) and an inset focus ring. Expand is a ghost IconButton on the micro track (24); leaf rows get a spacer so text lines up; sub-rows carry no fill, depth shows by indent on the cell content (so a flush unbordered first column keeps it). Row checkboxes take the default size.
- **What works** — `DataTable.test.tsx` covers the composed rows and sheet, empty/loading/error under the header, the state order, retry, the always-on sort glyph and tree indent; `DataTable.states.tsx` (new, `@family:tables`) renders populated, selected, tree, empty, loading, error and overflow.
- **What doesn't** — the authored contract stays `DataTable.fragment.tsx` (updated, not migrated to contract.json); `fragments.json` is not regenerated. The IconButton 24 step is a module override (compound selector) because IconButton has no micro size.
- **Candidates** — a micro size on IconButton; i18n props for the row checkbox and expand labels.
- **Not run here** — `test:states` (run once for the whole release).

- Authored states: default, loading, sortable, selectable, empty, and rendered long cell content.
- Matrix declares size, both themes, loading/empty/focus, and rendered long-cell overflow. (Until Glass
  PR5 DataTable had no error input; it now has `error` + `onRetry`.)
- The filter example composes canonical Stack and Input primitives, and the simple-comparison guidance
  points to Table rather than another DataTable.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- Integrated Bundle renewal `cd4c6d44` reconfirmed the busy Loading table, empty
  Search results message, intentional absence of an Error state, and full
  localized long-cell workflow at desktop, 390px, and 320px. Console remained
  0/0.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — ~~DataTable rows inherit the Table row changes through `recipes/_table-chrome.scss`: a selected row is the wash plus a per-cell 1px ring that stripes cannot hide, hover paints over it, and rows reach 44px under a coarse pointer (UIR-D126, UIR-D127).~~ **Corrected 2026-10-03 (Glass PR5):** this was false. DataTable shared only the track and inset channels with Table; its own module drew an ungated hover that replaced the fill, an ink-8% selection with a ring on the first cell only, and its own stripes. Since Glass PR5 DataTable composes Table, so the claim now holds.
- **What works** — the Table fixtures and `SelectionRecipe.states.tsx` prove the shared row grammar.
- **What doesn't** — DataTable has no state fixture of its own; its selection column is not read in a browser.
- **Candidates** — a DataTable fixture with row selection.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 Wave 0

- Fragment: Badge `variant` → `tone` (Active→success, otherwise warning). Typechecks once G2's Badge lands.
- Virtual spacer row moved from inline `padding: 0` to `.virtualSpacer` in the stylesheet (height stays inline, it is measured).
- Sort button `padding: 0` reads `--fui-raw-space-0`; dividers fall back to `--fui-stroke-hairline`; `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.headerRow, .row`.

## 2026-10-03 — IME-safe Enter (3.1.3)

- **What changed** — row activation skips a composing keydown, through the shared `isComposingEnter` helper (`src/utils/isComposingEnter.ts`). Fields inside a row were already skipped by `isInteractiveTarget`; this covers anything else that bubbles. No visual or API change.
- **What works** — `src/utils/isComposingEnter.test.ts` scans `src/**` and fails if an Enter check here skips the helper; the component's own tests stay green. Headless Chromium, WebKit and Firefox (2026-10-03 pass): plain Enter and Space activate a clickable row exactly once, the same as with the guard stubbed out.
- **What doesn't** — no composition test of its own; rows are not text fields.
- **Candidates** — none beyond a composition fixture in the browser render-state harness.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Selection clicks** — the row checkbox now delivers one click to the row instead of two (Checkbox upstream change). `onRowClick` already skipped both through `isInteractiveTarget`; a consumer `getRowProps().onClick` now runs once per checkbox press.

## 2026-10-03 — v4 surface and token pass

- **What changed** — The wrapper fill is the surface plane (`--fui-bg-primary`).
- **Token reads** — the legacy reads are gone: `--fui-bg-subtle`, `--fui-radius-md`, `--fui-radius-sm`, `--fui-table-bg`, `--fui-table-border`, `--fui-table-header-bg`, `--fui-table-header-border`, `--fui-table-subrow-bg`, `--fui-transition-fast`. Corners now read the radius roles (`indicator`, `surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
