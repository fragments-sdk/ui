# DatePicker — UI notes

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
