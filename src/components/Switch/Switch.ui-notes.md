# Switch — UI notes

## 2026-10-04 — pill track, white thumb

- **What changed** — the track is a pill (radius = height ÷ 2) and the thumb is a round of the accent's ink, `--fui-color-on-accent`, white on the default brand in both modes, with the small shadow (UIR-D149). The surface thumb went near black in dark, so an off switch read as a hole; the Fragments desktop app already drew a pill with a white thumb.
- **What works** — headless screenshots of off, on, disabled and read-only in light and dark on the default brand: the thumb reads on the off line and on the on fill in both modes.
- **What doesn't** — a light brand turns the accent's ink black, so in dark an off switch on that brand shows a black thumb on the dark off line. Not seen in a product yet.
- **Candidates** — a thumb role of its own, white in both modes, if a light brand ships.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the focused label root delegates its ring to the track (`focus.delegated`), so a focused Switch paints one ring, the one focus ring, on the box a user reads as the control (UIR-D125).
- **What works** — `FocusRecipe.states.tsx` reads the ring on a Switch at the ring width and offset, ≥3:1.
- **What doesn't** — none known.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the coarse-pointer `hit-size("touch")` override (48px) is gone; the compact hit area rises to 44px under a coarse pointer on its own; under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-08-18 — token contract audit

### What works

- The off/thumb surfaces are derived, not hard-coded: six component-scoped
  custom properties mix `--fui-bg-elevated` / `--fui-bg-primary` /
  `--fui-border-strong` against `--fui-text-primary`, with `light-dark()`
  carrying both schemes in one declaration. Retheming the neutral ladder
  retints the control for free.
- On/off are distinguished by surface _and_ border, not colour alone, so the
  state survives a monochrome or high-contrast rendering.

### What doesn't

- Every off-state surface is a `color-mix()` of two global tokens. That makes
  the control fully dependent on the token layer resolving: any single missing
  role invalidates the whole declaration rather than degrading one channel.
  The SCSS fallbacks now cover this, but the coupling is worth remembering
  before adding a seventh derived property.

### Landmines

- These are **custom property declarations**, so the SCSS half of each dual
  fallback must be interpolated — `var(--fui-bg-elevated, #{$fui-bg-elevated})`.
  Written bare, Sass copies the literal text `$fui-bg-elevated` into the CSS,
  which is not a colour, so the fallback silently does nothing and the control
  renders transparent whenever the token layer is absent. See
  `src/tokens/token-fallback-contract.test.ts`, which gates both halves.
- `Toggle` is a deprecated alias re-exporting this component. It asserts strict
  identity (`Toggle === Switch`), so do not wrap or re-implement the export.

## 2026-08-18 — release verification

### Public package treatment of UI notes

- `*.ui-notes.md` files are in-repo agent session logs. They are excluded from
  the published `@usefragments/ui` tarball (`package.json` `files` glob
  `!src/**/*.ui-notes.md`). Do not add a public export or docs page for them.

### Geometry evidence

- The geometry runner always loads the Storybook token layer, so it cannot
  prove the no-token-layer fallback this fix restores. Switch has one catalog
  case (`geometry/boolean-range/switch/default/na/light/catalog-smoke-1440`)
  still `pending`, with `baselines.json` empty. A09-01 remains unsatisfied;
  macOS cannot mint the Linux-x64 PNG authority. Do not treat this CSS fix as
  a new geometry baseline.

### Chrome fixture

- Compiled-CSS panels live at
  `libs/ui/evidence/mvp-switch-fallback/fixture.html` (regenerate with
  `node libs/ui/evidence/mvp-switch-fallback/generate-fixture.mjs`). Distinctive
  tokens must paint neon off-tracks; the no-layer panel must stay opaque and
  distinct from on.

## 2026-09-03 Wave 0

- Every `--_switch-*` and `--_fui-switch-*` private property now carries a Sass fallback (`boolean.switch-thumb-size("md")`, `$_switch-travel-md`, `--fui-stroke-default`, surface tokens).
- Raw `white`/`black` sheens and shadows moved to `--fui-bg-elevated`, `--fui-control-checked-color`, `--fui-text-primary`.
- Disabled rides `@include disabled-state;`; `prefers-contrast` block replaced by `@include high-contrast-outline;` on `.track`.
- Test regex for the thumb translate now tolerates the fallback in `var(--_fui-switch-travel, …)`.
- Still open: a `--fui-color-highlight` token for the sheen instead of borrowing surface/on-accent colors.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Unchanged; already on `field.focus-state`. Verified on :6006 as the reference for the ring.

## 2026-09-04 Wave 1 — one focus ring, not two (UIR-D56)

- **What was broken** — Switch is the only field whose ring is drawn on a child. `field.focus-state` styles `.track`, but the element that takes focus is `.root` (the label), so a focused Switch painted the recipe's `2px` @34% ring on the track **and** the global `:where(:focus-visible)` `1px` @24% ring on the root — two concentric rings where Checkbox and Select paint one, because there the focused element is the element the recipe styles.
- **What changed** — `.root:focus-visible { outline: none; }`. The ring stays where it reads as part of the control.
- **What was browser-verified** — keyboard-focused at `forms-switch--default` in all four render states: root `outline-width: 0px`, track ring `2px color(srgb 0.960784 0.380392 0.219608 / 0.34)`. One ring in each profile.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **One click per press** — the hidden input's click no longer bubbles, so an ancestor `onClick` sees one click per press instead of two. Locked by a test.
- **Also upstream** — controlled blur validation and stale filled state fixed.

## 2026-10-03 — derive engine

- **What changed** — the off track's edge is `--fui-field-border` (3:1 on every plane); hover mixes it 72 / 28 toward ink 1. The four `light-dark()` mixes of `--fui-border-strong` and ink are gone. The on track is the selection colour, `--fui-control-checked-bg`.
- **What works** — the contrast lane holds the off track at 3:1 for 204 seeds in three engines. Before: about 2.45:1 in light at the Glass default.
- **What doesn't** — not screenshot-reviewed in this change.

## 2026-10-03 — role tokens

- **What changed** — the pressed thumb reads `--fui-shadow-sm` (was `--fui-shadow-md`). The `md` alias now means the popup shadow, which a thumb should not cast (UIR-D117).

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-transition-fast`, `--fui-transition-normal`. motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — choice controls on Glass

- **What changed (major redesign)** — one 36×18 track drawn from the xs control height (× 1.5 by × 0.75) at min(control radius, h/2), not a pill. Off fills the strong field line (`--fui-field-border`), on fills the selection colour; no border, no sheen, no light-dark mixes. The thumb is the surface (`--fui-bg-primary`) with `--fui-shadow-sm` at rest, no border, inset 2 at the nested radius (3 on Glass), the same in both states. The track colour changes in `--fui-duration-micro`; the thumb moves the full travel instantly. Hover is gated under `(hover: hover)`: off mixes the line 86% toward ink 1 (the same step the selection hover takes), on is the selection hover fill; hovering the label hovers the track.
- **Structure** — the Base UI Root is the track; label and helper render outside it in a `<label>` row, tied by `aria-labelledby` and `aria-describedby`. The focus ring sits on the track.
- **API (v4 cuts)** — `onChange`, `description`, `size` are gone. New `invalid` + `errorMessage` (message with a bold warning-circle icon and words, `aria-invalid` on the switch; the track keeps its colours). The props now extend label HTML attributes, which land on the row (or on the track when there is no visible text).
- **States** — disabled dims once (row, or the bare track); read-only keeps full ink, refuses the toggle, drops hover, and an off track takes the band with a dashed field edge drawn as an outline. Forced colours: Canvas track with a CanvasText edge, Highlight when on, the thumb in CanvasText / HighlightText, GrayText when disabled.
- **What works** — unit tests: label outside the switch element, invalid wiring, cut aliases at the type level, the Glass paint and instant travel. New `Switch.states.tsx`.
- **What doesn't** — not browser-checked in this lane; the invalid state has no track paint by design (guess), so the message carries it alone.
- **Contrast lane** — the probe reads the off track's rest fill (`paint: "fill"` in `contrast/pairs.mjs`), since the track has no border; 3:1 holds on every plane for 204 seeds in three engines.
- **Candidates** — a pending treatment for server-backed settings (the consumer owns it today).
