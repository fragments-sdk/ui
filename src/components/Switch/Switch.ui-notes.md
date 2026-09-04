# Switch — UI notes

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
