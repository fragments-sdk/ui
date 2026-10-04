# Menu — UI notes

## 2026-10-04 — maxVisibleItems

- **What changed** — `Menu.Content` takes `maxVisibleItems`, resolved by `resolvePopupViewportRows` (`recipes/popup.ts`) into an inline `--fui-popup-viewport-rows` on the popup, exactly as `Select.Content` and `Combobox.Content` do: n rows plus half of the next as the scroll hint. Omitted (or non-positive / non-finite), the popup keeps the recipe default of 4.5 rows. A consumer `style` merges after it. Consumers no longer need to set `--fui-popup-viewport-rows` in CSS.
- **What works** — unit tests pin the inline `8.5` for `maxVisibleItems={8}`, no inline property when omitted, the 4.5 fallback for `0`, and a merged consumer style. `Menu.states.tsx` `overflowMaxVisibleItems` (eight rows, cap eight) passes in chromium and webkit: all eight rows show with no scroll (256px in 256px; the default cap shows 156px of 256px).
- **Candidates** — a "no cap" value if a menu ever needs to grow to the viewport (the resolver turns non-finite values back into the default today); past a dozen rows the guideline still points at Command.

## 2026-10-03 — Glass v4 review fixes

- **What changed** — `loading` on `Menu.Content`: the popup is `aria-busy` at once, and after a second a disabled spinner row (“Loading…”) shows below the rows it already has. Story triggers are Buttons through `render`, copy is sentence case, and the virtual-anchor story has a visible trigger.
- **What works** — a `loading` fixture checks the busy state, no row in the first second, the row after it, and that the row is not dimmed; unit tests pass.
- **What doesn't** — the fixture has not run in the browser in this lane.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — pick-list rows come from `recipes/_popup.scss`: the highlighted row is the hover tint painted as a background image over the row, so a selected row keeps its `--fui-control-selected-bg` wash and gains the 1px inset `--fui-control-selected-border` ring (UIR-D126); a roving row's keyboard focus is that highlight (`focus.highlight-row`), the popup is the focus boundary (UIR-D125). The positioner's `outline: none` is gone (it never takes focus). After Escape closes the popup, the trigger that gets focus back draws the one ring through the globals `:focus-visible` rule (UIR-D125): this resolves the 04 browser-pass carry-in (a 1px ring at 24% plus a halo).
- **What works** — `Listbox.states.tsx` and `SelectionRecipe.states.tsx` (`@tag:recipe-selection`) read the wash, the 1px ring and the hover tint over a selected row in four projects; `FocusRecipe.states.tsx` (`stackedRows`) reads a 44px row under a coarse pointer. `FocusRecipe.states.tsx` (`returnedFocus`) opens the popup from a keyboard-focused trigger, presses Escape, and reads focus back on the trigger, `:focus-visible`, with the full ring (2px solid, 2px outside, ≥3:1, never transitioned) in four projects.
- **What doesn't** — Menu has no state fixture of its own; a checked item's marking is not read in a browser.
- **Candidates** — a Menu fixture with checkbox and radio items.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); pick-list rows are `max(pitch, --fui-hit-area)`, 44px under a coarse pointer (48px before); under forced colours the highlighted row is Highlight / HighlightText, the selected row keeps an inset CanvasText outline, and separators are CanvasText (UIR-D121).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## What works

- Enter/exit motion restored (2026-08-21): fade + scale(0.95) from
  `--transform-origin`, `--fui-transition-fast`, matching Popover/Select. The
  previous `opacity: 1; transform: none` zero-block (from the geometry
  standardization PR) had no documented rationale and left Menu the only
  static overlay in the kit. Verified live on docs /components/menu — enter,
  settle, and exit fade all render; submenu viewport height transition
  unaffected. Reduced-motion guard already covers `.viewport`; popup
  transitions are opacity/transform only.
- Rows are `user-select: none` via the popup `row` recipe — rapid pointer
  travel can't start a text selection.

## What to watch

- FUI2015 resolved (2026-08-21): `--fui-menu-min-inline` replaced with
  `layout.measure("menu-min")` — `menu-min: 192px` was added to the
  layoutMeasure catalog (measurements.json + generator hash update, a
  contract-vocabulary addition). Submenu caret vars replaced with
  `--fui-raw-space-4/6`. No consumer overrode the removed hooks.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — none, only tokens/mixins: `--fui-overlay-layer-anchored`, `--fui-popup-indicator-box` and the caret sizes gained dual fallbacks through `measurements.raw-space()`, and the contract example snippets moved to the ruled Button vocabulary (UIR-D31).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- No local change; `popup.container` now renders `--fui-radius-l1` and rows round to l2 on highlight. Checked WithGroups open in Storybook.

## 2026-09-08 — interaction ladder

- **What changed** — highlighted rows read `--fui-bg-hover`, which is now the ink at 7% (light) / 9% (dark) instead of an opaque dark hex, so the same step reads on an elevated menu and on the page. Selected rows read `--fui-control-selected-bg` (12% / 14%) through the field hook; pressed is `--fui-bg-active` (14% / 16%). `.itemDanger[data-highlighted]` paints `--fui-color-danger-wash`.
- **Why** — Conan: sidebar hover/active and menu hover/active did not match. They were two derivations (dark hover was `#2a2723`, invisible on `#262421` menus). Now one ladder: hover 7 < selected 12 < pressed 14 < selected+hover 16, dark +2.
- **What was browser-verified** — WithGroups open, second row hovered, dark: the hover wash is visible on the elevated panel (was invisible); computed hover 9% / selected 14% / active 16%, identical to the Sidebar story.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Popup origin** — with `align="start"` the scale-in now grows from the aligned edge, not the trigger's centre: `--transform-origin` went from `29.86px -4px` to `0% -4px` (headless Chromium, WebKit and Firefox against static Storybook builds at 1.6.0 and 1.8.0). Only the enter/exit motion changes; the settled frame is pixel-identical.
- **Keyboard close** — after `Escape` the trigger shows its focus ring again in Safari and Firefox (`:focus-visible` was false there at 1.6.0; Chromium already matched).
- **Group labels** — `Menu.GroupLabel` is now `aria-hidden`; the group keeps its name through `aria-labelledby`. Locked by `names the group from its label and hides the label from the accessibility tree`.
- **Also upstream, no local change** — an initially open submenu plays its enter transition; `aria-orientation` moved onto the role owner; the root's `disabled` reaches items (Menu exposes no root `disabled`).
- **Doesn't work yet (same at 1.6.0; focus recipe)** — the ring that returns after `Escape` is the existing trigger ring: 1px accent at 24% alpha plus a `box-shadow` halo, barely visible. Rule Library-Floor wants 2px at 3:1 and no shadow ring.

## 2026-10-03 — popups keep their theme scope

- **What changed** — the portal spreads `useThemePortalProps()`, so a popup opened inside a nested `Theme` renders with that scope's `data-fui-theme`, mode, inputs and chrome instead of the page's. Outside a scope it adds nothing.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — still popup: `popup.motion` replaces the fade plus `scale(0.95)` (0ms in and out, UIR-D132); the viewport no longer animates `block-size` when a submenu changes the height; the positioner takes `collisionPadding={POPUP_COLLISION_PADDING_PX}` (8). New `Menu.states.tsx` (`@family:overlays`): populated, overflow (seven items and a long label in a scrolling viewport) and lifecycleDismiss (`Escape` closes and focus returns to the trigger).
- **What works** — `MotionRecipe.states.tsx` (`@tag:recipe-motion`) checks the popup is fully drawn in the first settled frame (opacity 1, no scale, no transform, nothing animating), sits 4px from its anchor, and is gone within 3 frames of closing, in Chromium, WebKit, Firefox and the touch project. The lint rule `fui/motion/popup-roles` holds the module to the popup motion roles.
- **What doesn't** — no loading row: a menu whose items arrive late has nothing to show, so `loading` stays missing in coverage. The overflow fixture focuses the first item before axe runs, because a scrolling viewport with no focused item fails `scrollable-region-focusable`; a mouse-opened menu that overflows still has that gap.
- **Candidates** — a loading row (skeleton lines in the item geometry, UIR-D134) for the overlays sweep; make the scrolling viewport reachable by keyboard without a focused item.

## 2026-10-03 — v4 surface and token pass

- **Floating surface** — `overlay.surface` is shadow only: the raised plane, `--fui-shadow-popup` and the popup radius (overlay radius for a modal or side panel), no border and no footer band. Forced colours keep a CanvasText hairline.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — Glass v4 Overlays (PR4)

- **What changed** — one checked-state API: `Menu.Item checked` cut; a chosen state is `Menu.CheckboxItem` or `Menu.RadioItem`, which carry `aria-checked`. Their check is the primitive's indicator part (CheckboxItem no longer keeps a private copy of its state), drawn in the selection colour (`--fui-control-selected-border`) with no fill; radio rows show the same check, not a dot. Once any row is checkable every row (and group label) reserves the indicator column. `Menu.Item danger` → `tone="danger"`: danger ink on label and icon, the neutral hover tint on highlight (no danger wash). `Menu.Content sideOffset` cut; `Menu.Trigger asChild` → `render`. Shortcuts are a `<kbd>` in the caption role with tabular figures, ink 3, and CheckboxItem/RadioItem take `shortcut` too. The submenu caret is a chevron at icon-sm instead of a CSS triangle.
- **What works** — unit tests (32) green: radio check + aria-checked, uncontrolled checkbox toggles, column-reserve marker, danger ink + kbd, render trigger, submenu keyboard and hover paths.
- **What doesn't** — not browser-checked in this lane; the column reserve relies on `:has()`.
- **Candidates** — a loading row for menus whose items fetch (one "Loading…" row after 1s, aria-busy); a shared `Kbd` component with Tooltip and Command.

## 2026-10-04 — returned-focus fixture composes the documented trigger

- **What changed** — `FocusRecipe.states.tsx` (`returnedFocus`) rendered a bare trigger, which is an unstyled native button. In dark, axe failed its contrast on Linux WebKit only (macOS WebKit passes). The trigger now takes `render={<Button variant="soft" />}`, as the metadata says to; the component is unchanged.
