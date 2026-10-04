# Command — UI notes

## 2026-10-03 — Glass: the states harness pass

- **What changed** — the `empty` fixture waits for the filter to land (up to 60 frames) before it counts the shown options; Firefox under a two-worker run counted them before the filter applied.

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the search is a field inside the palette (field shell, hover, focus ring on `:focus-visible`), inset by the popup inset, instead of a 40px track with a hairline. The active row uses the shared popup highlight, so it draws no ring. The flat part exports are cut. Copy uses a real ellipsis and sentence case.
- **What works** — a `lifecycle` fixture checks the first row is active, the active row draws no ring, ArrowDown moves and Enter runs the row; unit tests pass.
- **What doesn't** — the fixture has not run in the browser in this lane.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — pick-list rows come from `recipes/_popup.scss`: the highlighted row is the hover tint painted as a background image over the row, so a selected row keeps its `--fui-control-selected-bg` wash and gains the 1px inset `--fui-control-selected-border` ring (UIR-D126); a roving row's keyboard focus is that highlight (`focus.highlight-row`), the popup is the focus boundary (UIR-D125). The search input delegates its ring to the search shell (`focus.delegated`).
- **What works** — `Listbox.states.tsx` and `SelectionRecipe.states.tsx` (`@tag:recipe-selection`) read the wash, the 1px ring and the hover tint over a selected row in four projects; `FocusRecipe.states.tsx` (`stackedRows`) reads a 44px row under a coarse pointer.
- **What doesn't** — Command has no state fixture of its own.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); pick-list rows are `max(pitch, --fui-hit-area)`, 44px under a coarse pointer (48px before); under forced colours the highlighted row is Highlight / HighlightText, the selected row keeps an inset CanvasText outline, and separators are CanvasText (UIR-D121); under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — IME-safe Enter (3.1.3)

- **What changed** — the search field's `Enter` case leaves a composing keydown to the IME (no select, no `preventDefault`); item activation is guarded the same way. Goes through the shared `isComposingEnter` helper (`src/utils/isComposingEnter.ts`).
- **What works** — `Command.test.tsx` simulates composition with both signals: `onItemSelect` is not called on the committing Enter, then once on the next. Headless Chromium, WebKit and Firefox (2026-10-03 pass): with an item active, the committing Enter in either order neither selects nor is default-prevented, and the next Enter selects once. In Chromium a composition through the engine's own input-method path gives the same result. Every case fails with the guard stubbed out.
- **What doesn't** — not run against a real OS input method (for example macOS Japanese); that needs a person.
- **Candidates** — the composition cases as fixtures in the browser render-state harness.

## 2026-09-06 — `hosted`

- **What changed** — new `hosted` prop: the Command sits inside another surface (a `Popover`, a `Dialog`) that draws the frame, so it drops its own background, border, radius and shadow and keeps only the popup inset. Without it a palette in a popover read as a card inside a card (Cloud's repository picker); the workshop ⌘K palette inside `Dialog` uses it too.
- **What works** — `Command.test.tsx` covers the class; verified by DOM read in Cloud (border 0, transparent background inside the popover and the dialog).

## 2026-09-03 Wave 0

- Content gap, container inset, indicator box and row insets now carry raw-space fallbacks; `padding: 0` reads `--fui-raw-space-0`.
- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.command`.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- No local change; the palette box follows `popup.container` (l1 radius, l2 rows). Not re-checked in this lane.

## 2026-10-03 — Glass v4 Overlays (PR4): frameless list, Command.Dialog palette

- **What changed** — `hosted` is cut: Command draws no frame at all (no fill, edge, radius or shadow), so it sits in a Popover or a page as is. The new `Command.Dialog` is the floating palette: a scrim, the raised panel on the popup shadow with no edge, hung about a seventh of the way down, key hints in a caption footer; running an item closes it unless the handler calls `preventDefault()`. The search row is flush with one hairline under it (no boxed field inside a frame); groups carry no lines (Separator is space); the active row is the wash and ring and pointer travel moves it (no ungated hover paint). `Item.onItemSelect` is renamed `onSelect`, the Menu verb.
- **Fixed** — matches are now sorted by score (flex `order`, keyboard order follows); the default filter grades prefix > word start > substring > keyword; the first match is active on mount and after every search change, so Return runs it; `role="search"` is gone; `aria-expanded` follows whether any result shows; Empty is no longer an option. New: `Command.List loading` (aria-busy, "Searching…" after a second) and `Command.Error` with Retry.
- **What works** — 28 unit tests including ranking, first-match Enter, IME guard, loading, error, palette close-after-run, axe.
- **What doesn't** — the engine is still the library's own (the move onto the primitive's autocomplete is deferred); sorted rows reorder visually with `order`, so the DOM order differs from the visual order for a pointer-only reading. Not browser-checked; the states lane was not run.
- **Candidates** — move onto the primitive's autocomplete.
- **Footer hints** — the default hints are `Kbd` keycaps; the glyph keys carry spoken names (Up arrow, Down arrow, Enter). The private `.key` style is gone.
- **Error row and empty note** — while a `Command.Error` shows, or no result shows and the list is not busy, `Command.List` drops `role="listbox"`: a listbox may own only options and groups, and the error row's Retry button and the empty note are neither (axe `aria-required-children` in the states lane). The role returns with the first result; a busy list keeps it. The fixture checks for the active row and the empty search wait two frames, since items register in an effect.
- **Coarse pointer** — the search input takes 16px typed text under a coarse pointer (`field.coarse-typed-text`), so a phone does not zoom in; the coarse states project caught 12px. The fixture waits for the active row instead of a fixed two frames (WebKit and Firefox need more).

## 2026-10-04 — Glass PR5 review fixes: loading and error rows

- **Fixed** — the Searching row and the error row now read as the same family as Chart and Table rows: a control-height row on the body-compact role. Searching carries the inline spinner before the words (`loadingLabel`, default "Searching…"); the error row is a polite status with a filled warning glyph in the danger text ink before the words, and Retry is a small ghost Button labelled by `retryLabel` (default "Retry").
- **What works** — unit tests cover the spinner, the status role and the glyph; the error fixture checks the glyph ink and the role.
- **What doesn't** — not browser-checked; the states lane was not run.
