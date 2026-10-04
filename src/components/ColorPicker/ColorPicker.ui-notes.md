# ColorPicker — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the hex value is mono at every size: the class lands on the `<input>` itself, where Input's size rules set the sans role, so the old descendant rule never matched. The pointer's small resting shadow is allowlisted as a thumb in the style lane (its selector is the vendor's, so the lane could not see it was a thumb). The label already reads the field label role (12/600), so the browser finding on its size needed no change at this head.
- **What works** — `ColorPicker.test.tsx` checks the compiled mono rule; the style lane holds no baseline entry for ColorPicker.
- **What doesn't** — the browser lanes were not re-run this pass.
- **Candidates** — none new.

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — `onChange` merged into `onValueChange`; `description`, `showInput` and size `lg` are cut; `error` became `invalid` + `errorMessage` (icon + words, linked by aria-describedby); `readOnly` added. The hex field always shows, in the mono face with tabular figures and no case transform — the value is normalised in code (`#F50`, `f50` → `#ff5500`). A bad hex stays in the field and is flagged inline instead of being reverted on blur. The swatch is a square control (28/32) on the control corner with the field line; open darkens the edge, focus draws the ring. The popup is the floating surface (no edge), instant, on the anchored overlay layer; the canvas corner nests inside the popup corner, the pointer is a thumb (a ring in the popup plane + the small shadow; a literal white is banned by the style lint). A skeleton holds the canvas size while react-colorful loads. The root is a labelled group, not a Base UI Field. Imports moved to the top.
- **What works** — 13 unit tests (normalisation, inline bad-hex flag, canvas pick, Escape focus return, helper/error linking, disabled, read-only (popup held shut, `aria-disabled` swatch), type cuts, axe).
- **What doesn't** — the hex field still renders through the library Input's own field wrapper; the 80/120px literals are replaced by `8ch` + the field inset. Not browser-checked.
- **Candidates** — preset swatches beside the field (contract guideline already asks for them).

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the label is `Field.Label` and the error is `Field.Error` (shown whenever `error` is set, announced and in `aria-describedby`); helper text is `Field.Description`. The module's own label, helper and error classes are deleted, so the field recipe owns them.
- **What works** — ColorPicker unit tests pass.
- **What doesn't** — not browser-checked in this lane.

## 2026-10-03 — fields on Glass

- **What changed** — the hex field takes `onValueChange` and `invalid` from the new Input API; its classes merge on the field. The Input now joins the picker's own field, so the visible label names the hex input (it was named “Color hex value” by an aria-label the label association now outranks); with no label it is still “Hex value”.
- **What works** — the ColorPicker unit tests pass.
- **What doesn't** — not browser-checked.
- **Candidates** — none.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the positioner's `outline: none` is gone (it never takes focus) (UIR-D125).
- **What works** — the library suite and the state lanes pass.
- **What doesn't** — none known.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); its trigger uses `field.size(…, $typed: false)`: it takes no typing, so it keeps its type role under a coarse pointer; under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — The gap reads `--fui-raw-space-12` (was 14px).
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked.
- **Candidates** — None.

## 2026-09-03 Wave 0

- `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.swatch`. No vocabulary change.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Swatch: focus and open use `field.focus-state`; `.wrapper[data-invalid]` gives it `field.invalid-state`, so the swatch and the hex field fail together.
- Verified on :6006: error state shows both edges.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- The `border-radius: lg` override on `.popup` is gone — `popup.container` now renders `--fui-radius-l1` itself.

## 2026-09-04 Wave 1 — invalid+focus and aria-invalid (UIR-D54, UIR-D55)

- **What was broken** — the swatch trigger drew the danger edge inside the accent ring when focused. `Field.Root invalid` gives the wrapper `data-invalid` and gives the hex `Input` its `aria-invalid`, but the swatch is not a Field control, so it had neither.
- **What changed** — the `.wrapper[data-invalid] &` rule nests the focus pair with `field.invalid-focus-state`, and the swatch trigger sets `aria-invalid={error || undefined}` directly.
- **What was browser-verified** — keyboard-focused (real `Tab`, because `:focus-visible` does not match a scripted `.focus()`) at the error story in all four render states: edge `rgb(196, 71, 50)`, ring `2px` `color(srgb 0.768627 0.278431 0.196078 / 0.34)`, `aria-invalid="true"`. Identical to Input and Textarea in every profile.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Disabled + error** — `Field.Root` now keeps `data-invalid` when the field is also disabled, so a disabled ColorPicker with `error` shows the danger edge (it showed none at 1.6.0). Probe: wrapper `data-invalid` false → true in all three engines; Chromium swatch border `rgba(60, 45, 30, 0.1)` → `rgb(196, 71, 50)` at opacity 0.5 (light). Locked by `keeps the invalid edge on the wrapper when disabled with an error`.
- **Popup origin** — no visible change: the colour popup has no scale transition, so the new `--transform-origin` for `align="start"` is unused here.
- **Doesn't work yet (pickers sweep)** — disabled + error shows the error words and the danger edge but no icon, and `aria-invalid` drops while disabled (2 → 1 in the probe). The trigger's returning focus ring is the 2px accent at 34% alpha, below rule Library-Floor.

## 2026-10-03 — popups keep their theme scope

- **What changed** — the portal spreads `useThemePortalProps()`, so a popup opened inside a nested `Theme` renders with that scope's `data-fui-theme`, mode, inputs and chrome instead of the page's. Outside a scope it adds nothing.

## 2026-10-03 — role tokens

- **What changed** — the popup reads `--fui-shadow-popup` (was `--fui-shadow-md`, UIR-D117).

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — still popup (UIR-D132); `collisionPadding` 8. New `ColorPicker.states.tsx` (`@family:pickers`): populated, error and lifecycleOpen (opened from the swatch, still, 4px from it, `Escape` closes).
- **What works** — `MotionRecipe.states.tsx` (`@tag:recipe-motion`) checks the popup is fully drawn in the first settled frame (opacity 1, no scale, no transform, nothing animating), sits 4px from its anchor, and is gone within 3 frames of closing, in Chromium, WebKit, Firefox and the touch project. The lint rule `fui/motion/popup-roles` holds the module to the popup motion roles. The fixture waits out `data-starting-style` before reading, since Firefox reports it for one frame.
- **What doesn't** — `empty`, `loading` and `overflow` are argued n/a.
- **Candidates** — none from this pass.

## 2026-10-03 — v4 surface and token pass

- **Floating surface** — `overlay.surface` is shadow only: the raised plane, `--fui-shadow-popup` and the popup radius (overlay radius for a modal or side panel), no border and no footer band. Forced colours keep a CanvasText hairline.
- **Token reads** — the legacy reads are gone: `--fui-radius-md`, `--fui-radius-sm`. Corners now read the radius roles (`control`, `indicator`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
