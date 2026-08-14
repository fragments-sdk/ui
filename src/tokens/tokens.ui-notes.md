# Token layer — UI notes

The library's default theme is **paper & ink** (2026-08): warm-neutral paper
surfaces, near-black ink primary actions, pine/sage reserved for meaning.
Derived from the approved mintlify-style landing direction and promoted here so
every consumer — docs, Cloud, open-source installs — inherits it by default.

## What works

- **Paper and charcoal planes.** The default carbon theme uses `#161616` for
  the dark canvas/main/primary surfaces and `#202020` for neutral raised
  chrome. Light mode starts at `#f4f4f4`—halfway between the previous grey
  paper and white—with `#eaeaea` raised chrome. Hover and pressed roles retain
  the same step rhythm (`#242424` / `#e6e6e6`, `#2e2e2e` / `#dcdcdc`).
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
