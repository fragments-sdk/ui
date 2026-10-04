# Listbox — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the flat part exports (ListboxRoot, ListboxItem, ListboxGroup and ListboxEmpty) are cut, so the compound is the one form (`Listbox.Item`), and `Listbox.Root` is the compound itself (MIGRATION-v4).
- **What works** — `src/compound-exports.test.ts` fails if a cut name ships again or `.Root` drifts from the compound.
- **What doesn't** — nothing new.
- **Candidates** — none new.

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — selection moved to the root: `value` / `defaultValue` / `onValueChange`, single or `multiple` (aria-multiselectable), plus a root `disabled`. Items take a required `value`; `selected` is gone. A selected row is the selection wash + ring, ink1, with a check. One row is highlighted at a time through `data-highlighted` (keyboard-active or pointed); the ungated `:hover` paint, the stacked `.itemActive` and the dead `.item:focus-visible` are deleted. The plane is the inline surface (surface + hairline) and the ring is drawn on it while the listbox has keyboard focus. `Listbox.Empty` is a `role="status"` line rendered beside the listbox element, never a fake option.
- **What works** — 12 unit tests (single, multiple, controlled, keyboard highlight + Enter, disabled option and list, groups, empty as status with axe, type cut).
- **What doesn't** — still a hand-rolled activedescendant list (no inline list primitive in the headless layer); `Listbox.Empty` must be a direct child to land outside the listbox; no typeahead. Not browser-checked.
- **Candidates** — fold into an inline mode of Combobox or Command if one lands; typeahead.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — pick-list rows come from `recipes/_popup.scss`: the highlighted row is the hover tint painted as a background image over the row, so a selected row keeps its `--fui-control-selected-bg` wash and gains the 1px inset `--fui-control-selected-border` ring (UIR-D126); a roving row's keyboard focus is that highlight (`focus.highlight-row`), the popup is the focus boundary (UIR-D125).
- **What works** — `Listbox.states.tsx` and `SelectionRecipe.states.tsx` (`@tag:recipe-selection`) read the wash, the 1px ring and the hover tint over a selected row in four projects; `FocusRecipe.states.tsx` (`stackedRows`) reads a 44px row under a coarse pointer. `Listbox.states.tsx` (new, `@family:pickers`) renders populated, empty, overflow and a hovered selected row.
- **What doesn't** — none known.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); pick-list rows are `max(pitch, --fui-hit-area)`, 44px under a coarse pointer (48px before); under forced colours the highlighted row is Highlight / HighlightText, the selected row keeps an inset CanvasText outline, and separators are CanvasText (UIR-D121).
- **What works** — `Access.states.tsx` (`coarseTargets`) reads a 44px row under the coarse project and 32px elsewhere; `ForcedColors.states.tsx` (`selectedRow`) reads the selected row's CanvasText outline and no outline on the rest, in four projects. `fui/layer/components-layer` and `check:layers` pass.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — none beyond the screenshot matrix.

## 2026-10-03 — IME-safe Enter (3.1.3)

- **What changed** — the root `Enter` case and option activation skip a composing keydown, through the shared `isComposingEnter` helper (`src/utils/isComposingEnter.ts`). No visual or API change.
- **What works** — `src/utils/isComposingEnter.test.ts` scans `src/**` and fails if an Enter check here skips the helper; the component's own tests stay green. Headless Chromium, WebKit and Firefox (2026-10-03 pass): plain Enter and Space on the root and on a focused option select exactly once, the same as with the guard stubbed out.
- **What doesn't** — no composition test of its own: the listbox and its options are not text fields, so composition reaches them only by bubbling.
- **Candidates** — none beyond a composition fixture in the browser render-state harness.

## 2026-09-03 Wave 0

- `--fui-listbox-min-inline` (single reader) inlined as `layout.measure("menu-min")`; popup insets carry raw-space fallbacks.
- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.listbox`; the old per-item outlines were dropped in favour of the single mixin.
- Still open: confirm in a browser that high-contrast users still see the highlighted item without the per-item outline.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- Uses the new `popup.inline-container` (the popup box without a shadow) because the listbox sits in the page flow; the `--fui-form-group-border` edge override is gone. Rows now round to l2 on highlight (checked WithGroups in Storybook).

## 2026-10-03 — v4 surface and token pass

- **Floating surface** — `overlay.surface` is shadow only: the raised plane, `--fui-shadow-popup` and the popup radius (overlay radius for a modal or side panel), no border and no footer band. Forced colours keep a CanvasText hairline.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
