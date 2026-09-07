# Text — UI notes

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
