# TableOfContents — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — a group name reads at the section label role, 11/550 (caption size, semibold), the same as a Sidebar section: the weight now lives in the shared `navigation.section-row` recipe both use, so the two cannot drift.
- **What works** — `TableOfContents.test.tsx` checks the compiled size and weight on the group header.
- **What doesn't** — the browser lanes were not re-run this pass.
- **Candidates** — none new.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the current item is the nav marking (UIR-D126): `--fui-bg-active`, ink 1, the semibold weight, no ring (it was semibold ink on no fill). Hover is the hover tint painted over it, only where the pointer can hover. Links take the one focus ring; rows reach 44px under a coarse pointer through the navigation row.
- **What works** — `SelectionRecipe.states.tsx` reads the tint, ink, weight and no ring on the current item; `TableOfContents.states.tsx` (new, `@family:navigation`) renders populated, empty, overflow and lifecycle; `FocusRecipe.states.tsx` reads the ring on a link and 44px rows coarse.
- **What doesn't** — the current item now reads as a grey bar, heavier than before in a dense rail.
- **Candidates** — a quieter current marking for a long table of contents, if the bar competes with the page.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — Gaps read `--fui-raw-space-12` (was 14px); the active entry takes the semibold weight.
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked with deep nesting.
- **Candidates** — None.

## 2026-08-13 — compact title

Default title-to-list gap is `--fui-space-2`. Hosts can safely tune
`--fui-toc-title-gap`, `--fui-toc-row-track`, `--fui-toc-inline-inset`,
`--fui-toc-content-gap`, and `--fui-toc-hover-bg` without overriding general
navigation or surface tokens. Reduced-motion users receive instant anchor
scrolling.

## 2026-08-13 — optical alignment

The "On This Page" title consumes the same `--fui-toc-inline-inset` host hook
as `.link` rows, falling back to the canonical navigation inset. Compact hosts
can therefore make both title and rows flush without an internal override.

## 2026-08-14 — opt-in concise hierarchy

`hideSubItems` is additive and defaults to `false`, preserving the released
hierarchy for existing consumers. Dense page indexes can opt in with
`hideSubItems`; Docs does so explicitly rather than changing the library default.

## 2026-09-02 — `Item href`

`TableOfContents.Item` was typed with `href` but ignored it. It now renders an
explicit `href` as a plain route link and skips the anchor scroll handler
(`onClick` still fires). Docs uses it for a "Related" list beside the page
index. Anchor behaviour is unchanged when `href` is omitted.

## 2026-09-03 — hooks fold into navigation (UI refinement, Wave 0)

`--fui-toc-title-gap`, `--fui-toc-inline-inset`, `--fui-toc-row-track`,
`--fui-toc-section-track`, `--fui-toc-content-gap` and `--fui-toc-hover-bg`
are deleted: no consumer set them and `navigation.row` / `section-row`
already author the geometry. Every read now carries a Sass twin
(`var(--fui-navigation-inline-inset, #{navigation.gutter()})`), so the
kit scan's dual-fallback and undefined-token gates are green here.

2026-09-07: the uppercase transform is gone (library-wide rule: no
`text-transform: uppercase`). The label keeps its size, weight and colour.

## 2026-10-03 — v4 surface and token pass

- **What changed** — The current entry takes `selection.current`: the selection wash plus its inset ring at the regular weight.
- **Token reads** — the legacy reads are gone: `--fui-radius-md`, `--fui-transition-fast`. Corners now read the radius roles (`control`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — motion, type and state recipes

- **What changed** — the current item (`selection.current` via `navigation.link-active`) now takes the selection wash plus the 1px selection ring at the regular weight, the same marking as a selected row (UIR-D142); nav links round at the control radius and move in the micro role. No module change.
- **What works** — `SelectionRecipe.states.tsx` checks the current nav item's wash, ring, ink 1 and regular weight.
- **What doesn't** — not browser-checked in this component's own stories in this lane.
- **Candidates** — a current-item state in this component's fixture.

## 2026-10-03 — navigation core on Glass

- **What changed** — the title defaults to "On this page" and `title={null}` replaces `hideTitle`. Item `id` is now `targetId` (it named the heading, not the link, and collided with the DOM id); with neither `targetId` nor `href` the link points nowhere and the click is left alone. Depth comes from nesting only: a Group's items sit in their own nested list one level deeper and indent one step per level on the logical start inset (12/24/32 past the row inset), so `Item indent` is cut. Groups fold through the Base UI collapsible primitive, at once (no height motion); `collapsible={false}` replaces Group `disabled`. Group `active` (an accent label) and root `hideSubItems` are cut. The list gap is 2; rows sit at the control radius with `action.motion`, gated hover tint, `focus.visible` and `text-align: start`; the group caret is the ink 3 library caret, turned for right-to-left pages. No items renders nothing. `.active` keeps `selection.current`. The flat `TableOfContents*` exports are cut.
- **What works** — unit tests cover the title, `targetId` links, routes, smooth and reduced-motion scroll, nesting and the depth cap, folding, controlled open, the static header, the empty guard, and axe. Recipe fixtures (Focus, Selection) use `title={null}` and `targetId`.
- **What doesn't** — fixtures not rendered in this lane; the group panel unmounts its items while closed, so a scroll spy cannot mark a hidden item.
- **Candidates** — open the group that holds the active item automatically.
