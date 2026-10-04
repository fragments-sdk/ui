# Alert — UI notes

## 2026-10-03 — Glass v4: re-inked on the tint

- **What changed** — the tone now spends colour on three things only: the tint fill, the icon and a semibold title in tone ink. Body copy is ink 1 and there is no edge (the fill marks the plane). The icon is a phosphor glyph (info, warning, warning-circle) one line tall, with no disc. Padding is the compact inset (12). The corner is the surface radius standalone and the nested radius inside a Card, which publishes `--_fui-nested-radius`. `Alert.Action` is a soft small Button and `Alert.Close` a ghost xs (24px) IconButton labelled "Dismiss alert". Actions wrap. `open` and `onOpenChange` make visibility controllable. `aria-labelledby` and `aria-describedby` are set only when a Title or Content renders. Cut: `tone="success"`, `emphasis`, and the flat exports (`AlertRoot`, `AlertIcon` and the rest, plus `useAlertContext`).
- **What works** — 16 unit tests, including controlled open, the aria-id fix and type-level checks for the cut props. The states fixture checks the tint fill, the missing edge, ink-1 body copy, the tone-ink icon and the missing disc. The Sass compiles.
- **What doesn't** — not browser-checked; the states and contrast lanes were not run in this batch. Close is the 24px xs IconButton; it borrows the extra height over the first line from the inset so the alert does not grow.
- **Candidates** — a 24px IconButton step for Close; a `feedback.alert` recipe to share this paint with Toast's inline variant.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — the `severity` prop is deleted; colour, icon and live-region role are now `tone` (`info` · `success` · `warning` · `danger`, `error` → `danger`). The `AlertSeverity` type is `AlertTone`. The hand-rolled `prefers-contrast` block is `@include high-contrast-outline`.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Actions + Feedback + Display category pass.

## 2026-09-08 — one tone ramp, one recipe

- **What changed** — the private `_tone` mixin and `--_alert-*` vars are deleted; `.alert` includes `tone.channels("info")` and each `.tone*` class re-includes the recipe. The panel paints `--_fui-tone-wash` (10% light / 16% dark), hairline `--_fui-tone-line`, ink `--_fui-tone-ink`; the icon disc is the ink. `emphasis="surface"` is unchanged.
- **Why** — Alert, Toast, Card, Message and Badge each derived the tone separately (`-bg` tokens for panels, private mixes for pills). One ramp, one place to tune.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — dismissal goes through `useDismiss` (UIR-D135): the alert leaves in the frame it is dismissed and, when focus was on its close button, focus moves to the next focusable item first (else the one before). New `Alert.states.tsx` (`@family:feedback`): populated (three tones), error (danger with an action), overflow and lifecycleDismiss.
- **What works** — lifecycleDismiss checks the alert is gone and focus sits on the next button, not on the body, in all four projects; unit tests cover the before-fallback.
- **What doesn't** — `empty` and `loading` are argued n/a.
- **Candidates** — none from this pass.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-card-radius`, `--fui-radius-l3`, `--fui-radius-lg`. Corners now read the radius roles (`control`, `surface`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
