# Sidebar — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the mobile panel carries a visible close (the modal close, the header making room beside it); before, only Escape and the scrim closed it. The collapsed header shows `collapsedContent` alone, so a full brand no longer clips in the rail. The section chevron takes the micro glyph role, and the collapsible section label carries the 24 pointer hit area (44 coarse). The states fixtures render the mobile drawer closed (trigger focus) and open; the general sub-item is no longer marked current twice.
- **What works** — `Sidebar.test.tsx` covers the close, the panel opening inside a nested Theme scope and the collapsed header.
- **What doesn't** — the drawer fixtures are read only by the coarse project's width.

## 2026-10-03 — Glass: the states harness pass

- **What changed** — the collapsed rail asks its own markup for glyph rows as well as walking its element children, so rows rendered by an app's own wrapper component (a `<Nav />`) keep the rail instead of hiding it as "collapsed with no glyphs".
- **What works** — `Sidebar.test.tsx` covers the wrapper case; `AppShell.states.tsx` `lifecycle` (a wrapped nav, collapsed) now shows the rail and its collapse toggle.
- **What doesn't** — a wrapper whose rows change without the rail re-rendering is re-read only on the rail's next render.

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the width transition is gone: collapse is instant, as AppShell's columns are, and `.root` left the reduced-motion list with it.
- **What works** — Sidebar unit tests pass.
- **What doesn't** — not browser-checked in this lane.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the current item takes the nav marking: `--fui-sidebar-item-active-bg` now points at `--fui-bg-active` (was `--fui-control-selected-bg`) (UIR-D126). Keyboard focus draws the one ring inside the edge (`focus.visible($inset: true)`), because the nav scrolls in a clipping viewport (UIR-D125). Items take `max(navigation row track, --fui-hit-area)`: 32px for a pointer, 44px coarse (UIR-D127). The contract claim now reads that rows are at least 32px tall and reach the 44px floor under a coarse pointer — this corrects the 3.1.3 entry below, which said touch pointers get the same size.
- **What works** — `Sidebar.test.tsx` asserts the row height and the coarse claim; the inset ring is proven in `FocusRecipe.states.tsx` through a clipping fixture that uses the same mixin.
- **What doesn't** — Sidebar has no state fixture: it cannot render standalone in the coarse project, so the ring and the row height are not read from Sidebar itself.
- **Candidates** — a Sidebar fixture inside an AppShell frame.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — The section label reads the body-compact role (12px, unchanged) and takes the semibold weight; gaps on the raw scale (14 → 12, 21 → 20px). `Sidebar.test.tsx` reads the md control height instead of the control track.
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — No coarse-pointer row size yet (unchanged).
- **Candidates** — None.

## 2026-10-03 — contract target claim corrected (3.1.3)

- **What changed** — the contract claimed "Minimum 44px touch targets"; rows are 32px. It now says rows are at least 32px tall (the md control track), the section action has a 32px hit area, and touch pointers get the same size. Code unchanged. (Superseded by the interaction-recipes entry above: coarse rows reach 44px.)
- **What works** — `Sidebar.test.tsx` fails if the contract claims 44px, and ties the sentence to the compiled module: `.item`/`.subItem` rows read the md control track, the section action's hit area is `max(100%, 32px)`.
- **What doesn't** — no coarse-pointer row size yet.
- **Candidates** — 44px rows under `(pointer: coarse)` (shell sweep); the contract sentence changes with them.

## 2026-08-13 — docs density hooks

`.section:not(:first-child)` reads `--fui-sidebar-section-gap` (fallback
16px). Docs sets it to 32px so sparse nav groups read as clusters.

Item lists read `--fui-sidebar-item-gap` (fallback 2px) and
`--fui-sidebar-item-font-size` / `--fui-sidebar-item-line-height` (fallback
ui-compact 12/16). Docs uses 4px / 14px / 20px.

Section labels read `--fui-sidebar-section-label-color` and
`--fui-sidebar-section-label-weight`. Docs uses secondary + 600.

Active rail still honors `--fui-sidebar-item-active-indicator`; docs sets it
transparent so the active row is only the gray rect.

## 2026-08-13 — mobile focus containment

A closed mobile Sidebar now combines `aria-hidden` with native `inert`.
Translating the drawer off-canvas is therefore visual only; descendants cannot
remain in the keyboard focus order.

## 2026-08-21 — section labels become eyebrows

Default section-label voice changed from quiet title-case to small tracked
uppercase (2xs / 0.07em / medium) so groups can't be mistaken for items.
Existing `--fui-sidebar-section-label-*` hooks still override; new hooks:
`-size`, `-tracking`, `-transform`.

## 2026-09-02 — no viewport cap

`.root` is `height: 100%` with no `max-height: 100vh`. AppShell owns the
full-content-height rail border on the grid column; capping the inner
sidebar at one viewport made the hairline stop mid-page. Standalone
Sidebar still draws its own `border-inline-end`; inside AppShell the
column border wins and the inner edge is zeroed.

## 2026-09-03 — alias layer deleted (UI refinement, Wave 0)

The private `--fui-sidebar-row-height/-gutter/-row-gap/-row-radius/-icon-size/
-leading-size/-row-padding-x/-active-dot-size` aliases are gone; rows read
`--fui-navigation-*` hooks straight from the recipe with Sass twins from the
new `navigation.gutter()` / `row-track()` / `leading-box()` / `active-rail()`
getters. Public `--fui-sidebar-item-*`, `--fui-sidebar-bg/-border/-footer-border`
hooks stay (declared in `tokens/_variables.scss`); `--fui-sidebar-section-label-size`
joins them because docs sets it. The undeclared `--fui-sidebar-section-gap`,
`-section-label-tracking/-transform/-color/-weight`, `-item-gap`,
`-item-font-size/-line-height` hooks are inlined (single reader, no writer).
Disabled rows use the shared `disabled-state` mixin; the collapsed rail
reads `--fui-opacity-muted`.

### 2026-09-03 — `--fui-sidebar-item-radius` (UIR-D25)

- The row radius is a public hook again, in the documented `--fui-sidebar-item-*` family: `--fui-sidebar-item-radius` defaults to `var(--fui-radius-full)` in `_variables.scss`; `.item` and `.subItem` read it with the Sass twin as fallback. Products that want restrained rows set it on the `Sidebar.Root` element (Cloud sets `--fui-radius-sm`).
- `.sectionAction` and `.submenu` keep the full radius directly; they are not rows.

## 2026-09-04 Wave 1 — navigation parity (UIR-D41)

- **What changed** — the mobile panel stays a _shell_ surface (flush, full height, app background) and took only the layer tokens plus `overlay.backdrop` for its scrim, not the Drawer panel. In-shell stacking is no longer on the overlay scale: `.rail` 10 → 1, `.collapseToggleFloating` 20 → 2. The rail-indicator active grammar is unchanged, and `navigation.link-states` / `link-active` are deliberately NOT applied here.
- **What was browser-verified** — mobile1: the mobile aside measures 240 x 568 (full viewport height), `border-radius: 0`, `inset: 0`, and computes `z-index: 51` from `--fui-overlay-layer-modal` — no raw value left.
- **Not re-checked in this lane** — the open-state slide and the submenu stories; the panel is closed by default in Storybook and no story exposes a trigger.

## 2026-09-07 — glyphs in the rail, no capitals

Group labels carry no glyph (Conan: only the items themselves get icons).
`.sectionHeader` pads by the item's hairline so the label's left edge sits
on the item glyph column (browser: both at x=17).

Group labels no longer transform to uppercase and carry no tracking. The
voice is now: `xs` size (token default moved from `2xs` to `xs`), semibold,
`--fui-sidebar-faint` ink, on the shorter section track with no hover
surface. Items stay ui-compact / normal weight / muted ink, each with a glyph.
Long group names (repository slugs) truncate with an ellipsis.

The navigation examples use generic Phosphor icons at 16px, passed into
`Sidebar.Item icon` with `aria-hidden="true"`. Application headers use a plain
workspace label. The existing item slots, states and layout are unchanged.

Corrections to the 2026-08-13 note above: the library never read
`--fui-sidebar-item-font-size` / `-line-height` or
`--fui-sidebar-section-label-color` / `-weight`; only `-size` is a live
hook. Cloud's dead `-item-font-size` assignment is removed.

Known: in the light theme `--fui-text-tertiary` and `--fui-text-secondary`
are near-identical (88,83,76 vs 89,84,79), so the group label's ink barely
differs from an item's; weight and the shorter track do the work. A mixed-down ink
was tried and rejected — it fell under 4.5:1 in dark. Fix belongs in the
theme tokens.

## 2026-09-08 — interaction ladder

Hover and active rows share the kit ladder with Menu: `--fui-sidebar-item-hover-bg` → `--fui-bg-hover` (ink 7% light / 9% dark), `--fui-sidebar-item-active-bg` → `--fui-control-selected-bg` (12% / 14%). The Sass fallback for the active row is the new `$fui-control-selected-bg` (derived `selected` surface) instead of `$fui-bg-active`, so build-time and runtime agree. `--fui-bg-highlight` is deleted (no reader).
Browser-verified (Storybook Default, dark): active row 14% and hovered row 9% ink are both visible and distinct; the same computed values as Menu.

## 2026-10-03 — role tokens

- **What changed** — the mobile panel reads `--fui-shadow-popup` (was `--fui-shadow-lg`, UIR-D117). `--fui-appshell-sidebar-width` (240px) and `-wide` (280px) exist as measurement targets (UIR-D119) but the Sidebar does not read them yet.
- **What doesn't** — the floating collapse toggle still casts `--fui-shadow-sm` on a bordered surface.
- **Candidates** — read the app shell widths in the shell sweep.

## 2026-10-03 — v4 surface and token pass

- **What changed** — The active row reads the selection wash and ring (`--fui-sidebar-item-active-bg` / `-border` alias the control selection pair). The panel paints the canvas; `--fui-sidebar-bg`, `-border`, `-footer-border` and `-item-radius` are removed.
- **Token reads** — the legacy reads are gone: `--fui-border-default`, `--fui-radius-md`, `--fui-sidebar-bg`, `--fui-sidebar-border`, `--fui-sidebar-footer-border`, `--fui-sidebar-item-radius`, `--fui-transition-fast`, `--fui-transition-normal`. Corners now read the radius roles (`control`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — shell on Glass (v4 hard cut)

- **What changed** — one state source: `Sidebar.Provider` (or AppShell) when something outside the rail drives it, otherwise `Sidebar` itself; state props on a rail inside a provider are ignored with a dev warning. The rail is the canvas plane with one opaque `border-inline-end`, at `--fui-appshell-sidebar-width` (240) and `--fui-navigation-sidebar-collapsed-width` (56); collapsing is instant (no width motion). Offcanvas, or icon mode with no glyphs, hides the rail (`data-hidden`, `inert`) and Header.Trigger brings it back. Below md the panel is a Base UI Dialog (focus trap, Escape, scroll lock, scrim on `overlay.motion`), replacing the hand-written overlay and effects. Rows sit on the md track (32, 44 under a coarse pointer), ink 2 regular with ink 3 glyphs; the current row is the selection wash plus its 1px inset ring at the regular weight, hover tints over it and is gated to hover-capable pointers. Section labels are caption 11 at the semibold weight in ink 3; collapsible sections have their own instant disclosure. Items and sub-items take `render` (router links), `working` (the working wash, `aria-busy`) and `badge` (neutral Badge). The breakpoint comes from the shared `useBelowBreakpoint("md")`. Cut: `width`, `collapsedWidth`, `position`, `activeIndicator`, `Sidebar.Trigger`, `Sidebar.Overlay`, `Sidebar.Rail`, the floating collapse toggle, `asChild`, `useSidebarContext`, the flat exports (`SidebarProvider`, `SidebarItem`, …). `Sidebar.MenuSkeleton` is now an `li` so it sits in a Section's list.
- **What works** — `Sidebar.test.tsx` (20 tests) covers landmarks, the scroll area, current/disabled/working rows, badges, href and render, submenu, collapsible sections, collapse and toggle, the hidden rail, collapsible none, provider ownership and the warning, inert defaults outside a sidebar, the mobile dialog and Escape, axe, and the style contract. `Sidebar.states.tsx` renders expanded, collapsed, row states, loading and a long label.
- **What doesn't** — not browser-checked in this lane; the mobile panel's slide is checked in tests only by structure, not by eye.
- **Candidates** — a resizable rail (drag the edge between the two width tokens); remembering the collapsed state per user.
