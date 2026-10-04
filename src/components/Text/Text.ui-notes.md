# Text — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the type-step prop is `type` (type `TextType`), and `role` is the ARIA attribute again; Message already uses `from`, so no prop shadows an ARIA attribute. Not `variant`: the ruled vocabulary keeps `variant` for chrome, and the contract-vocabulary gate holds Text to it. The story controls and args moved to `type` too (they had been setting the ARIA role).
- **What works** — unit tests cover `type` and a pass-through ARIA `role`; consumers across the library (blocks, contracts, stories, fixtures) moved to `type`.
- **What doesn't** — nothing new.

## 2026-10-03 — Glass v4: one ladder

- **What changed** — Text is role-only on the 11/12/15/24 ladder: `caption` and `control` 11, `body` 12 (the new default, ink1), `code` 12 mono, `title` 15, `display` 24, `section-label` 11/550 ink3 (eyebrow merged into it). `strong` gives the strong weight. `scale`, `weight`, `font`, `letterSpacing`, `color="muted"` and the off-ladder roles (ui-standard 14, body-relaxed 16, title-md 20, display 32) are gone; `body-compact`, `title-sm` and `title-lg` are renamed `body`, `title` and `display`. `color="accent"` reads `--fui-color-accent-text`, not the fill. The prop keeps the name `role`: the ruled vocabulary keeps `variant` for chrome. Every library consumer moved to the new roles.
- **What works** — unit tests cover the default, every role, the ladder mapping in the module, the section label paint, `strong`, the inks, the accent stop, the cut props (type level), truncation, clamp, tabular figures and axe. A states fixture checks the computed sizes and inks for populated and covers overflow.
- **What doesn't** — not browser-checked in this lane. The generated `code` role is still 14; the module sets body's size and line on it. Text with no role used to inherit its size from the parent; it now sits on body 12, so any caller that relied on inheriting reads 12.
- **Candidates** — drop the generated `code` role to 12 so the module override can go; the prose recipe's headings and the Chart tooltip and Editor placeholder still read the cut 14/16/20 roles.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — Scale steps read the type roles: `2xs` 11, `xs` 12, `sm` and `base` 14, `md` 15, `lg` 20, `xl` 24, and `2xl`, `3xl`, `4xl` all 32 (display). `weight` `medium` and `bold` render the semibold weight (600).
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — The `2xl` to `4xl` steps and the `medium` and `bold` weights no longer differ from their neighbours; the props stay until the v4 cut trims the unions.
- **Candidates** — Trim `TextScale` to the roles and `weight` to normal and semibold at v4.

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `size` → `scale` (`TextScale`, values unchanged); `variant="section-label"`
  / `"eyebrow"` → `role` values on the existing `TextRole` union. The legacy
  `size` / `variant` props are deleted (TypeScript errors, no shims).
- A role owns the whole setting: `role="eyebrow"` cannot be combined with
  `scale` / `weight` / `font` / `letterSpacing` (they were combinable on the old
  `variant`). The runtime still warns and ignores them when an untyped spread
  passes both.
- Classes: `.scale-*`, `.role-section-label`, `.role-eyebrow`. `margin: 0`
  reads `--fui-raw-space-0`.
- The contract now lists `role` as a prop (it was undocumented).

What still does not work

- `.lineClamp` reads `var(--fui-line-clamp, 2)` with a bare `2` fallback; the
  contract property lives in `_component-properties.scss` but has no Sass twin.

Improvement candidates

- Retire `scale` once every consumer sits on a role; `weight`/`font`/tracking
  then become role modifiers instead of a parallel axis.

## 2026-09-07 — `text-wrap` in the type roles (better-typography rule)

What changed

- `recipes/_typography.scss` `role()` now emits `text-wrap: balance` for the three `title-*` roles and `text-wrap: pretty` for `body-compact` / `body-relaxed`; every `Text` role, `Heading`, `EmptyState` and the page kits inherit it. Prose paragraphs, lists, quotes and tables explicitly reset to `text-wrap: auto`; prose titles retain balancing. Compiled recipe tests verify the final cascade values.
- Cloud's `html { line-height; -webkit-font-smoothing }` override and the duplicate smoothing in `EmptyState` were deleted; the lib owns rendering hints once.

Unverified

- Browser proof that two-line titles balance and that descriptions lose single-word last lines.

Candidates

- Logical properties: 37 physical `margin-left/right`, `padding-left/right`, `left/right` sites remain in the lib (Box 26, Sidebar 14, Prompt 7, feedback recipe 6, NavigationMenu 6, Header 6). Mechanical sweep, best done as one PR with a screenshot pass on an RTL story.

## 2026-09-07 — eyebrow keeps its case

`role="eyebrow"` no longer transforms to uppercase or tracks wide. It is
caption size, semibold, tertiary ink. `section-label` was never uppercase in
CSS; its docs said so and now do not. The library has no `text-transform:
uppercase` left anywhere (Sidebar test guards its own module).
