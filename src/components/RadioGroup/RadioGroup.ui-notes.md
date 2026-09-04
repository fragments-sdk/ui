# RadioGroup — UI notes

## 2026-09-03 Wave 0

- `variant="card"` is now `variant="outline"` (`.itemWrapperOutline`); `RadioVariantContext` carries `"outline" | undefined`, no `default` value.
- Disabled rides `@include disabled-state;`; `prefers-contrast` block replaced by `@include high-contrast-outline;`.
- Still open: same highlight-token wish as Checkbox for the checked sheen.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Same as Checkbox: base tokens for the mark, danger edge on invalid, `field.focus-state` on keyboard focus.

## 2026-09-04 Wave 1 — invalid edge reads the recipe (UIR-D52)

- Two hand-written `border-color: var(--fui-color-danger)` declarations replaced by `@include field.invalid-state`. Byte-identical output; it was a private second copy of the grammar this wave centralises.
- Browser-verified in all four render states: invalid edge `rgb(196, 71, 50)`, focus edge `--fui-color-accent` with a 2px ring.

## 2026-09-04 Wave 1 — invalid+focus and aria-invalid (UIR-D54, UIR-D55)

- **What was broken** — a focused invalid radio drew the danger edge inside the accent ring, at both invalid sites. The group carried `data-invalid` but no `aria-invalid`.
- **What changed** — both invalid rules (`.radio &[data-invalid]` and `.group[data-invalid] .radio`) nest `&:focus-visible { @include field.invalid-focus-state; }`, and the group element sets `aria-invalid` beside `data-invalid`.
- **What was browser-verified** — keyboard-focused (real `Tab`, because `:focus-visible` does not match a scripted `.focus()`) at the error story in all four render states: edge `rgb(196, 71, 50)`, ring `2px` `color(srgb 0.768627 0.278431 0.196078 / 0.34)`, `aria-invalid="true"`. Identical to Input and Textarea in every profile.
