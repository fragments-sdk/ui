# Textarea — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the xs size reads the shared `field.size-xs` recipe instead of a local copy; no visual change.
- **What works** — Textarea unit tests pass.

## 2026-10-03 — fields on Glass

- **What changed** — `rows` is `minRows`; the field grows with its text to `maxRows`, then scrolls (field-sizing, with the minRows height as the fallback). `resize` keeps `none | vertical`: width never resizes. The counter shows whenever `maxLength` is set (`showCharCount` is cut), follows a controlled value, and past the limit says how far over in words, in the danger ink. Label and helper text move to Field; `error` is `invalid`; `onChange(value)` is `onValueChange`; `rootProps` is cut; `Textarea.Root` stays. Sizes are xs–lg; a one-row textarea lines up with an Input of the same size.
- **What works** — unit tests cover Field wiring, row variables, the one-row mark, sizes, the counter (auto, controlled, overage) and axe. `Textarea.states.tsx` (new) renders populated, empty, error (over the limit), overflow (grows to its ceiling), disabled, read-only and the one-row sizes.
- **What doesn't** — not browser-checked; where field-sizing is unsupported the field holds minRows and scrolls rather than growing.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the text-entry element sets `font: inherit` and takes 16px typed text under a coarse pointer (UIR-D120); under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `Access.states.tsx` (`coarseTargets`) reads 16px typed text under the coarse project and the type role elsewhere. `fui/layer/components-layer` and `check:layers` pass.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — none beyond the screenshot matrix.

## 2026-09-03 Wave 0

- Every private `--_fui-*` property reads a fallback (`field.track("md")`, `field.stroke()`, raw-space accessors).
- Row bounds authored from `minRows`/`maxRows` are now `--fui-textarea-min-rows` / `--fui-textarea-max-rows`, declared in `tokens/_component-properties.scss` (was an undeclared `--_fui-textarea-*` pair).
- `prefers-contrast` block replaced by `@include high-contrast-outline;`.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Same as Input: `field.invalid-focus-state` on error + focus; `success` prop deleted (UIR-D39).
- Verified on :6006: rest, error, focus.
