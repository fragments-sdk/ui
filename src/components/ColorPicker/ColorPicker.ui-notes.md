# ColorPicker — UI notes

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
