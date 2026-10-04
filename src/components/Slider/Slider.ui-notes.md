# Slider — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the label reads the shared `field.label` recipe with no colour override of its own.
- **What works** — Slider unit tests pass.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the coarse-pointer `hit-size("touch")` override (48px) is gone; the compact hit area rises to 44px under a coarse pointer on its own.
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — Gaps read the raw scale (7 → 6, 14 → 12px).
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked with marks.
- **Candidates** — None.

## 2026-09-03 Wave 0

- Both disabled opacities ride `@include disabled-state;`; `prefers-contrast` blocks replaced by `@include high-contrast-outline;` on `.track` and `.thumb`.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Disabled + error** — the wrapper now keeps `data-invalid` when disabled, so the danger hairline (`box-shadow` on `.track`) renders on a disabled track; at 1.6.0 it was dropped. Probe: wrapper `data-invalid` false → true in all three engines; Chromium track `box-shadow` inset 1px `rgba(60, 45, 30, 0.1)` → `color(srgb 0.553412 0.200471 0.141176)` (light). Locked by `keeps the invalid edge on the wrapper when disabled with an error`.
- **Also upstream** — assorted value and drag fixes; no update loop from unstable refs. No local change.
- **Doesn't work yet (choice sweep)** — disabled + error shows the error words and the danger edge but no icon, where an error needs an icon plus words, never colour alone; and `aria-invalid` drops while disabled (2 → 0 in the probe), since upstream keeps only `data-invalid`.

## 2026-10-03 — role tokens

- **What changed** — the pressed thumb reads `--fui-shadow-sm` (was `--fui-shadow-md`). The `md` alias now means the popup shadow, which a thumb should not cast (UIR-D117).

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-form-group-bg`, `--fui-form-group-border`, `--fui-radius-md`, `--fui-transition-fast`. Corners now read the radius roles (`popup`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — choice controls on Glass

- **What changed** — the track is a 4px band with one hairline at the control radius; the fill is the selection colour (`--fui-control-checked-bg`, was the accent) and covers the hairline. The thumb is a 16px surface square-ish at the control radius with the strong field edge and no shadow (only the switch and segment thumbs take a shadow). The drag bubble is a floating raised surface (`overlay.surface`).
- **API** — ranges (an array value renders one thumb per value, with `getAriaLabel`); `format` and `locale` (Intl) replace `valueSuffix`; `invalid` + `errorMessage` replace `error` and the message has an icon; `readOnly` (dashed track, `aria-readonly`, changes refused); `size` sets the control strip height to the field track; `largeStep`, `onValueCommitted`, `form`, `thumbAlignment`. Cut: `onChange`, `valueSuffix`, `error`, and the silent "Slider" fallback name (a development warning now asks for a label).
- **What works** — `Slider.test.tsx` covers range, format, read-only, invalid message, unnamed warning and the cut aliases at the type level; `Slider.states.tsx` covers populated (single, formatted, range, helper), error, overflow and lifecycle.
- **What doesn't** — not browser-checked; the fill-over-hairline relies on the indicator inheriting the track's block size.
- **Candidates** — tick marks for a stepped scale; a vertical orientation.
- **Disabled group** — the slider group carries `aria-disabled` while disabled, so its label and value read as part of the inactive control; axe flagged both for colour contrast in the states lane without it.
