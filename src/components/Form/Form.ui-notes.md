# Form — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — `Form.Root` is cut. The server-errors story renders `Field.Error`; copy is sentence case. Stories carry a `children` arg so they typecheck.
- **What works** — a `lifecycle` fixture submits, holds the pending state (aria-busy, controls locked), then shows the server error as an alert with its icon, marks the input invalid, links it through `aria-describedby` and unlocks.
- **What doesn't** — the fixture has not run in the browser in this lane.

## 2026-10-03 — fields on Glass

- **What changed** — `onFormSubmit` and `onClearErrors` (a no-op) are cut; a field's server error already clears when it is edited. New `pending`: the form is aria-busy and every control inside is locked through one disabled fieldset that adds no box or group role, so nothing remounts. Fields stack 16 apart; Form.Actions sit right-aligned 8 apart.
- **What works** — unit tests cover submit, the pending lock, no remount on pending and no group role. `Form.states.tsx` (new) renders populated, loading (pending), error and overflow.
- **What doesn't** — not browser-checked; a submit Button must still be given `pending` itself.
- **Candidates** — an error summary at the top that links to each failed field.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 Wave 0

- No Wave 0 change needed: no findings, no disabled opacity, no `prefers-contrast` block. Vocabulary already conformed.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Upstream, no local change** — submit focuses the first invalid field in document order; `clearErrors` no longer drops updates when several fields change at once.

## 2026-10-04 — lifecycle fixture reads the lock

- **What changed** — the lifecycle fixture read `input.disabled`, which stays false: the lock is the disabled fieldset, so the input matches `:disabled` without the attribute. The check now reads `:disabled`; the component did not change.
- **What works** — the lifecycle fixture passes in all four projects: busy, locked, the server's words on the field, unlocked.
