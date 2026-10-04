# ToggleGroup — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the flat part exports (ToggleGroupRoot and ToggleGroupItem) are cut, so the compound is the one form (`ToggleGroup.Item`), and `ToggleGroup.Root` is the compound itself (MIGRATION-v4).
- **What works** — `src/compound-exports.test.ts` fails if a cut name ships again or `.Root` drifts from the compound.
- **What doesn't** — nothing new.
- **Candidates** — none new.

## 2026-10-03 — actions on Glass (v4)

- **What changed** — one look: the segmented control (band track, lifted thumb on the pressed segment, UIR-D143). `variant` (soft/ghost/outline) and `gap` are cut. Built on the headless toggle group: the root is `role="group"` and each item a toggle button with `aria-pressed` (was a radiogroup of radios). `onChange` and `selectionMode` are cut; `onValueChange` is the one callback, typed `string` in single mode and `string[]` with the new `multiple`. Single mode keeps a chosen segment chosen when pressed again. New `size="xs"` (the micro track) and `fullWidth`; the size follows a `ComponentDefaultsProvider`, xs included. Root and Item forward refs.
- **Colour mode** — the cut ThemeToggle is now a composition: a ToggleGroup wired to `useTheme`, System first (`ColourMode` story, contract example, populated fixture).
- **What works** — 8 unit tests (group role, aria-pressed, single and multiple callbacks, the no-unpress rule, disabled items, xs from a provider, fullWidth, the one-look SCSS pins, axe). The states fixture covers every size, the colour-mode composition, multiple, overflow (long label, fullWidth) and lifecycle (hover, focus, disabled item, disabled group).
- **What doesn't** — a fullWidth segment clips a long label instead of truncating it (the label is a bare text node, so there is no ellipsis). Not browser-checked in this pass.
- **Candidates** — wrap item labels in a span so fullWidth segments can truncate; an icon-only xs segment for inspector rails.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the selected segment is the thumb through `segmented-selection`: `--fui-bg-primary`, a hairline `--fui-border` ring and `--fui-shadow-sm`, on the band track (was the selection wash and ring) (UIR-D126).
- **What works** — `SelectionRecipe.states.tsx` reads the surface fill, the ring plus shadow and the band track on a soft group; `ToggleGroup.states.tsx` (new, `@family:choice`) renders soft, ghost and outline, overflow and lifecycle.
- **What doesn't** — ghost and outline groups have no band track, so their thumb sits on the page surface.
- **Candidates** — decide whether ghost and outline groups keep the thumb or take their own marking.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 Wave 0

- `variant`: `default`→`soft`, `pills`→`ghost`, `outline`/`outlined`→`outline`; default is `soft`. `.default`/`.pills` classes are gone.
- Selected item styling is `@include segmented-selection;` in all three variants; the `--fui-toggle-group-selected-*` hooks are no longer read.
- Disabled rides `@include disabled-state;`; `gap: 0` reads `--fui-raw-space-0`; `--_fui-segmented-track` falls back to `segmented.track("md")`.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-form-group-bg`, `--fui-form-group-border`, `--fui-radius-lg`, `--fui-radius-md`, `--fui-transition-fast`. Corners now read the radius roles (`control`, `segment`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — motion, type and state recipes

- **What changed** — `soft` is the shared segmented control (`segmented.track($size)` + `segment(".selected")`, UIR-D143), the same look as soft Tabs; segments move in the micro role and hover only where the pointer can hover. The `--fui-form-group-*` track hooks are no longer read by soft. Ghost and outline are unchanged.
- **What works** — module test pins the track and segment includes; `SelectionRecipe.states.tsx` compares it with soft Tabs.
- **What doesn't** — ghost and outline still carry their own track and the `segmented-selection` thumb mixin; not browser-checked here.
- **Candidates** — cut ghost and outline (the Actions/Choice batch) so soft is the only segmented look.
