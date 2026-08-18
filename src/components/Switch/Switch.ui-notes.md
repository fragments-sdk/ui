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
