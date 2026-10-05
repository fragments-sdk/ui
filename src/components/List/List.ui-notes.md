# List — UI notes

## 2026-10-05 — current rows take the wash alone

- **What changed** — A row the consumer marks `aria-current` (a nav link) takes `selection.current`: the wash alone, no ring (UIR-D152). `selected` and `aria-pressed` rows keep the wash and the ring, which is now the neutral field edge. A `selected` row also sets `aria-current`; it keeps its ring.
- **What works** — `List.test.tsx` pins both rules; the List state fixtures pass in Chromium, light and dark.
- **What doesn't** — nothing new.
- **Candidates** — none.

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — `List.Row` rings focus outside the row: the inset ring sat on the chosen row's own inset selection ring, so focus hid the selection. The flat part exports (`ListRoot`, `ListItem`, `ListRow`) are cut; `List.Root`, `List.Item` and `List.Row` are the one form (MIGRATION-v4). The state fixtures moved to the tables family.
- **What works** — `List.test.tsx` checks the outside ring in the compiled styles; the new `lifecycleSelectedFocus` fixture checks the ring offset and the kept inset ring under focus; `src/compound-exports.test.ts` holds the export cut.
- **What doesn't** — a List inside a clipping container (a ScrollArea viewport) clips the outside ring; the container has to leave ring room.
- **Candidates** — a ring-room padding on the ScrollArea viewport when it holds focusable rows.

## 2026-10-03 — Glass PR5: data on Glass

- **What changed** — a list reads at the body size: 12px in ink 1, markers and item glyphs in ink 3 (the module sets them after the shared prose recipe, which stays at the reading size for long-form text). `marker="decimal"` merges into `as="ol"`: an `ol` numbers its items unless `marker` says otherwise. `gap` keeps `none`/`xs`/`sm` (0/4/8); `md` merges into `sm`, `lg`/`xl` are cut (the parent owns larger rhythm). Item `icon` renders whenever it is passed and takes the marker column. New `List.Row`: the interactive row — a button (or `render` element) in its own `li`, 32px on the control radius, the hover tint only where the pointer can hover, the press tint while held, the selection wash and inset ring on `selected` (which sets `aria-current` unless the caller passes `aria-current` or `aria-pressed`), a leading glyph in ink 3 (ink 1 on the chosen row), trailing `meta` at 11px in ink 3, the inset focus ring, 44px under a coarse pointer. The unused `useListContext` hook and the context are gone.
- **What works** — `List.test.tsx` covers the element default, marker override, icon on any marker, the three gaps, the compiled type and marker ink, and every List.Row behaviour (button and link render, `aria-current` rules, ref, track, radius, hover gate, press, selection ring); `List.states.tsx` checks body type and marker ink on prose lists, and track, radius, wash, ring, glyph and meta ink on rows, plus overflow and hover over the chosen row.
- **What doesn't** — rows do not rove focus with the arrow keys; each row is a tab stop. No `List.Row` disabled tooltip.
- **Candidates** — arrow-key roving for long row lists; a `List.Row` section head (the caption-size group head the rows sit under).
- **Not run here** — `test:states` (run once for the whole release).

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant` → `marker` (`ListMarker`: `none` | `disc` | `decimal` | `icon`);
  values unchanged, the old prop is a TypeScript error (UIR-D16). The context
  value is `marker` too.
- `gap` gains `xl` so the axis matches the ruled set (`none` … `xl`); it maps to
  `layout.gap("xl")`.
- The `ul`/`ol` reset reads `--fui-raw-space-0` for margin and padding; the
  icon-slot floor reads `measurements.raw-space(12)` instead of a bare px.

What still does not work

- `List.Item icon` only renders on `marker="icon"`; passing an icon on a disc
  list silently drops it.

Improvement candidates

- Warn in development when `icon` is passed without `marker="icon"`.
