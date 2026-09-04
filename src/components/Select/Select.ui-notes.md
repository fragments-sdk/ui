# Select fragment notes

- Authored states: default, error, disabled, bounded scrollable options, and a rendered long localized option.
- Matrix declares size, variant, both themes, open/focus/disabled/error, and browser-verifiable long options.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- Integrated Bundle renewal `cd4c6d44` reconfirmed the validation error and full
  Central European localized option. ArrowDown focused that option; Escape
  collapsed the list and settled focus back on `Workspace region`. Desktop,
  390px, and 320px remained contained; Console remained 0/0.

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
