# Checkbox — UI notes

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120); under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `Access.states.tsx` (`coarseTargets`) reads the `::after` hit area at 44px under the coarse project and 24px elsewhere; `ForcedColors.states.tsx` (`boundaries`) reads a CanvasText box edge in four projects. `fui/layer/components-layer` and `check:layers` pass.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — none beyond the screenshot matrix.

## What works

- Check/indeterminate marks draw themselves in (2026-08-21): stroke-dashoffset
  over `pathLength`-normalized glyphs (budget 24 for both marks), replacing the
  scale pop. Polyline point order is draw order — short arm first, then the
  long stroke — so the check draws the way a hand writes it. Un-check reverses
  the draw. Draw rides `--fui-transition-normal`; indicator opacity rides
  `--fui-transition-fast` so exits don't linger. Verified live on
  /components/checkbox (offset sampled 0→24 over ~200ms).
- `keepMounted` on the Base UI Indicator is load-bearing: without it the
  indicator mounts on check and no transition runs.

## What to watch

- The draw budget (dasharray/dashoffset 24) must match the SVG `pathLength`
  attribute in index.tsx. Changing the glyphs means keeping both in sync.
- Menu/Select check indicators intentionally do NOT draw — popup remounts on
  every open would replay the animation and read as noise.

## 2026-09-03 Wave 0

- `variant="card"` is now `variant="outline"` (`.wrapperOutline`); absence of `variant` is the plain control, there is no `default` value.
- Disabled rides `@include disabled-state;`; the hand-rolled `prefers-contrast` block is `@include high-contrast-outline;` on `.checkbox`.
- The checked sheen no longer uses raw `white`: it is a `color-mix` of `--fui-control-checked-color`; the offset reads `--fui-stroke-hairline`.
- Still open: a dedicated highlight token (`--fui-color-highlight`) would be cleaner than deriving the sheen from the on-accent color.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Mark: `--fui-bg-primary` ground, `--fui-border-strong` edge, `--fui-text-tertiary` hover edge, `--fui-color-danger` invalid edge, and a real keyboard focus ring (`field.focus-state`) where before only the global hairline applied.
- Focus ring not browser-verified: script focus on a button does not set :focus-visible in this harness.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **One click per press** — the hidden input's click no longer bubbles, so an ancestor `onClick` sees one click per press instead of two (failed with 2 at 1.6.0). Locked by `delivers exactly one click to an ancestor per user click`.
- **Disabled + invalid** — inside a disabled, invalid `Field` the mark keeps `data-invalid`, so the `&[data-invalid]` danger edge now renders under the disabled opacity.
- **Also upstream** — controlled blur validation and stale filled state fixed; stale control ids fixed.

## 2026-10-03 — derive engine

- **What changed** — the box edge reads `--fui-field-border` (3:1 on every plane), not `--fui-border-strong`. The checked fill is `--fui-control-checked-bg`: the brand clamped in lightness and solved to 3:1 on every plane, so any brand keeps a visible checked state (UIR-D97).
- **What works** — the contrast lane holds the edge and the checked fill at 3:1 for 204 seeds in three engines. `src/tokens/Rebrand.states.tsx` checks a `#e11d48` subtree: the checked fill keeps the brand's hue and holds 3:1 (`#d4003e`, 4.56:1 at worst, in light).
- **What doesn't** — not screenshot-reviewed in this change.
- **Landmine** — the rebrand fixture needed the controls in a `Stack` with a gap: a Checkbox right beside a Button fails the WCAG 2.2 target-size check.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-border-default`, `--fui-radius-md`, `--fui-radius-sm`, `--fui-transition-fast`, `--fui-transition-normal`. Corners now read the radius roles (`indicator`, `surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — motion, type and state recipes

- **What changed** — the outline wrapper is the choice card (`choice-card.root` + `choice-card.size`, UIR-D142): surface fill and hairline at the control radius, hover tint under `(hover: hover)`, the focus ring around the card on keyboard focus, and checked or indeterminate takes the selection wash with its hairline turned into the 1px ring. No outer ring, no raised fill.
- **What works** — `SelectionRecipe.states.tsx` checks rest and chosen computed styles; new `Checkbox.states.tsx` (populated, overflow, lifecycle).
- **What doesn't** — fixtures not run in this lane; Checkbox has no error prop, so the error column is n/a.
- **Candidates** — a `trailing` slot on the outline card, matching RadioGroup items.

## 2026-10-03 — choice controls on Glass

- **What changed** — the box sits on the band (`--fui-field-bg`) with the strong field edge, at r.check (`min(4px, r × 0.5)`, 2.5 on Glass; `--fui-checkbox-radius` stays the override hook). The checked sheen is gone; checked is the selection fill and the on-selection mark. Hover is the field hover (55% ink edge) under `(hover: hover)`, on the box and on the label row; checked hover is the selection hover fill. The mark draws in `--fui-duration-micro`. Option labels are body-compact 12; the helper is caption 11 ink 2.
- **API (v4 cuts)** — `onChange`, `size`, `description`, `controlClassName`, `contentClassName` are gone. New `invalid` + `errorMessage`: danger-text edge on the box (the checked fill stays), and the message renders with a bold warning-circle icon and words, wired to `aria-describedby`. Read-only takes the band fill and a dashed edge with no hover.
- **Outline card** — the shared choice card, with the surface radius (the recipe still reads the control radius, so the module overrides it). The card draws the one focus ring; the box inside no longer draws a second. A read-only card has no hover tint.
- **What works** — unit tests cover the label and description wiring, the invalid message and the cut aliases at the type level. New fixtures: `error` and read-only/focus rows in `lifecycle`.
- **What doesn't** — not browser-checked in this lane (the states and contrast lanes run at integration). The error message is not a live region; it is read with the box through `aria-describedby`.
- **Candidates** — a `trailing` slot on the outline card, matching RadioGroup items; a `--fui-radius-check` role token so the formula lives in one place.
