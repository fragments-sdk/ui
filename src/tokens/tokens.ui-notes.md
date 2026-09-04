# Token layer — UI notes

The library's default theme is **warm paper & coral** (2026-08-21): a single
`paper` neutral ramp (one light theme, one dark theme — all alternative
palettes deleted), coral `#f56138` accent, ink primary actions. Fonts are
Onest (sans) + JetBrains Mono. Verified in-browser on the docs homepage and
the coral prototype in both modes.

## What works

- **Cream canvas and warm charcoal planes.** Light: `#faf8f5` canvas,
  `#f2ede7` tinted bands (tertiary), white elevated cards, warm alpha
  hover/active tints. Dark: `#171614` canvas, `#1e1c19` bands, `#262421`
  elevated cards — a real elevation ladder so bands and cards separate in
  both modes. Borders are warm-tinted (`rgba(60,45,30,…)` light, `#343029`
  dark).
- **Coral accent everywhere.** `$fui-brand: #f56138` drives accent, focus
  rings, selection tint; dark mode preserves its chroma via the OKLCH
  derivation (no more pinned sage). On-accent resolves to black (6.6:1).
- **Semantic raised chrome.** `--fui-card-header-bg` aliases the subtle raised
  plane. `--fui-header-search-bg` sits one step higher on the hover plane so
  the global search affordance remains easy to find. Each role can still be
  tuned independently by a product theme.
- **One persistent-selection role.** `--fui-control-selected-bg` owns the
  neutral selected overlay used by fields, sidebar items, table rows, Header
  navigation, pill tabs, toggle groups, pagination, filter badges, prompt
  modes, and toggle-style icon actions. It is deliberately separate from
  `--fui-bg-active`, which is a brief pointer-down state.
- **Checked controls stay semantic.** Checkbox, RadioGroup, and Switch use the
  `--fui-control-checked-*` family, which aliases the accent ramp rather than
  primary-button chrome. A consumer can restyle primary actions without
  silently changing boolean values; Slider value fill also follows accent
  directly.
- **Ink primary buttons (Fragments default brand).** Primary chrome rides
  `--fui-bg-inverse` + `--fui-text-inverse`, so it flips automatically:
  near-black fill in light, near-white fill in dark. Hover lightens
  (`color-mix` 88% + white in light, pure white in dark); active compresses
  darker. Radius is `var(--fui-radius-xl)` — squircle, participates in the
  radius-profile system (`sharp`…`pill` still re-map it).
- **Consumer brands finally paint their buttons.** A non-default `$fui-brand`
  now emits accent-driven primary chrome (`--fui-color-accent` ramp +
  `--fui-color-on-accent`) instead of the old hardcoded pine — and stays
  reactive to runtime `--fui-seed-brand` changes.
- **Light hairlines are spec-sheet weight.** `derive-borders` light: 8%
  default / 15% strong (was 5%/10%, invisible on paper). `--fui-field-border`
  rides border-strong, so inputs get the drafting-line edge.
- **Light surface ladder has real depth.** Stone/carbon light `tertiary` is
  one stop below `secondary` (carbon 200 vs 100), so hover/nested surfaces on
  paper read instead of vanishing.
- **Code selection tracks the accent** (`--fui-color-accent`), not the button
  chrome — ink buttons would have greyed it out.
- **Keyboard focus is a solid token ring.** `focus-ring` uses the full
  theme-resolved focus color at the configured width/offset instead of
  low-opacity shadows, preserving a clear non-layout focus indicator.
- **Light product chrome swaps the rail and canvas.** `--fui-app-sidebar-bg`
  follows paper (`--fui-body-bg`); `--fui-app-main-bg` follows tertiary.
  Dark rail is `--fui-bg-tertiary` against a `--fui-main-bg` body — do not
  mix primary into secondary; they are the same stop in paper dark.
- **Accent capsules sit on elevated.** `--fui-card-accent-bg` aliases
  `--fui-bg-elevated` (white in light, lifted charcoal in dark). Tone
  supplies the wash and hairline. Mixing toward black made light-mode
  moments look like a dark-mode slab.
- **Semantic seeds match the Cloud Surfaces artifact.** Danger `#c44732`,
  success `#2c8c5f`, warning `#c4922a`, info `#3d7aa8`. Badge / Text
  washes still derive from those seeds.
- **Code surfaces ride tertiary** in both themes (`#f2ede7` / `#1e1c19`) so
  they sit on the paper plane instead of a second dark inset.

## What doesn't

- `--fui-button-radius` is a single token across all button sizes; 12px on an
  xs button reads rounder than on lg. Acceptable, but a per-size radius recipe
  would be truer to optical intent.

## Landmines

- The ink chrome is gated on `$brand-is-fragments-default` — do not "simplify"
  the two branches into one; they are different design contracts (showcase ink
  vs consumer brand).
- `--fui-bg-inverse` doubles as the tooltip surface. Restyling it restyles
  primary buttons (and vice versa) — they are intentionally the same material.
- Carbon stop 100 is the light canvas and light `text-inverse` (CTA label
  colour). Keep its relationship to the dark plane deliberate when tuning the
  surface ladder.
- **Dual fallbacks inside custom property declarations must be interpolated.**
  Sass evaluates `$fui-*` in a normal declaration (`block-size: var(--fui-icon-md,
$fui-icon-md)` → `16px`) but copies a custom property's value through
  unparsed, so `--x: var(--fui-bg-elevated, $fui-bg-elevated)` emits the literal
  text `$fui-bg-elevated`. The declaration is then invalid and the fallback does
  nothing — the failure is silent and only visible when the token layer is
  absent. Inside `--*:` always write `#{$fui-token}`. Gated by
  `src/tokens/token-fallback-contract.test.ts`.
- **UI notes are not a published artifact.** `*.ui-notes.md` is excluded from
  the `@usefragments/ui` tarball. Keep landmines here for in-repo agents; do
  not teach consumers to import these files from `node_modules`.
- **`button-reset` marks pressables `user-select: none` + transparent tap
  highlight (2026-08-21).** Every include site is a real pressable except two
  textareas (Prompt `.textarea`, Editor `.contentTextarea`) which restore
  `user-select: text` locally. New non-button include sites must do the same.
- **Motion token families registered (2026-08-21).** `--fui-anim-offset-sm/md`,
  loop durations `--fui-duration-spin/pulse/shimmer` (800/1500/2000ms — easing
  stays per-effect), and `--fui-overlay-layer-swipe/backdrop/modal/anchored/
tooltip` (49/50/51/52/60) now emit from `:root`. All spinners, pulses,
  shimmers, and overlay z-indexes ride these; new looping animations must not
  hardcode seconds. `_measurements.generated.scss` is also a contract token
  source (fragments.config.ts) so measurement vars are real vocabulary.

## 2026-08-23 — placeholder ramp + capsule plane (Cloud parity)

- `--fui-skeleton` / `--fui-skeleton-hi` now emit from `:root`, derived from
  `--fui-border-default` mixed into `--fui-bg-secondary` (62% / 24%) so they
  track both themes. `Skeleton` paints the base colour and shimmers the
  highlight across it; the old opacity pulse spent half its cycle invisible
  on paper, which made every light-theme loading state read as a blank page.
  Static under `prefers-reduced-motion`.
- `--fui-card-accent-bg` moved from `--fui-bg-elevated` to `--fui-bg-tertiary`
  and `--fui-card-accent-radius` from `radius-lg` to `radius-xl`: the earned
  moment sits _into_ the page as a warm well rather than floating a white slab
  on it (approved lifted-verdict direction, 2026-08-22). Covered by
  `baseline-surfaces.test.ts`.
- Open: the approved mockup draws the capsule at 24px radius; the ramp tops
  out at `radius-xl` (12px at Cloud's 14px rem). A display radius step would
  close it.

## 2026-09-02 — read-safe syntax + link ink (Brief 03)

`--fui-code-token-{keyword,string,comment,function,number,punctuation,variable}`
and `--fui-link-ink` emit from `:root` as `light-dark($light, $dark)`. Light
syntax ink is a darker paper-and-coral set so each stop is ≥ 4.5:1 on
`--fui-code-bg` (`#f2ede7`). Dark syntax ink is a lifted coral/sage/ink set
on `#1e1c19`. `--fui-code-text` aliases `--fui-text-primary`.

`--fui-link-ink` is `#9a3412` in light (a darker accent step; coral `#f56138`
fails AA on `--fui-app-main-bg`) and `$fui-dark-color-accent` in dark.
Gated by `read-safe-contrast.test.ts`. Do not point light link or syntax ink
at `$fui-color-accent` without re-running that test.

## 2026-09-02 — stroke + control-track Sass variables

`$fui-stroke-{hairline,default,strong}` and
`$fui-control-track-{micro,sm,md,lg}` now exist in `_variables.scss`, read
from the measurements map, so `var(--fui-stroke-hairline, $fui-stroke-hairline)`
satisfies the dual-fallback contract. Before this the only fallback form was
a raw `1px`, which the docs vocabulary guard forbids.

## 2026-09-04 — density axis deleted (UIR-D36)

`$fui-density`, `[data-fui-density]`, `_density.scss` and the compact/relaxed
profiles are gone. `_computed.scss` reads the single `spacing` record from
`_measurements.generated.scss` (`spacing-value`, `spacing-step`,
`spacing-px-to-rem`) and `:root` is the only emitter of `--fui-space-*`,
`--fui-touch-*` and `--fui-sidebar-item-height`. `--fui-scale` is the only
runtime size knob. If a consumer needs a tighter or looser kit, the answer is
`--fui-scale`, not a new profile; a request for a second profile is a
blueprint decision, not a token edit.

## 2026-09-04 — field chrome tokens deleted (UIR-D38)

`--fui-field-bg`, `--fui-field-bg-disabled`, `--fui-field-border`,
`--fui-field-border-hover` and `--fui-field-border-focus` are gone. The field
recipe never read them (its shell rides `--fui-border` on `--fui-bg-primary`,
its focus ring rides `--fui-color-accent` + `--fui-focus-ring-color`), so a
consumer overriding them changed Checkbox and Radio marks and the Select
open-state edge but not a single text field. Field chrome is now overridden
through the base tokens the recipe actually reads. `--fui-field-selection-*`
and `--fui-form-group-*` stay: Editor and listbox rows read them.

## 2026-09-04 — overlay layer scale gains toast (UIR-D40)

- `--fui-overlay-layer-toast` (55) added between anchored (52) and tooltip (60); Toast read `2 × --fui-header-z-index` before, which was outside the layer scale.
