# Field — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — `Field.Label` reads the shared `field.label` recipe (body-compact, semibold, ink 1), as ColorPicker and Slider do. A disabled field dims the label only, also when the control alone is disabled; description and error keep full ink (axe flags dimmed description text). The root shows the not-allowed cursor when disabled. The flat part exports are cut. Stories carry a `children` arg so they typecheck.
- **What works** — the disabled fixture (label dims, description and root at 1) and unit tests pass.
- **What doesn't** — not browser-checked in this lane.

## 2026-10-03 — fields on Glass

- **What changed** — Field is the one owner of a control's label, description and error: Input, Textarea, Select, Combobox and NumberField carry no label or message props (UIR-D75). The label is the compact body role, semibold, ink 1; the required mark is ink 3. Field.Error is an alert with a warning icon before the words, so a failure never relies on colour alone, and with no children it shows the browser's validation message. The `size` prop is cut: the control owns its height.
- **What works** — unit tests cover label and description wiring, the required mark, the error icon and alert role, and the browser message through Form. `Field.states.tsx` (new, `@family:text-fields`) renders populated, error (on a Select), overflow and disabled.
- **What doesn't** — not browser-checked; the states lane was not run for this change.
- **Candidates** — the shared field recipe could carry the label role and the error icon slot, so other controls that frame themselves read the same.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the text-entry element sets `font: inherit` and takes 16px typed text under a coarse pointer (UIR-D120) through a zero-specificity `:where(.control)` rule, so a composed control's own size role still wins.
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 Wave 0

- Label disabled opacity reads `--fui-opacity-disabled` (stylesheet now `@use`s tokens/variables). No vocabulary change.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Disabled + invalid** — `invalid` now survives `disabled`: every part keeps `data-invalid`, and the control still gets no `aria-invalid` (it is disabled). Styles keyed on `[data-invalid]` therefore show on disabled fields. Locked by `keeps data-invalid on a disabled field without announcing aria-invalid`.
- **Validation lifecycle (upstream)** — validates once on `Enter` inside a Form; neutral validity while async validation runs; controlled value changes sync field state; custom validity owned by the field.
- **Not checked** — whether `Field.Error` without `match` now renders on a disabled, invalid field.
- **Disabled** — only the label dims; the control dims on its own box, and the description and error keep full ink, since they say why the field is shut (a dimmed description failed axe colour contrast in the states lane). The root keeps the not-allowed cursor. `lifecycleDisabled` checks all three.
