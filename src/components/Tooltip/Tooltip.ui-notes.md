# Tooltip — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — stories carry a `children` arg so they typecheck.
- **What works** — a `lifecycle` fixture focuses the trigger, waits for the tooltip and checks Escape closes it.
- **What doesn't** — the fixture has not run in the browser in this lane.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — The tooltip takes the strong weight (600) on 11px caption type.
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked with a two-line tip.
- **Candidates** — None.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: the arrow offsets read `measurements.raw-space()`, the hairline reads `$fui-stroke-hairline`, and the stories/contract examples moved to the ruled Button vocabulary (UIR-D31).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- Inverse fill, `--fui-text-inverse`, l2 radius and shadow moved into `overlay.tooltip`; the raw `60` z-index fallback now reads `$fui-overlay-layer-tooltip`. Checked on hover in Storybook.

## 2026-10-03 — popups keep their theme scope

- **What changed** — the portal spreads `useThemePortalProps()`, so a popup opened inside a nested `Theme` renders with that scope's `data-fui-theme`, mode, inputs and chrome instead of the page's. Outside a scope it adds nothing. Proved in four projects by `Theme.states.tsx` (`populatedPortal`): a Tooltip opened in a dark scope on a light page fills with the scope's inverse plane and holds 4.5:1.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — still popup (UIR-D132); `sideOffset` default 6 → 4, in the contract too; `collisionPadding` 8. New `Tooltip.states.tsx` (`@family:overlays`): populated and overflow.
- **What works** — `MotionRecipe.states.tsx` (`@tag:recipe-motion`) checks the popup is fully drawn in the first settled frame (opacity 1, no scale, no transform, nothing animating), sits 4px from its anchor, and is gone within 3 frames of closing, in Chromium, WebKit, Firefox and the touch project. The lint rule `fui/motion/popup-roles` holds the module to the popup motion roles.
- **What doesn't** — no lifecycle state: open and close on hover and focus is not driven in the fixture, so coverage reads lifecycle as missing.
- **Candidates** — a lifecycle state that opens on focus and closes on `Escape` and blur.

## 2026-10-03 — v4 surface and token pass

- **Floating surface** — the tooltip corner reads `--fui-radius-tooltip`.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — Glass v4 Overlays (PR4)

- **What changed** — `arrow` cut (the inverse fill reads as attached without one); `sideOffset` cut (one popup offset); `Tooltip.Root` cut (`Tooltip` is the root); the Provider aliases `delayDuration`/`skipDelayDuration` cut; top-level HTML attributes on `Tooltip` cut in favour of `contentProps` (which now types `data-*`). The unused `.trigger` class and the `[data-instant]` special case are gone (popups are still, so instant has nothing to cancel).
- **Timing** — cold rest 500ms, warm window 300ms after a tip hides (the next opens at once), keyboard focus opens at once, and a press quiets the tip (`closeOnClick` now defaults to `true`). Outside a `Tooltip.Provider` the warm window is shared through a small module store; inside one, the provider's `delay`/`timeout` (now 500/300) rule.
- **New** — `shortcut` slot: a `<kbd>` after the text at the regular weight, tabular figures. A disabled child (`disabled` prop) is wrapped in a host span that carries the hover, so a disabled control can still say why.
- **What works** — unit tests (15) green, including the cold/warm sequence, shortcut, disabled host, `contentProps`, close on press.
- **What doesn't** — not browser-checked here; keyboard focus on a disabled control is impossible by design, so its tip is pointer-only (the control's own copy must carry the reason too). Wheel and keydown do not dismiss yet.
- **Candidates** — dismiss on wheel/scroll and on any keydown other than modifiers; a `Kbd` component the shortcut slot can share with Menu and Command.
