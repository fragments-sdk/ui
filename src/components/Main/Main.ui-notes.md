# Main — UI notes

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: the story example moved from the deleted `Text size` to `Text scale` (UIR-D16).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-10-03 — motion, type and state recipes

- **What changed** — `layout.page-gutter()` is 16 (was 24), so the page inline padding follows (UIR-D141).
- **What works** — the module still reads one recipe for its gutter; the recipe test pins 16.
- **What doesn't** — AppShell's floating main and `paddingLg` still use 24 of their own.
- **Candidates** — move AppShell onto `layout.page-gutter()` (the shell batch).

## 2026-10-03 — shell on Glass (v4 hard cut)

- **What changed** — Main is the one gutter owner (16): AppShell.Main pads nothing and renders no `<main>`, so the gutter and the landmark no longer double. New `Main.Title` (h1 by default, `as="h2"` for a panel) at the `title-lg` role (24/32, strong, ink 1). `Main.Description` now sets `body-compact` (12/18) in ink 2 and wraps at the new `--fui-main-description-max-inline` token (68ch, was a literal). `as` narrows to `main | section | div` (list and landmark values cut); the default `<main>` takes `id="main-content"` unless an id is passed. Logical properties throughout. Still server-safe: no hooks, no `"use client"`.
- **What works** — `Main.test.tsx` covers the regions, the default id, no id on section or div, the narrowed `as` (type-level), the title levels, the gutter and measure, and the title and description roles. `Main.states.tsx` renders full, narrow, a long title and description, and an empty page.
- **What doesn't** — not browser-checked in this lane; the description's `> *` margin reset assumes paragraphs inside it.
- **Candidates** — a `Main.Actions` slot beside the title for the page's one primary action (the masthead pattern).

## 2026-10-04 — Glass PR5 review fixes: stories

- **Fixed** — Stories set their copy in `Text` (the description in ink 2), not raw paragraphs. Not browser-checked.
