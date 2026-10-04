# DatePicker — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the flat part exports (`DatePickerRoot`, `DatePickerTrigger`, `DatePickerContent`, `DatePickerCalendar`, `DatePickerPreset`) are cut from the root and `./datepicker` entries; `DatePicker.Root`, `.Trigger`, `.Content`, `.Calendar` and `.Preset` are the one form (MIGRATION-v4). The label already reads the field label role (12/600) at this head, so the browser finding on its size needed no change.
- **What works** — `src/compound-exports.test.ts` fails if a cut name ships again.
- **What doesn't** — the browser lanes were not re-run this pass.
- **Candidates** — none new.

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — one API: `value` / `defaultValue` / `onValueChange` typed by `mode` (`onSelect`, `onChange`, `onRangeSelect`, `selected`, `selectedRange` cut); `invalid` + `errorMessage` replace `error` and the message carries a warning icon; `readOnly` holds the calendar shut behind a dashed edge; `size` is sm or md; `fixedWeeks` cut (always on); `formatDate` / `formatRange` merged into one `format`, otherwise Intl by `locale`, ranges joined with an en dash. A single pick closes in the same event (the 150ms timer is gone). The label names the trigger through `aria-labelledby` (label + current value); helper and error describe it. The calendar shows a six-week skeleton while react-day-picker resolves instead of nothing. Presets render the library Button (ghost, sm). `DatePicker.Root` added.
- **Glass markings** — trigger is the Input shell: open darkens the edge, only focus rings it, `text-align: start`. Popup is raised on the popup corner and shadow, instant. Days are 32 on the control corner, 12 body-compact tabular, hover gated to hover-capable pointers, no transition, ring on `:focus-visible` only. Picked days (single, range start and end) take the checked fill and colour; the range middle is the selection tint band; today is the strong field line inset only; outside days are ink 3 only (the second opacity dim is gone); disabled days are ink 3 and struck through. Caption is 12 strong; nav buttons are 24 on the control corner with logical insets.
- **What works** — 28 component tests (en-dash ranges, label naming, read-only, immediate close, type cuts) and `component-state-surfaces` (checked fill and tint band asserted in place of the old selected-state count).
- **What doesn't** — not browser-checked; the docs preview helpers still pass `onChange` (outside this library).
- **Candidates** — a ToggleGroup of presets beside a two-month range; a states row for the skeleton once the harness can hold a dependency pending.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the positioner's `outline: none` is gone (it never takes focus); the popup keeps the popup recipe's focus boundary (UIR-D125).
- **What works** — the library suite and the state lanes pass.
- **What doesn't** — day cells keep their own selected fill; they do not take the selection marking yet.
- **Candidates** — move the selected day onto `selection.selected` or `selection.thumb`.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); its trigger uses `field.size(…, $typed: false)`: it takes no typing, so it keeps its type role under a coarse pointer; pick-list rows are `max(pitch, --fui-hit-area)`, 44px under a coarse pointer (48px before); under forced colours the highlighted row is Highlight / HighlightText, the selected row keeps an inset CanvasText outline, and separators are CanvasText (UIR-D121); under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — Day and heading text read the ui-standard role (14px); headings take the semibold weight; gaps on the raw scale (14 → 12, 28 → 24px).
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked in the month grid at 320px.
- **Candidates** — A geometry case for the day cell.

## 2026-09-03 Wave 0

- `--_day-size` reads `action.track("md")` as fallback; `padding: 0` sites read `--fui-raw-space-0`.
- `.disabled` rides `@include disabled-state;` (+ pointer-events). `.outside` borrows `--fui-opacity-disabled`; a muted-opacity token would be the right home.
- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.trigger`.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Trigger focus and open use `field.focus-state`; invalid edge is `field.invalid-state` (`--fui-color-danger`, was `danger-text`). `.today` inset ring reads `--fui-border-strong` directly.
- Verified on :6006: error edge renders.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- The popup is now `popup.container` (was a private `surface-elevated` + `--fui-form-group-border` + raw `12px` fallback); it keeps `surface.inset("compact")` for the calendar padding. Checked open in Storybook.

## 2026-09-04 Wave 1 — invalid+focus and aria-invalid (UIR-D54, UIR-D55)

- **What was broken** — a focused invalid trigger drew the danger edge inside the accent ring, and carried no `aria-invalid` — it reported valid while painting `rgb(196, 71, 50)`.
- **What changed** — the `.wrapper[data-invalid] &` rule nests `&:focus-visible, &[data-popup-open] { @include field.invalid-focus-state; }`, and `DatePickerContextValue` carries `invalid` so `DatePicker.Trigger` can set `aria-invalid`.
- **What was browser-verified** — keyboard-focused (real `Tab`, because `:focus-visible` does not match a scripted `.focus()`) at the error story in all four render states: edge `rgb(196, 71, 50)`, ring `2px` `color(srgb 0.768627 0.278431 0.196078 / 0.34)`, `aria-invalid="true"`. Identical to Input and Textarea in every profile.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Popup origin** — with `align="start"` the scale-in now grows from the aligned edge, not the trigger's centre: `--transform-origin` went from `the trigger's centre` to `0% -4px` (the shared popover positioner; Menu and Select probed). Only the enter/exit motion changes; the settled frame is pixel-identical.
- **Outside presses** — a press that began before the calendar opened no longer closes it.
- **Outside clicks under Firefox touch emulation** — the same probe artefact as Popover (see its notes): an outside mouse click no longer closes the calendar there because the click carries no `pointerdown`; a tap still closes it.

## 2026-10-03 — popups keep their theme scope

- **What changed** — the portal spreads `useThemePortalProps()`, so a popup opened inside a nested `Theme` renders with that scope's `data-fui-theme`, mode, inputs and chrome instead of the page's. Outside a scope it adds nothing.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — still popup through `popup.motion` (UIR-D132); the positioner takes `collisionPadding` 8. New `DatePicker.states.tsx` (`@family:pickers`): populated, lifecycleOpen, error and overflow (a range in a 200px box).
- **What works** — `MotionRecipe.states.tsx` (`@tag:recipe-motion`) checks the popup is fully drawn in the first settled frame (opacity 1, no scale, no transform, nothing animating), sits 4px from its anchor, and is gone within 3 frames of closing, in Chromium, WebKit, Firefox and the touch project. The lint rule `fui/motion/popup-roles` holds the module to the popup motion roles.
- **What doesn't** — `empty` and `loading` are argued n/a: the picker has no async source.
- **Candidates** — none from this pass.

## 2026-10-03 — v4 surface and token pass

- **What changed** — Day and preset hovers paint the hover tint over the selection (`selection.hover-tint`).
- **Token reads** — the legacy reads are gone: `--fui-field-selection-bg-hover`, `--fui-radius-md`, `--fui-radius-sm`, `--fui-transition-fast`. Corners now read the radius roles (`control`, `row`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
