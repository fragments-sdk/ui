# ThinkingIndicator — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the flat part exports (ThinkingIndicatorRoot, ThinkingSteps and ThinkingStep) are cut, so the compound is the one form (`ThinkingIndicator.Steps`), and `ThinkingIndicator.Root` is the compound itself (MIGRATION-v4).
- **What works** — `src/compound-exports.test.ts` fails if a cut name ships again or `.Root` drifts from the compound.
- **What doesn't** — nothing new.
- **Candidates** — none new.

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the dot sizes fall back through the measurement scale instead of raw px literals.
- **What works** — the Sass compiles; unit tests pass.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-10-03 — elapsed out of the live region (3.1.3)

- **What changed** — the whole root was the polite `role="status"` region, so the elapsed counter re-announced every second. The region is now the label span alone (`role="status"`, `aria-live="polite"`, `aria-label={label}`); the counter and the steps sit outside it. The root is a plain `div`. No visual change.
- **What works** — `ThinkingIndicator.test.tsx` uses fake timers and a MutationObserver: 5 s of ticks cause no change inside the region, the counter has no live ancestor, and the region leaves when `active` turns false. `getByRole("status", { name })` still finds it.
- **What doesn't** — the region still mounts with its text (start may go unannounced on some screen readers) and unmounts at the end (nothing spoken). Step changes are no longer announced.
- **Candidates** — keep the region mounted while inactive, step status as words, "Thinking…" (AI sweep).

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` was never chrome, so it is `kind` (`dots` · `pulse` · `spinner`) — UIR-D16; the `ThinkingVariant` type is `ThinkingKind`, and `steps[].status` reads the shared lifecycle axis.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 2 AI surfaces: UIR-D2 replaces this component with the industry-named primitives rather than keeping it beside them.

## 2026-10-03 — AI surface on Glass

- **What changed** — one row (h32, control corner) with the work wash while `active`, a selection-colour dot that becomes an ink tick when done, the label as a status that swaps to `doneLabel` and stays mounted, and a frozen elapsed time outside the status. `ThinkingIndicator.Steps` (optional fold, "N of M done") and `ThinkingIndicator.Step` (`idle | pending | complete | error`) replace the `steps` data prop. Failed steps say "Failed:" in words. `kind`, `streaming`, the rail and the context hook are cut.
- **What works** — 8 unit tests; states: loading, loadingReducedMotion, populated, error, overflow, lifecycle.
- **What doesn't** — not browser-checked in this lane.
- **Candidates** — a tool-call step with input and output disclosure.
