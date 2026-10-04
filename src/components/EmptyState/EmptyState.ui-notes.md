# EmptyState — UI notes

## 2026-10-03 — Glass v4: start-aligned, band icon tile, padding-only size

- **What changed** — the state is start-aligned: icon, copy and actions line up with the content around it. `EmptyState.Icon` is a 36px tile on the band plane, its corner nested in the surface corner across 12. It holds an 18px glyph in ink 2 and is hidden from assistive tech. The title is the `title-sm` role (15/550) in ink 1; the copy is 12 ink 2 at the measure token, `--fui-feedback-empty-max-inline-sm|md` (40ch). Icon and actions sit 12 from the copy. `size` now changes padding only (`sm` 24/16, `md` 32/24). The shared `feedback.empty-state` recipe and `--fui-feedback-empty-max-inline-lg` are deleted (nothing else read them). Cut: `size="lg"`, the `variant` prop (`outline` included, per the ledger), the context, `useEmptyStateContext`, and the flat exports. With no hooks left, the module is no longer a client module.
- **What works** — the unit tests cover the size class, the hidden icon tile and type-level checks for the cut props. A new states fixture checks the start alignment, the missing frame, the band tile at 36px, and the ink-2 glyph and copy. The Sass compiles.
- **What doesn't** — not browser-checked; the states lane was not run in this batch. The 36px tile is `32 + 4` from the raw scale, because no tile token exists yet.
- **Candidates** — a tile token shared with the other icon tiles; delete or realign `feedback.empty-state` in the recipes lane.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant="plain"` → `ghost` (default), `variant="outlined"` → `outline`; the
  old values are TypeScript errors. Class `.outlined` → `.outline`.
- `--fui-feedback-section-gap` (read only here, declared nowhere) is inlined
  as `--fui-raw-space-16` with its measurement fallback.
- Every `--_fui-feedback-empty-*` channel the size recipe authors is read with
  a fallback: the md type roles (`ui-standard` title, `body-compact` copy),
  `--fui-icon-2xl` for the icon, and `--fui-overlay-tooltip-max` (320px) for
  the copy measure. Both `margin: 0` sites read `--fui-raw-space-0`.
- The contract examples use `Button variant="soft"` for the secondary action.

What still does not work

- `recipes/_feedback.scss` (orchestrator-owned) still reads
  `--fui-feedback-empty-max-inline-sm|md|lg` and `--fui-feedback-empty-icon-lg`,
  which no token file declares; the fallbacks there are bare px.

Improvement candidates

- Promote the three copy measures to `_variables.scss` so the recipe stops
  carrying literal widths.

## 2026-09-07 — Rendering hints belong to the lib root

- **What changed** — the `-webkit-font-smoothing` / `-moz-osx-font-smoothing` pair was deleted here (it was the only component setting them; the rule is that rendering hints live once, at the root). Prettier drift in the same file was reformatted.
- **What works** — the EmptyState suite is green at this HEAD.
- **Unchanged** — the `--_fui-feedback-empty-*` channel warnings from `fragments check` predate this edit.

## 2026-09-07 — Title level follows the outline

- **What changed** — `EmptyState.Title` takes `as` (`h2` | `h3` | `h4` | `p`,
  default `h3`). A page whose first heading is the empty state was skipping
  from the h1 to an h3; the caller now picks the level that fits its outline.
- **What works** — existing callers render unchanged (default stays `h3`).

## 2026-10-03 — role tokens

- **What changed** — the inline measure is 40ch at every size, read from `--fui-feedback-empty-max-inline-{sm,md,lg}` (was 240 / 320 / 400px, UIR-D119).
- **What doesn't** — at 40ch the small size is wider than before, so a narrow container clamps it.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-border-default`, `--fui-card-radius`, `--fui-radius-lg`. Corners now read the radius roles (`surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
