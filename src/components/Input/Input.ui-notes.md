# Input — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — `Input.Root` is cut (`Input` has no parts). On a search Input, Escape clears a filled field and stops there; on an empty field it blurs and lets the key through, so a surrounding Dialog or Popover closes on the first Escape. The xs size reads the shared `field.size-xs` recipe.
- **What works** — unit tests cover both Escape paths.
- **What doesn't** — the Escape path inside a real Dialog is not browser-checked in this lane.

## 2026-10-03 — fields on Glass

- **What changed** — the label, helper text, required chrome and the wrapper toggle are cut: compose in a Field. `error` is now `invalid`; `onChange(value)` is now `onValueChange(value)` and `onChange` is the native event. `rootProps`, `inputStyle`, `inputClassName` (now `className`) and `shortcutBehavior` (the app owns the shortcut) are cut; `Input.Root` stays. Sizes are xs–lg on the control track (24, 28, 32, 40); the 24 step is set locally until the field recipe carries it. `type="search"` gains a leading glyph, a clear button (24px, 24/44 hit area, keeps focus), Escape that clears first and then leaves (and never reaches the page while it clears), a polite `count` slot, and hides the shortcut hint while there is a query. One element tree whether adorned or not, so adding an adornment never remounts the input.
- **What works** — unit tests cover every search behaviour, sizes and the provider default, the adorned shell, no remount, value and native events, and axe in a Field and as a search field. `Input.states.tsx` (new) renders populated, empty, error, overflow, disabled, read-only, sizes and two search states.
- **What doesn't** — not browser-checked; the count slot's width is not reserved, so the clear button shifts as the count changes length.
- **Candidates** — reserve the count's width with tabular figures and a min-inline-size per expected digits.
- **Shortcut** — the hint is the `Kbd` primitive now (press tint, indicator corner, caption step, ink 2); the field only places it at the row end. It was a private keycap at 20px in mono and ink 3.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — focus is the one ring on the shell (UIR-D125): the edge no longer turns accent, and an invalid edge is `--fui-color-danger-text` with the standard ring. Hover darkens the edge toward ink 1 under `(hover: hover)`, never when disabled, read-only or invalid; `readonly` shows a dashed edge on the band fill (UIR-D128). The adornment input delegates its ring to the shell through `focus.delegated`.
- **What works** — `FocusRecipe.states.tsx` reads the ring on an Input at the ring width and offset, ≥3:1, never transitioned; `Fieldset.states.tsx` shows the error state.
- **What doesn't** — the read-only dashed edge is not read by a computed-style check.
- **Candidates** — carry the hover and read-only states to Textarea, Select and Combobox.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the text-entry element sets `font: inherit` and takes 16px typed text under a coarse pointer (UIR-D120); under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `Access.states.tsx` (`coarseTargets`) reads 16px typed text and the 32px track under the coarse project, the type role and the same track elsewhere; `ForcedColors.states.tsx` reads its Highlight focus outline and its system-colour edge in four projects. `fui/layer/components-layer` and `check:layers` pass.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — none beyond the screenshot matrix.

## 2026-09-03 Wave 0

- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.input`.
- Stories: `RENDER_STATES` render states, new `Sizes` (sm/md/lg) and `Invalid` stories alongside `Disabled`.
- Vocabulary already conformed (size sm/md/lg); no variant axis.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Invalid + focus is now `field.invalid-focus-state` (danger edge, 34% danger ring), the same ring shape as focus. The three-layer `focus-ring-error` box-shadow is gone.
- `success` prop deleted (UIR-D39): no consumer, decorative chroma.
- Verified on :6006: rest, error, disabled, keyboard focus, error + focus.

## 2026-10-03 — field boundary from the derive engine

- **What changed** — the field recipe's edge reads `--fui-field-border` (it read `--fui-border`). The token is a lightness step of the neutral that holds 3:1 on every plane in both modes (UIR-D91), so the edge is a real boundary instead of a hairline.
- **What works** — the contrast lane measures the rendered Input edge on every plane for 204 seeds in three engines, with 0 failures. Before: about 1.19:1 light and 1.37:1 dark at the Glass default.
- **What doesn't** — not screenshot-reviewed in this change; the heavier edge on dense forms needs a visual pass.
- **Candidates** — focus moves the edge to `--fui-color-accent`, and there is no hover edge. A hover step from `--fui-field-border` toward ink 1, as the Switch has, would match.

## 2026-10-03 — v4 surface and token pass

- **What changed** — The key cap sits in the press tint (the well role) with no border and no shadow.
- **Token reads** — the legacy reads are gone: `--fui-kbd-bg`, `--fui-kbd-border`, `--fui-kbd-radius`, `--fui-kbd-shadow`, `--fui-radius-sm`. Corners now read the radius roles (`indicator`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
