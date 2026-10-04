# Toast — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the title (h2) and description (p) drop their browser margins, so the tone glyph centres on the title line.
- **What works** — the live fixture has a description and checks the glyph and title centres sit within 1px.
- **What doesn't** — the fixture has not run in the browser in this lane.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` is deleted in favour of `tone` (`neutral` · `success` · `warning` · `danger` · `info`; `default` → `neutral`, `error` → `danger`). `ToastVariant` is `ToastTone`, and `useToast().error` sets `tone="danger"`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Actions + Feedback + Display category pass.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- Z-index is `--fui-overlay-layer-toast` (55, between anchored 52 and tooltip 60) instead of `calc(2 * --fui-header-z-index)`; radius is `--fui-radius-l1`. Tone wash/hairline/ink stay local because they are tone-driven.

## 2026-09-08 — one tone ramp, one recipe

- **What changed** — `.toast` publishes the neutral channels itself (`--_fui-tone-wash` = elevated surface, `-line` = border, `-ink` = primary) and each `.tone*` class includes `tone.channels()` and drops the description to the tone ink. The `--_toast-tint/-line/-ink` vars are gone; only `--_toast-ink-soft` stays (neutral description ink).

## 2026-10-03 — role tokens

- **What changed** — the toast reads `--fui-shadow-popup` (was `--fui-shadow-md`, UIR-D117). Its corner reads `--fui-radius-l1`, which now aliases `--fui-radius-surface` (12px, was 8px, UIR-D115).

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — the `toastEnter` keyframes (rise plus `scale(0.95)`) are gone; a toast appears in place (UIR-D133).
- **What works** — nothing animates on entry, so reduced motion needs no override here.
- **What doesn't** — no `Toast.states.tsx`: the toast lane (`@family:toast`) is still planned.
- **Candidates** — a toast fixture: entry, stacking, dismissal with focus return.

## 2026-10-03 — v4 surface and token pass

- **Floating surface** — `overlay.surface` is shadow only: the raised plane, `--fui-shadow-popup` and the popup radius (overlay radius for a modal or side panel), no border and no footer band. Forced colours keep a CanvasText hairline.
- **Token reads** — the legacy reads are gone: `--fui-radius-l1`. Corners now read the radius roles (`popup`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — Glass v4 Overlays (PR4): rebuilt on the toast primitive

- **What changed** — live toasts render on `@base-ui/react/toast` (Provider, Viewport, Root, Title, Description); the library keeps its own queue in front of it so at most three are on screen and the rest wait in order (the primitive's limit hides the oldest while its timer runs, which loses messages). The plane is always raised on the popup shadow with no edge and no tone fill; the tone is only the icon's ink. Title 12/550 ink 1, body 12 ink 2, pad 8 (12 at the start), gap 10, min the small popover width. Tones `neutral · success · warning · danger` (`info` merged into neutral). Positions `bottom-end · bottom-center · top-center`. Duration defaults to 5000 and anything under is raised to 5000; 0 persists. Only danger announces urgently. New slots: `action.undo` (undo key hint, Mod+Z runs it outside text fields), `busy` (spinner, "N of M", a 2px progress line, Stop, no timer), `promise()` and `update()` replace a toast in place. Toast buttons keep focus where it was on a press. Action is a ghost small Button and closes the toast.
- **What works** — 18 unit tests: floor, persist, queue order and admission, replace by id, urgent announce for danger only, undo key and the text-field guard, busy count and progress, promise settle, tone helpers, position, static preview, axe. Pause on hover, focus and window blur comes from the primitive.
- **What doesn't** — not browser-checked; `Toast.states.tsx` is new and the states lane was not run. The ⌘ glyph vs "Ctrl Z" hint reads the platform string once per toast.
- **Candidates** — a shared Kbd component for the undo hint; stacking (deck) on hover if three tall toasts crowd a small screen.
- **States fixture** — the surface checks are labelled by ordinal and tone, since two neutral toasts share a tone and a repeated label is a repeated React key; the live check waits two frames for the provider's portal.

## 2026-10-04 — the glyph on the title's line

- **What changed** — the content column has a 2px block inset and the icon did not, so the glyph sat 2px above the title's line (static and live toasts alike). The icon now drops by the same 2px.
- **What works** — the `lifecycleLive` fixture's line check passes in all four projects.
