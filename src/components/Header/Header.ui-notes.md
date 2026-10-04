# Header / AppShell — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — `Header.SkipLink` composes `VisuallyHidden focusable`, so focus reveals it as the floating chip (it used to stay clipped to 1px). `Header.Trigger` beside a sidebar is in the markup from the first paint, server render included, and hides from md up by CSS; a rail collapsed off the canvas brings it back. `elevatedOnScroll` reads the AppShell main pane when there is one, else the nearest scrolling ancestor, else the window: inside AppShell the window never scrolls, so the hairline never showed. The NavMenu chevron takes the micro glyph role.
- **What works** — `Header.test.tsx` covers the reveal classes, the trigger's first-paint class and the pane-driven hairline; `Header.states.tsx` `lifecycleSkipLink` asserts the revealed chip is unclipped and at least 24 square.
- **What doesn't** — the hairline listens to one scroller, picked at mount; a header moved into another scroller keeps the first.

## 2026-10-03 — Glass: the states harness pass

- **What changed** — the `populated` and `lifecycle` fixtures sit in an 880px frame: the nav shows from the md container width up, and the harness frame otherwise shrinks the bar to the brand, so the lifecycle rows were never painted.
- **What works** — every nav row's hover, press and focus is read in the wide projects.
- **What doesn't** — on the coarse project the 880px bar overflows the 412px frame; the narrow bar is the `overflow` fixture's job.

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the brand reads the `title-sm` type step instead of a bare font size. Stories carry a `children` arg so they typecheck. Sidebar collapse no longer animates (see AppShell).
- **What works** — Header unit tests pass.
- **What doesn't** — not browser-checked in this lane.

## 2026-10-03 — actions on Glass (v4)

- **What changed** — contract examples no longer import the cut ThemeToggle: where it was the only header action it became a ghost "Help" Button; beside another action it was dropped. The colour-mode composition lives in the ToggleGroup and Theme docs.
- **What works** — the examples import only exported components.
- **What doesn't** — no example here shows the colour-mode control in a header.
- **Candidates** — a header example with the colour-mode ToggleGroup at `size="sm"`.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the current nav item and the current mobile link take `selection.current`: `--fui-bg-active`, ink 1, semibold, no ring (they were the selection wash) (UIR-D126). Hover paints the hover tint over the current fill. The menu rows use the popup recipe's highlight; two local `outline: none` rules are gone, so keyboard focus draws the one ring (UIR-D125).
- **What works** — `Header.test.tsx` asserts `@include selection.current` and no selection wash.
- **What doesn't** — Header has no state fixture; the marking is proven through the shared mixin in `SelectionRecipe.states.tsx`.
- **Candidates** — a Header fixture with a current item.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); pick-list rows are `max(pitch, --fui-hit-area)`, 44px under a coarse pointer (48px before); under forced colours the highlighted row is Highlight / HighlightText, the selected row keeps an inset CanvasText outline, and separators are CanvasText (UIR-D121).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — Gaps and padding read `--fui-raw-space-*` (7 → 6, 14 → 12, 21 → 20, 28 → 24, 84 → 64px); navigation text takes the semibold weight. The inner measure, 31 steps of the largest space, goes from 2604 to 1984px, and the inline padding clamp tops out at 64px (was 84).
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked at the narrow breakpoint after the gap changes. The measure is still a multiple of a space step, not a layout token.
- **Candidates** — a layout measure token for the header's inner width.

## 2026-08-13 — header matches the reading pane

`.header` and AppShell's header slot paint `--fui-app-main-bg` (fallback
`--fui-main-bg`) so the topbar is the same plane as main — paper rail,
tertiary canvas in light; lifted rail, deeper body in dark.

`Header.Search` paints the semantic `--fui-header-search-bg` surface. The
default aliases `--fui-bg-subtle`, so search remains visible on the reading
plane without a consumer reaching into Button's private styling hooks.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: `$fui-stroke-hairline` / `$fui-stroke-default` and `measurements.raw-space(0)` replace the bare `1px`/`2px`/`0` literals, and the stories plus contract examples moved to the ruled Button vocabulary (UIR-D31).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass, which also owns the pre-existing bare px in `Header.module.scss` (follow-ups in `docs/fragments-v1/ARCHITECTURE.md`).

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- `.navMenuPopup` dropped its duplicate `box-shadow` (the recipe already sets it); it now renders at `--fui-radius-l1` like every other floating surface. Not browser-checked in this lane — the navigation lane owns Header.

## 2026-09-04 Wave 1 — navigation parity (UIR-D41, UIR-D42, UIR-D44)

- **What changed** — `.mobileNavBackdrop` is `overlay.backdrop`, `.mobileNavDrawer` is `overlay.side-panel("end")`; the raw 98/99 z-indexes, the local widths and the `border-left` are gone (the recipe surface carries the hairline edge). `.navMenuPositioner` reads `--fui-overlay-layer-anchored`, `.skipLink` reads `--fui-overlay-layer-tooltip`. Mobile nav links take `navigation.link-states` / `navigation.link-active`; `.mobileNavBody` takes the navigation gutter so its rows inset like NavigationMenu (UIR-D42). A `MobileNav` story was added — the surface previously had none (UIR-D44).
- **What was browser-verified** — mobile1, drawer opened with a real click, in `light`, `dark` and `sharp`: panel inset 16px on all sides (288x536 in a 320x568 frame); light `l1` 8px / dark `#262421` on `#343029` hairline / sharp 0px. Rows: active `--fui-text-primary` on the 9% `--fui-control-selected-bg` wash, inactive secondary ink, `l2` radius following the profile (6px default, 0 sharp).
- **Not re-checked in this lane** — the desktop nav popup (UIR-D40) and the sticky/elevated-on-scroll header.
- **Candidates** — rest/active weight is inert (see UIR-D43); the type role owns it.

## 2026-09-04 Wave 1 — four render states, measured (UIR-D46)

- Mobile nav panel measured at 320x568 in all four render states: **288x536 at (16, 16)**, elevated fill, `z-index: 51`, scrim at `z-index: 50`; radius 7.994 / 7.994 / 0 / 14px. Byte-identical to NavigationMenu's drawer on every measured value.
- The entrance parks at `overlay.side-panel-offscreen("end")` so the 16px inset is not painted before the slide (UIR-D46).

## 2026-09-08 — interaction ladder

Correction to the 2026-09-04 measurement above: `--fui-control-selected-bg` is now 12% (light) / 14% (dark) of the ink, on the shared ladder with `--fui-bg-hover` 7 / 9% and `--fui-bg-active` 14 / 16%. The nav rows read it through the same `$fui-control-selected-bg` fallback as Sidebar and Menu.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Popup origin** — with `align="start"` the scale-in now grows from the aligned edge, not the trigger's centre: `--transform-origin` went from `the trigger's centre` to `0% -4px` (the nav menus use `align="start"`; Menu probed). Only the enter/exit motion changes; the settled frame is pixel-identical.
- **Keyboard close** — after `Escape` the trigger shows its focus ring again in Safari and Firefox. Upstream change to the shared popup focus return; probed on Menu, not on this component.

## 2026-10-03 — popups keep their theme scope

- **What changed** — the portal spreads `useThemePortalProps()`, so a popup opened inside a nested `Theme` renders with that scope's `data-fui-theme`, mode, inputs and chrome instead of the page's. Outside a scope it adds nothing. The mobile drawer uses `createPortal`, so it renders inside `ThemePortalScope`, one element with the same props; `Header.test.tsx` opens it in a dark scope.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — the nav menu popup is still (`popup.motion`, UIR-D132) and its positioner takes `collisionPadding` 8.
- **What works** — lint holds the nav menu to the popup motion roles.
- **What doesn't** — no `Header.states.tsx`, so the nav menu's still open and close is not checked in a browser.
- **Candidates** — a Header state fixture with the nav menu open (component sweep).

## 2026-10-03 — v4 surface and token pass

- **What changed** — The current nav item takes `selection.current`: the selection wash plus its inset ring at the regular weight. Search paints the hover tint (`--fui-header-search-bg` is gone).
- **Token reads** — the legacy reads are gone: `--fui-app-main-bg`, `--fui-bg-subtle`, `--fui-button-radius`, `--fui-header-search-bg`, `--fui-main-bg`, `--fui-radius-lg`, `--fui-radius-md`, `--fui-radius-sm`, `--fui-transition-fast`, `--fui-transition-normal`. Corners now read the radius roles (`control`, `row`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — motion, type and state recipes

- **What changed** — the current item (`selection.current` via `navigation.link-active`) now takes the selection wash plus the 1px selection ring at the regular weight, the same marking as a selected row (UIR-D142); nav links round at the control radius and move in the micro role. No module change.
- **What works** — `SelectionRecipe.states.tsx` checks the current nav item's wash, ring, ink 1 and regular weight.
- **What doesn't** — not browser-checked in this component's own stories in this lane.
- **Candidates** — a current-item state in this component's fixture.

## 2026-10-03 — shell on Glass (v4 hard cut)

- **What changed** — the bar is the canvas plane at `--fui-appshell-header-height` with the 16 page gutter (was 24) and a 16 gap (8 under md bar width). `position` is static or sticky (`fixed` cut: AppShell owns the frame); `height`, `navAlign`, `container`, `icons`, `Header.Spacer` (Actions takes the trailing edge itself), `asChild` and the mobile drawer parts (`MobileNav`, `MobileNavLink`, `MobileNavActions`) are cut. Brand takes the small title role and `render`; NavItem takes `render` and `disabled`, sits on the md track at the regular weight with gated hover and the compact hit area. NavMenu absorbs the dropdown group (`active`, `disabled`), its chevron turns in the same frame as the still popup; NavMenuItem takes `href`, `active`, `disabled`, `render`. Header.Trigger reads `Sidebar.Provider`: it opens the mobile panel, brings back an offcanvas or glyph-less rail, and renders only while the rail is out of view; standalone it shows while the bar is narrower than md. Search has no fill of its own. SkipLink lands on the surface plane with the focus ring.
- **What works** — `Header.test.tsx` covers landmarks, render, sticky + scroll hairline, current/disabled items, the menu (link rows, current row, disabled row), the trigger with and without a sidebar (offcanvas and mobile), axe, and the style contract (canvas, gutter, md track, hover gate, still chevron, logical properties). `Header.states.tsx` renders the bar, the item states (rest, hover, press, current, focus, disabled), the menu trigger and a narrow bar.
- **What doesn't** — not browser-checked in this lane; the fixture hovers the menu trigger; the open list is not rendered by the harness.
- **Candidates** — an overflow menu for nav items that do not fit the bar; a `Header.NavMenu` `side` prop if a bar ever sits at the bottom.
