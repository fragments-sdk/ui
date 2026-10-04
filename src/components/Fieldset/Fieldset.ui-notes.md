# Fieldset — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the flat part exports (`FieldsetRoot`, `FieldsetLegend`, `FieldsetDescription`) are cut. Stories carry a `children` arg so they typecheck.
- **What works** — unit tests pass.

## 2026-10-03 — fields on Glass

- **What changed** — the group sits on the surface plane at the surface radius, with 12 padding, a 12 row gap and 12 under the legend. The legend is the compact body role, semibold, ink 1; the description is the caption role, ink 2. Fieldset.Description is now linked to the group through aria-describedby, merged with any the author passes.
- **What works** — unit tests cover the describedby link, the merge and its removal when the description goes. `Fieldset.states.tsx` renders populated, disabled, error and overflow with Field-wrapped controls.
- **What doesn't** — not browser-checked; a group-level error message is not offered yet.
- **Candidates** — a group message for errors that belong to the set, not one field.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — a disabled Fieldset dims through the shared `disabled-state` mixin, and everything inside reads `--_fui-disabled-opacity: 1`, so a disabled control inside paints at 0.45 once, not 0.2 (UIR-D123).
- **What works** — `ActionRecipe.states.tsx` (`disabledOnce`) reads 0.45 on the fieldset, 1 on the nested button and an effective 0.45 in four projects; `Fieldset.states.tsx` (new, `@family:text-fields`) shows populated, disabled and error.
- **What doesn't** — a consumer wrapper that sets its own `opacity` still compounds with the library dim.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 Wave 0

- Zero gap/margin/padding read `--fui-raw-space-0`; disabled opacity reads `--fui-opacity-disabled`. No vocabulary change.
