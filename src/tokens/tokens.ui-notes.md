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

## What doesn't

- `--fui-button-radius` is a single token across all button sizes; 12px on an
  xs button reads rounder than on lg. Acceptable, but a per-size radius recipe
  would be truer to optical intent.
- Code remains intentionally dark in both themes: `#171717` on light paper and
  the recessed `#0d0d0d` in dark mode. A consumer wanting a light code surface
  must override `--fui-code-bg`.

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
