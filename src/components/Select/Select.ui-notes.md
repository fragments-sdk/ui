# Select fragment notes

## 2026-10-03 — Glass v4 review fixes

- 2026-10-03 (review fix): the xs size reads the shared `field.size-xs` recipe instead of a local copy; no visual change.

- Authored states: default, error, disabled, bounded scrollable options, and a rendered long localized option.
- Matrix declares size, variant, both themes, open/focus/disabled/error, and browser-verifiable long options.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- Integrated Bundle renewal `cd4c6d44` reconfirmed the validation error and full
  Central European localized option. ArrowDown focused that option; Escape
  collapsed the list and settled focus back on `Workspace region`. Desktop,
  390px, and 320px remained contained; Console remained 0/0.

## 2026-10-03 — fields on Glass

- **What changed** — the root renders no DOM: the label, helper text and error move to Field, and root `className`/`ref` go with the wrapper. `variant` (outline, ghost) is cut; `onChange` is cut in favour of `onValueChange`. New `invalid` and `readOnly`: read-only draws the dashed field edge and hides the caret. Sizes are xs–lg on the control track. The list opens beside the trigger (side placement), not over it. A selected row shows an ink check only, at the end of the row; the caret is the bold CaretDown and does not rotate. The open trigger's edge darkens.
- **What works** — unit tests cover invalid, Field integration (name, data-invalid, the alert), read-only, sizes and side placement. `Select.states.tsx` adds error, read-only and small-size fixtures beside the existing open-list check.
- **What doesn't** — not browser-checked; `Select.fragment.tsx` stays a fragment and the compiled catalog still lists the cut `variant` and old sizes until it is regenerated.
- **Candidates** — loading and empty slots for a Select whose options load from a server.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — pick-list rows come from `recipes/_popup.scss`: the highlighted row is the hover tint painted as a background image over the row, so a selected row keeps its `--fui-control-selected-bg` wash and gains the 1px inset `--fui-control-selected-border` ring (UIR-D126); a roving row's keyboard focus is that highlight (`focus.highlight-row`), the popup is the focus boundary (UIR-D125). A highlighted selected row no longer swaps its wash for `--fui-field-selection-bg-hover`: the highlight tint paints over the wash, so the row keeps both the wash and the ring. The trigger's focus is the one ring, not the 34% tint. The positioner's `outline: none` is gone (it never takes focus). This resolves the 04 browser-pass carry-in (wash with no ring, a 34% focus tint).
- **What works** — `Select.states.tsx` (new, `@family:pickers`) renders populated (keyboard focus), overflow, an open list and disabled; its `lifecycleOpen` check reads the highlighted selected row: the selection wash, the 1px inset ring and the hover tint over both, in four projects. `FocusRecipe.states.tsx` reads the trigger's ring: 2px solid, 2px outside, ≥3:1, never transitioned.
- **What doesn't** — the list is read only with the selected row highlighted on open; a selected row that is not highlighted is proven on Listbox.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); its trigger uses `field.size(…, $typed: false)`: it takes no typing, so it keeps its type role under a coarse pointer; pick-list rows are `max(pitch, --fui-hit-area)`, 44px under a coarse pointer (48px before); under forced colours the highlighted row is Highlight / HighlightText, the selected row keeps an inset CanvasText outline, and separators are CanvasText (UIR-D121); under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — The popup gap reads `--fui-raw-space-6` (was 7px).
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked.
- **Candidates** — None.

## 2026-09-03 Wave 0

- `variant="field"` is now `variant="outline"` (default); `ghost` stays (UIR-D13). `Select.fragment.tsx` gained a `Ghost` state and the summary reads `outline|ghost (default: outline)`.
- Ghost disabled opacity reads `--fui-opacity-disabled`; `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.trigger`.
- Still open: `fragments.json` still lists `field` until the orchestrator regenerates the manifest.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Trigger focus and `[data-popup-open]` now use `field.focus-state` (accent edge + ring). Before, focus was the solid button ring and open was a black `--fui-field-border-focus` edge.
- Wrapper carries `data-invalid`; the trigger takes `field.invalid-state`. Before this the error state was only the message underneath.
- Verified on :6006: error edge renders. Open-state edge verified by code (synthetic clicks do not open Base UI popups in this harness).

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- No local change; the popup surface follows `popup.container` (l1 radius, l2 rows). Not re-checked open in this lane — Menu/DatePicker cover the same recipe.

## 2026-09-04 Wave 1 — invalid+focus and aria-invalid (UIR-D54, UIR-D55)

- **What was broken** — `field.invalid-focus-state` reached Input and Textarea only, so a focused invalid trigger drew the danger edge inside the **accent** ring. `aria-invalid` was absent entirely: the trigger reported valid while painting `rgb(196, 71, 50)`.
- **What changed** — the `.wrapper[data-invalid] &` rule nests `&:focus-visible, &[data-popup-open] { @include field.invalid-focus-state; }`, and `SelectContextValue` carries `invalid` so `Select.Trigger` can set `aria-invalid`.
- **What was browser-verified** — keyboard-focused (real `Tab`, because `:focus-visible` does not match a scripted `.focus()`) at the error story in all four render states: edge `rgb(196, 71, 50)`, ring `2px` `color(srgb 0.768627 0.278431 0.196078 / 0.34)`, `aria-invalid="true"`. Identical to Input and Textarea in every profile.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Popup origin** — with `align="start"` the scale-in now grows from the aligned edge, not the trigger's centre: `--transform-origin` went from `626px -4px` to `0% -4px` (headless Chromium, WebKit and Firefox against static Storybook builds at 1.6.0 and 1.8.0). Only the enter/exit motion changes; the settled frame is pixel-identical.
- **Keyboard close** — after `Escape` the trigger shows its focus ring again in Safari and Firefox. Upstream change to the shared popup focus return; probed on Menu, not on this component.
- **readOnly opens** — a `readOnly` Select now opens on click so the options can be read; picking one still does nothing (`handleValueChange` returns early). At 1.6.0 the popup did not open at all. Locked by `opens for browsing while readOnly without changing the value`.
- **Group labels** — `Select.GroupLabel` is now `aria-hidden`; the group keeps its name. Locked by a test.
- **Also upstream, no local change** — items inherit the root's `disabled`; a programmatic value change no longer force-mounts the popup; the root `id` is honoured inside a Field.
- **Doesn't work yet (same at 1.6.0; pickers sweep)** — a `readOnly` trigger looks editable: the same fill and solid border, a pointer cursor, and rows that still take the hover wash, where the read-only recipe asks for a band fill and a dashed edge. The selected row has the wash but no ring (rule Wash-and-Ring). The focus ring that returns after `Escape` is the existing 2px accent at 34% alpha, below rule Library-Floor's 3:1.

## 2026-10-03 — popups keep their theme scope

- **What changed** — the portal spreads `useThemePortalProps()`, so a popup opened inside a nested `Theme` renders with that scope's `data-fui-theme`, mode, inputs and chrome instead of the page's. Outside a scope it adds nothing.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — still popup through `popup.motion` (UIR-D132); the positioner takes `collisionPadding` 8.
- **What works** — the list is drawn in its first frame and closes within 3 frames (`MotionRecipe.states.tsx`, all four projects). With a mouse the list overlays the trigger with the selected row on it (`alignItemWithTrigger`, `data-side="none"`), and the fixture checks that row sits over the trigger.
- **What doesn't** — in the item-aligned placement the 4px offset never applies, so Select is the one popup off the offset grid. No `Select.states.tsx` yet.
- **Candidates** — decide aligned versus side placement (carried to the picker work); a state fixture with loading and empty lists.

## 2026-10-03 — v4 surface and token pass

- **Floating surface** — `overlay.surface` is shadow only: the raised plane, `--fui-shadow-popup` and the popup radius (overlay radius for a modal or side panel), no border and no footer band. Forced colours keep a CanvasText hairline.
- **Token reads** — the legacy reads are gone: `--fui-radius-md`, `--fui-transition-fast`. Corners now read the radius roles (`control`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
