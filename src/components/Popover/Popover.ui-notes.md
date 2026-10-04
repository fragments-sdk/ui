# Popover — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — story triggers are soft Buttons through `render`, and titles are sentence case.
- **What works** — stories typecheck in the tests-and-stories lane.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the positioner's `outline: none` is gone (it never takes focus) (UIR-D125). After Escape closes the popup, the trigger that gets focus back draws the one ring through the globals `:focus-visible` rule (UIR-D125): this resolves the 04 browser-pass carry-in (a 1px ring at 24% plus a halo).
- **What works** — the library suite and the state lanes pass. `FocusRecipe.states.tsx` (`returnedFocus`) opens the popup from a keyboard-focused trigger, presses Escape, and reads focus back on the trigger, `:focus-visible`, with the full ring (2px solid, 2px outside, ≥3:1, never transitioned) in four projects.
- **What doesn't** — none known.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: `--fui-overlay-*` measurement targets replace the raw panel widths (UIR-D15), `--fui-raw-space-*` and `$fui-stroke-hairline` replace bare `0`/`1px`, and the contract example snippets moved to the ruled Button vocabulary (UIR-D31).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- `.close` was radius-sm with tertiary ink while Dialog/Drawer used radius-md and secondary ink; all three now take `overlay.close` (l2 radius, secondary ink, hover bg). Surface is `overlay.anchored-surface` → `overlay.surface` (`--fui-radius-l1`).

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Outside presses** — a press that began before the popover opened no longer closes it on release.
- **Keyboard close** — after `Escape` the trigger shows its focus ring again in Safari and Firefox. Upstream change to the shared popup focus return; probed on Menu, not on this component.
- **Popup origin** — the default `align="center"` is unchanged. Callers that pass `align="start"`/`"end"` now scale from that edge (see Menu).
- **Outside clicks under Firefox touch emulation (a probe artefact, not a defect)** — an outside press now counts only when its `pointerdown` arrived while the popup was open. Playwright's Firefox with `hasTouch` sends a mouse click with no pointer events at all, so there an outside mouse click stopped closing the popover (it closed at 1.6.0). Real browsers fire `pointerdown` for every primary press: Chromium and WebKit with touch emulation still close it, and so does a Firefox tap, which carries pointer events. Browser lanes that press outside a popup run touch in Chromium (the state harness does) or use `page.touchscreen`. Still owed: one check on a real touchscreen laptop in Firefox.
- **Doesn't work yet (same at 1.6.0; overlays sweep)** — the popup sits 8px from its trigger and 5px from the left viewport edge at 390px wide; the default look wants offset 4 and collision padding 8. The trigger's returning focus ring is 1px accent at 24% alpha plus a `box-shadow` halo, below rule Library-Floor.

## 2026-10-03 — popups keep their theme scope

- **What changed** — the portal spreads `useThemePortalProps()`, so a popup opened inside a nested `Theme` renders with that scope's `data-fui-theme`, mode, inputs and chrome instead of the page's. Outside a scope it adds nothing. Proved here by the jsdom suite (`Theme.test.tsx` opens a real Popover in a dark scope). The states portal proof uses a Tooltip because WebKit axe flags the focus guards inside an open Popover portal (`role="button"`, no name), a pre-existing defect for the overlays sweep.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — still popup: no scale, no travel (UIR-D132); `sideOffset` default 8 → 4 (`POPUP_OFFSET_PX`); `collisionPadding` 8. New `Popover.states.tsx` (`@family:overlays`): populated, overflow and lifecycleDismiss.
- **What works** — `MotionRecipe.states.tsx` (`@tag:recipe-motion`) checks the popup is fully drawn in the first settled frame (opacity 1, no scale, no transform, nothing animating), sits 4px from its anchor, and is gone within 3 frames of closing, in Chromium, WebKit, Firefox and the touch project. The lint rule `fui/motion/popup-roles` holds the module to the popup motion roles. `MotionRecipe` also checks a popover pinned to the right edge stays 8px inside the viewport.
- **What doesn't** — `empty`, `loading` and `error` are argued n/a in the fixture header: the content is the consumer's.
- **Candidates** — none from this pass.

## 2026-10-03 — v4 surface and token pass

- **Floating surface** — `overlay.surface` is shadow only: the raised plane, `--fui-shadow-popup` and the popup radius (overlay radius for a modal or side panel), no border and no footer band. Forced colours keep a CanvasText hairline.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — Glass v4 Overlays (PR4)

- **What changed** — `size` is `sm | md` (`lg` cut: a large panel is a Dialog or Drawer); `sideOffset` cut (one popup offset for the family); `positionerClassName` cut; `asChild` on Trigger/Close is Base UI `render` (the local native-button guess moved to the shared `utils/native-button`). `arrow` stays, default off, now fill only (no stroke) and seated half outside the edge per side. Footer sits on the raised plane with no divider. Title is 12/550 (body-compact at the strong weight) instead of the 14/600 shared anchored title.
- **What works** — unit tests (13) green, including a link trigger through `render`, `size="sm"`, and Close through `render`.
- **What doesn't** — not browser-checked in this lane; the arrow's seat is computed from the arrow-size token and not measured.
- **Candidates** — move DatePicker and ColorPicker popups onto Popover (their own lanes); the shared `overlay.anchored-title` recipe should become 12/550 so this module can drop its override.
