# Icon — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the module drops its needless `"use client"` directive: it holds no hook, context or handler, so `Icon` and its compound parts render in a server component (the server-components baseline no longer lists it).
- **What works** — the style lane no longer holds a baseline entry for this file.
- **What doesn't** — the server-components lane was not run this pass.
- **Candidates** — none new.

## 2026-10-03 — Glass: the states harness pass

- **What changed** — the `lifecycle` fixture's disabled host carries `aria-disabled="true"`, so axe reads it as disabled text rather than body text at disabled opacity.

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — one ink prop: `color` merged into `tone` (`secondary`, `tertiary`, `accent`, `info`, `success`, `warning`, `danger`), and `tone="accent"` paints `--fui-color-accent-text`, the accent ink, not the fill. `weight` is typed `regular | bold | fill`. `iconProps` is cut, so every glyph stays on the 12/14/16/18/24 ladder and the wrapper's label is the only label path. New `Icon.states.tsx` (`@family:primitives`): populated (ladder, weights, inks) and lifecycle (inherited ink and dim).
- **What works** — `Icon.test.tsx` covers every tone class, the weight forwarding and type errors on `color`, `iconProps` and `size="2xl"`. The contract vocabulary test allows Icon's two quiet inks on `tone` and nothing else.
- **What doesn't** — the shared representation recipe still defines a `2xl` glyph step and `--fui-icon-2xl`; Icon cannot reach it, but the recipe and token should go (listed for the recipe owner).
- **Candidates** — a codemod for `color="secondary|tertiary"` → `tone`; direct glyph calls at 9, 10 or 20 px move to Icon's 12, 14, 16 or 24.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — `size="lg"` renders 18px (`--fui-icon-lg`, was 20), so the icon ladder is 12 / 14 / 16 / 18 / 24. The pixel size passed to the glyph comes from the generated measurements.
- **What works** — `Icon.test.tsx` expects 18 for `lg`; `v4-surface.test.ts` reads `--fui-icon-lg` at 18px from the built stylesheet.
- **What doesn't** — not browser-checked beside 14px text.
- **Candidates** — None.

## 2026-10-03 — hidden by default (3.1.3)

- **What changed** — the wrapper span had no `aria-hidden`, though the contract says icons ship hidden. It now renders `aria-hidden="true"` by default. `aria-label` or `aria-labelledby` (already accepted through the HTML props) makes it meaningful: `role="img"` and no `aria-hidden`. An explicit `aria-hidden` or `role` from the caller wins. A glyph labelled through `iconProps` (`aria-label`, `aria-labelledby`, `alt` or `title`) keeps the wrapper exposed and owns the role itself, so icons labelled that way before 3.1.3 stay announced. Contract accessibility notes say how to label one.
- **What works** — `Icon.test.tsx` covers hidden, labelled (`getByRole("img", { name })`), `aria-labelledby`, caller overrides, and axe on both. The old code failed axe for a labelled icon (`aria-label` on a role-less span).
- **What doesn't** — no `label` prop yet; a meaningful icon needs `aria-label`.
- **Candidates** — a `label` prop that maps to `aria-label` (primitives sweep, a new prop, so not in a patch).

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant` is deleted. Semantic values live on `tone` (`accent` | `info` |
  `success` | `warning` | `danger`; old `error` → `danger`); the text
  hierarchy lives on `color` (`primary` | `secondary` | `tertiary`), the same
  axis as Text. `tone` wins when both are set. The deprecated semantic `color`
  values are gone; the old `default` value is the absence of the prop.
- `size="2xl"` is folded into `xl` (24px, the largest glyph step). The catalog
  keeps an `icon.2xl` target (EmptyState's md icon reads `--fui-icon-2xl`), but
  `Icon` no longer exposes it.
- Classes follow the axes: `.toneAccent` … `.toneDanger`, `.colorPrimary` …
  `.colorTertiary`; `.size2xl` and the bare `.primary` / `.error` classes are
  gone. No kit-internal caller passed `variant` / `color` (blocks use `tone`).

What still does not work

- An `Icon` inside an `EmptyState.Icon` at `size="xl"` renders 24px while the
  slot reserves 32px; pass the icon component's own `size` or a raw svg.

Improvement candidates

- Decide whether the `icon.2xl` measurement target survives Wave 1; if it does,
  restore it as an Icon size with a named job (empty-state and hero glyphs).

## 2026-10-04 — navigation icons

Navigation examples pass generic Phosphor icons directly into `Sidebar.Item icon`
at 16px with `aria-hidden="true"`. Group labels take no icon. Applications can
provide their own icon components through the same slot.
