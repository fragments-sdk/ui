# Prompt — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — while working, the field's own edge turns the working colour and is the one edge; the recipe's inner line is turned off so no second edge sits inside it.
- **What works** — Prompt unit tests pass.
- **What doesn't** — not browser-checked in this lane.

## 2026-10-03 — fields on Glass

- **What changed** — PromptSelect no longer asks Select for the cut ghost variant: Prompt draws its quiet trigger in its own module (transparent edge and fill, ink 2, hover tint and ink 1, press tint).
- **What works** — the Prompt unit tests pass.
- **What doesn't** — not browser-checked.
- **Candidates** — rebuild PromptSelect on Menu and Button so Prompt does not restyle Select.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the selected mode takes the thumb through `segmented-selection`: `--fui-bg-primary`, a hairline `--fui-border` ring and `--fui-shadow-sm` on the band track (was the selection wash and ring) (UIR-D126). The textarea delegates its ring to the prompt frame (`focus.delegated`).
- **What works** — the thumb is read in a browser on ToggleGroup in `SelectionRecipe.states.tsx`; Prompt shares the mixin.
- **What doesn't** — Prompt has no state fixture of its own.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the text-entry element sets `font: inherit` and takes 16px typed text under a coarse pointer (UIR-D120); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120); under forced colours the field ring is an outline in `Highlight`, since the mixed ring colour would be repainted (UIR-D121).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — units and scales

- **What changed** — Padding and gaps read `--fui-raw-space-*` (7 → 6, 14 → 12, 21 → 20px); hairlines read `--fui-stroke-hairline`. `Prompt.test.tsx` now fails on any `--fui-space-` or `--fui-font-size-` read.
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Not browser-checked with an attachment row.
- **Candidates** — None.

## 2026-10-03 — IME-safe Enter (3.1.3)

- **What changed** — the Enter that commits an IME candidate (`isComposing`, or `keyCode` 229 after `compositionend` in Safari) no longer submits; the next Enter does. Goes through the shared `isComposingEnter` helper (`src/utils/isComposingEnter.ts`).
- **What works** — `Prompt.test.tsx` simulates composition with both signals: no submit and no `preventDefault` on the committing Enter, then exactly one submit with the text. Headless Chromium, WebKit and Firefox (2026-10-03 pass): the committing Enter, in Chrome/Firefox order (`isComposing`) and in Safari order (229 after `compositionend`), neither submits nor is default-prevented; the next Enter submits the committed text once. In Chromium a composition through the engine's own input-method path (kana, then the candidate, then commit) gives the same result. Every case fails with the guard stubbed out.
- **What doesn't** — not run against a real OS input method (for example macOS Japanese) or a real phone keyboard; both need a person. Coarse-pointer emulation confirms a 229 Enter leaves submit to the Submit button and a key-13 Enter submits; what a real soft keyboard reports for Enter is still unknown.
- **Candidates** — the composition cases as fixtures in the browser render-state harness, including a coarse-pointer run.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — the positioning values left `variant` for a new `placement` axis (`inline` · `fixed` · `sticky`; `default` → `inline`) and the deleted `appearance` axis became `variant` (`panel` → `outline`, `seamless` → `ghost`) — UIR-D16. Types: `PromptVariant` → `PromptPlacement`, `PromptAppearance` → `PromptVariant`. The mode row reads `segmented-selection`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 2 AI surfaces (the eight primitives + AI blocks).

## 2026-10-03 — role tokens

- **What changed** — both floating layers read `--fui-shadow-popup` (were `--fui-shadow-lg`, UIR-D117).

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — the focus beam holds still under reduced motion (its own block), now that globals no longer cut every animation (UIR-D140); focus still lights it.
- **What works** — `fui/media-queries/reduced-motion` passes for the beam without a baseline entry.
- **What doesn't** — no browser check of the still beam.
- **Candidates** — a reduced-motion state in a Prompt fixture.

## 2026-10-03 — v4 surface and token pass

- **What changed** — The composer is a field: `--fui-field-bg` with the `--fui-field-border` hairline.
- **Token reads** — the legacy reads are gone: `--fui-bg-tertiary`, `--fui-radius-lg`, `--fui-radius-md`, `--fui-radius-sm`, `--fui-radius-xl`, `--fui-transition-fast`, `--fui-transition-normal`, `surface-elevated`. Corners now read the radius roles (`control`, `indicator`, `surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — AI surface on Glass

- **What changed** — one field: the field band, the field hairline, the surface corner, one focus ring on the frame for the text area, and the field hover, invalid, read-only and disabled states. The text area grows with `field-sizing` (a measured fallback where unsupported) between `minRows` and `maxRows`, stays editable while `working`, and Enter waits while `pending` or `working`. The toolbar sits on the same plane (no footer band, no rule). `Prompt.Submit` is the one accent action at h32 with the action recipes; `pending` shows the recipe spinner after a second; with `working` and `onStop` it becomes a neutral Stop. A `menu` on Submit opens only by right-click, ArrowDown, Shift+F10 or a long press, so a plain click always sends. `Prompt.Picker` (a Menu with radio items, name read before value) replaces `Prompt.Select` and `Prompt.ModeButton`. Drop shows words ("Drop to attach") over the field with the selection ring. New: `readOnly`, `invalid` + `errorMessage`, `working` + `onStop`, `onValueChange`. Cut: `variant`, `placement`, `loading` (→ `pending`), `autoResize` (always on), `onChange(value)` (→ `onValueChange`), `Prompt.Tabs`/`Tab`, `Prompt.ActionButton`, `Prompt.ModeButton`, `Prompt.Select`, `Prompt.Usage`.
- **What works** — 17 unit tests; states: populated, empty, loading, error, overflow, lifecycle.
- **What doesn't** — not browser-checked in this lane. Mention completions in the text area are not built (deferred).
- **Candidates** — `@` mention and `/` command completions on Prompt.Textarea; a token meter as an Info recipe.
- **States fixture** — the placeholder check resolves ink 3 beside the text area (a probe inside a replaced element reads the light half of `light-dark()`), and the send check runs once per host, so a development remount cannot send twice.
- **Coarse pointer** — the text area takes 16px typed text under a coarse pointer again (`field.coarse-typed-text`; the rewrite had dropped it). Where WebKit cannot report a `::placeholder` style, the fixture reads the authored rule instead.
