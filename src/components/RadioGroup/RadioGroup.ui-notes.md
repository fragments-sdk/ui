# RadioGroup — UI notes

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120); under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

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

## 2026-09-07 — trailing value on an item

- `RadioGroup.Item trailing` (ReactNode) adds a third grid column (`auto`) at the end of the row; the label and helper keep theirs. It sits on the label's line, right-aligned, no wrap. Built for the plan picker (price per row) — `PlanPicker` story.
- The trailing span is in the radio's `aria-labelledby` after the label, so it joins the accessible name ("3 repositories $219 a month"); keep it a value, not a sentence.
- `boolean.card` (shared with Checkbox outline) now pads every side by the field inline inset instead of inline only; two-line cards were cramped top and bottom (Conan, plan dialog).

## 2026-10-03 — `@base-ui/react` 1.8.0

- **ARIA moved to the group** — `aria-required` and `aria-readonly` now sit on the `radiogroup` only; each `radio` no longer repeats them (`aria-disabled` stays on both). Probe: radios `aria-required` `"true"` → absent in all three engines. Locked by two tests.
- **One click per press** — the hidden input's click no longer bubbles, so an ancestor `onClick` sees one click per press instead of two. Locked by a test.
- **Also upstream** — submitted form values match native radio submission.
- **Doesn't work yet (choice sweep)** — disabled + error shows the error words and a danger edge but no icon, where an error needs an icon plus words, never colour alone.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-border-default`, `--fui-radius-md`, `--fui-transition-fast`. Corners now read the radius roles (`surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — motion, type and state recipes

- **What changed** — outline items are the choice card (`choice-card.root` + `choice-card.size`, UIR-D142), the same recipe as the outline Checkbox: chosen takes the wash and the 1px ring as its border.
- **What works** — shares every rule with Checkbox through the recipe; new `RadioGroup.states.tsx` (populated, error, overflow, lifecycle).
- **What doesn't** — `RadioGroup.Item` does not forward HTML props, so a fixture cannot mark one item for hover; fixtures not run in this lane.
- **Candidates** — forward `data-*` on `RadioGroup.Item`.

## 2026-10-03 — choice controls on Glass

- **What changed** — the circle sits on the band (`--fui-field-bg`) with the strong field edge (`--fui-field-border`, 3:1; it was `--fui-border-strong`), round by meaning (`radius.pill`). Checked is the selection fill with a 6px on-selection dot that fades and scales in `--fui-duration-micro`; the 8% tint, 55% ring and checked hover are gone. Hover is the field hover under `(hover: hover)` on unchecked circles only (picking a checked option again does nothing), and the label row hovers its circle. The group gap reads the 12 space token with a generated fallback.
- **API (v4 cuts)** — `onChange`, `size`, item `description`, `wrapperClassName`, `groupClassName`, `groupId`, item `controlClassName` / `contentClassName` are gone; `error` became `invalid` + `errorMessage`. The `id` and `ref` now land on the `role="radiogroup"` element; `className`, `style` and other attributes stay on the wrapper. Items forward HTML attributes to their row.
- **States** — group `disabled` dims the whole group once at the wrapper and reaches every item row (no hover, not-allowed cursor); group `readOnly` reaches the rows too (no hover tint, default cursor, unchecked circles dashed on the band). Invalid: every circle takes the danger edge and the message renders with a bold warning-circle icon and words, wired to the radiogroup's `aria-describedby`.
- **Outline card** — the shared choice card at the surface radius (overridden in the module; the recipe still reads the control radius). The card draws the one focus ring in every state, including invalid.
- **What works** — unit tests cover the id/ref placement, the invalid message, group state propagation and the cut aliases at the type level. Fixtures: two `error` groups, and `lifecycle` with hover, horizontal, read-only and disabled groups.
- **What doesn't** — not browser-checked in this lane. The message is not a live region.
- **Candidates** — a disabled-reason pattern for a single disabled item (helper text carries it today).
