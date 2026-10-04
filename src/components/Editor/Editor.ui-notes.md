# Editor — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — a disabled Editor shows the not-allowed cursor every disabled field shows (it overrode it to the default arrow); scroll and selection still work. The flat part exports (`EditorRoot`, `EditorToolbar`, `EditorToolbarGroup`, `EditorToolbarButton`, `EditorStatusIndicator`, `EditorContentArea`, `EditorStatusBar`) are cut from the root and `./editor` entries; the dot parts are the one form (MIGRATION-v4). The controllable-state hook moved to the shared util Sidebar and Prompt use, and each lint disable now carries its reason. The label already reads the field label role (12/600) at this head.
- **What works** — `Editor.test.tsx` checks the compiled disabled cursor; the style lane holds no baseline entry for Editor.
- **What doesn't** — the browser lanes were not re-run this pass.
- **Candidates** — none new.

## 2026-10-03 — Glass: the states harness pass

- **What changed** — the rich textbox carries `aria-disabled="true"` while disabled (the markdown textarea already did); the text stays selectable.
- **What works** — `Editor.test.tsx` asserts it in both modes; `lifecycleDisabled` passes axe colour contrast, which skips disabled text.

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — one band: the field fill, the strong field edge and the surface corner; the toolbar and status bar are transparent with hairline dividers (the form-group mix and its two translucent planes are gone). The field rings when the writing area has focus (`:has(.content :focus)`), hovers its edge like Input, takes the danger edge when `invalid`, a dashed edge when read-only, and dims without `pointer-events: none` when disabled, so text stays selectable (the textarea is read-only + `aria-disabled`, not `disabled`). Toolbar buttons are ghost IconButtons (sm, 28) with `pressed`, glyphs through Icon; the toolbar has one tab stop with arrow, Home and End keys and hides while read-only. Prose is 12/18 body-compact, one heading step at 15, links in the link ink. Status reads Saving…, Saved, Couldn’t save in 11 ink 3 tabular; counts are "12 words", "280 characters", and past a limit "292 / 280, 12 over". `label`, `helperText`, `invalid`, `errorMessage` added and wired to the text box; `aria-label` / `aria-labelledby` / `aria-describedby` on the root reach the text box.
- **Cuts** — `size` → `rows` (lines); `heading1` / `heading2` / `heading3` → `heading`; `toolbarIcons` and its render-state types; `Editor.Separator` / `EditorSeparator` → the Separator component (vertical, control length). The status bar is off by default unless `maxLength` or `onAutoSave` is set. `Editor.Root` added.
- **What works** — 23 component tests (label naming, invalid wiring, roving keys, read-only toolbar, sentence-case status, over-limit copy, type cuts) and the vocabulary gate (the two status example rows still match).
- **What doesn't** — the pressed wash and ring come from IconButton; if IconButton still paints its old pressed surface, the toolbar inherits it. Not browser-checked.
- **Candidates** — a link popover in place of `window.prompt`.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the editable area delegates its ring to the editor frame (`focus.delegated`), which rings through `:focus-within`; the local `outline: none` rules are gone or go through the focus recipe (UIR-D125).
- **What works** — `lint:styles` passes: only the focus recipe removes an outline.
- **What doesn't** — the frame ring is not read by a state fixture.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the text-entry element sets `font: inherit` and takes 16px typed text under a coarse pointer (UIR-D120); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120); under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 Wave 0

- `--fui-editor-min-block-sm/md/lg` (single reader) inlined via `_min-block($size)` = 3/5/10 rows × `--fui-raw-space-40`.
- Disabled rides `@include disabled-state;` (+ pointer-events).
- Still open: a real editor min-block token (or a layout measure role) would replace the row math.

## 2026-09-04 Wave 1 — field chrome parity (UIR-D38)

- Container focus-within is `field.focus-state` (was the solid button ring). Toolbar button hover ground is `--fui-bg-hover`.
- Not browser-verified: synthetic clicks do not focus the ProseMirror content in this harness; the rule is one line.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-field-selection-border`, `--fui-form-group-bg`, `--fui-form-group-border`, `--fui-radius-sm`. Corners now read the radius roles (`control`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
