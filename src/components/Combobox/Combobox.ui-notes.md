# Combobox — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the flat part exports (`ComboboxRoot` … `ComboboxGroupLabel`) are cut. The xs size reads the shared `field.size-xs` recipe instead of a local copy. Placeholders use a real ellipsis (…).
- **What works** — Combobox unit tests pass.
- **What doesn't** — not browser-checked in this lane.

## 2026-10-03 — fields on Glass

- **What changed** — the root renders no DOM: label, helper text and error move to Field; root `className`/`ref` are cut; `onChange` is cut in favour of `onValueChange`. New `invalid`, `readOnly`, `loading` and `onInputValueChange`. Options sit inside a real listbox; the open button is named Show options and every chip's remove button names its chip. With no match the list names the query (No match for “zz”), or says No options; while `loading` it says Searching… and the popup is aria-busy. Both rows are polite status messages that stay mounted. Chips take the chip look: 24 high, control radius, band and line, ink 1, with a ring when highlighted. Sizes are xs–lg. The highlighted row follows the keyboard and the pointer alike.
- **What works** — unit tests cover invalid, the trigger and chip names, the listbox, the no-match words, loading, the typed query callback and the 24 step. `Combobox.states.tsx` (new, `@family:pickers`) renders populated chips, empty, loading, error, overflow chips, open, disabled and read-only.
- **What doesn't** — not browser-checked; the chip look is local until the Chip batch settles it.
- **Candidates** — a debounced async example in the stories.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — pick-list rows come from `recipes/_popup.scss`: the highlighted row is the hover tint painted as a background image over the row, so a selected row keeps its `--fui-control-selected-bg` wash and gains the 1px inset `--fui-control-selected-border` ring (UIR-D126); a roving row's keyboard focus is that highlight (`focus.highlight-row`), the popup is the focus boundary (UIR-D125). A highlighted selected row no longer swaps its wash for `--fui-field-selection-bg-hover`; the highlight paints over the wash and the ring stays. The input delegates its ring to the field shell (`focus.delegated`), which rings through `:focus-within`.
- **What works** — `Listbox.states.tsx` and `SelectionRecipe.states.tsx` (`@tag:recipe-selection`) read the wash, the 1px ring and the hover tint over a selected row in four projects; `FocusRecipe.states.tsx` (`stackedRows`) reads a 44px row under a coarse pointer.
- **What doesn't** — Combobox has no state fixture of its own.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the text-entry element sets `font: inherit` and takes 16px typed text under a coarse pointer (UIR-D120); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120); pick-list rows are `max(pitch, --fui-hit-area)`, 44px under a coarse pointer (48px before); under forced colours the highlighted row is Highlight / HighlightText, the selected row keeps an inset CanvasText outline, and separators are CanvasText (UIR-D121); under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 Wave 0

- `padding: 0` now reads `--fui-raw-space-0`; `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.inputWrapper`.
- No vocabulary change (no variant axis).

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Disabled is `field.disabled-state` (opacity) like every other field; the `--fui-field-bg-disabled` tint is gone.
- Verified on :6006: focus-within ring, open list.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- No local change; the popup surface follows `popup.container` (l1 radius, l2 rows). Not re-checked open in this lane.

## 2026-09-04 Wave 1 — invalid state (UIR-D51)

- **What was broken** — `error` rendered the message text and nothing else. The shell had no invalid rule and the input had no `aria-invalid`, so the control was neither visually nor programmatically invalid. Measured at `forms-combobox--error-state`: edge `rgba(60, 45, 30, 0.1)`, the ordinary rest border, where every other field control measured `rgb(196, 71, 50)`.
- **What changed** — `data-invalid={hasError || undefined}` on the field wrapper (the hook Select, DatePicker and RadioGroup already use) and `.inputWrapper` takes `field.invalid-state` under `.wrapper[data-invalid]`.
- **What was browser-verified** — re-measured in all four render states: edge `rgb(196, 71, 50)` in each. Rest `rgba(60, 45, 30, 0.1)`, focus edge `--fui-color-accent` with a 2px 34% ring.
- **Candidates** — ~~invalid+focus still shows the accent ring over the danger edge~~ delivered below (UIR-D54), not deferred.

## 2026-09-04 Wave 1 — invalid+focus and aria-invalid (UIR-D54, UIR-D55)

- **What was broken** — the invalid+focus gap this file already listed as a Wave 2 candidate — the accent ring sat over the danger edge — plus the missing `aria-invalid` that UIR-D51 diagnosed and did not fix.
- **What changed** — the `.wrapper[data-invalid] &` rule nests `&:focus-within { @include field.invalid-focus-state; }` (focus-within, because the focused element is the inner input), and `ComboboxContextValue` carries `invalid` so both `Combobox.Input` branches set `aria-invalid`.
- **What was browser-verified** — keyboard-focused (real `Tab`, because `:focus-visible` does not match a scripted `.focus()`) at the error story in all four render states: edge `rgb(196, 71, 50)`, ring `2px` `color(srgb 0.768627 0.278431 0.196078 / 0.34)`, `aria-invalid="true"`. Identical to Input and Textarea in every profile.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Popup origin** — with `align="start"` the scale-in now grows from the aligned edge, not the trigger's centre: `--transform-origin` went from `the trigger's centre` to `0% -4px` (same shift as Select and Menu; not separately probed). Only the enter/exit motion changes; the settled frame is pixel-identical.
- **readOnly opens** — a `readOnly` Combobox now opens (click, `ArrowDown`) so the options can be read; picking one leaves the value empty. The input carries native `readonly` and `aria-readonly="true"`. Locked by `opens for browsing while readOnly without changing the value` (jsdom; the story's `readOnly` arg is not wired, so this was not browser-checked).
- **Group labels** — `Combobox.GroupLabel` is now `aria-hidden`; the group keeps its name. Locked by a test.
- **Also upstream, no local change** — items inherit the root's `disabled`; `data-readonly` reaches the trigger; multiple selection anchors to the first selected item.
- **Doesn't work yet (pickers sweep)** — disabled + error keeps `data-invalid`, but the input edge stays neutral (`rgb(88, 83, 76)`), not danger.

## 2026-10-03 — popups keep their theme scope

- **What changed** — the portal spreads `useThemePortalProps()`, so a popup opened inside a nested `Theme` renders with that scope's `data-fui-theme`, mode, inputs and chrome instead of the page's. Outside a scope it adds nothing.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — still popup through `popup.motion` (UIR-D132); the positioner takes `collisionPadding` 8.
- **What works** — popup motion is checked by the lint rule; the module reads only the popup motion roles.
- **What doesn't** — a `Combobox.states.tsx` was written and dropped: axe found critical violations in the populated and open states (an unnamed clear button; the input without a label or the attributes its role requires; options outside a listbox parent). The fixture would only have baselined real defects.
- **Candidates** — fix the three axe findings, then add the fixture with loading, empty and no-match states (carried to the picker work).

## 2026-10-03 — v4 surface and token pass

- **Floating surface** — `overlay.surface` is shadow only: the raised plane, `--fui-shadow-popup` and the popup radius (overlay radius for a modal or side panel), no border and no footer band. Forced colours keep a CanvasText hairline.
- **Token reads** — the legacy reads are gone: `--fui-form-group-border`, `--fui-radius-sm`, `--fui-transition-fast`. Corners now read the radius roles (`control`, `indicator`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
