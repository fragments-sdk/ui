# Combobox — UI notes

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
