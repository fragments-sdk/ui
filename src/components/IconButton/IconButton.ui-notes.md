# IconButton — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — `render`, as on Button, so an icon link is `render={<a href="…" />}` with no workaround.
- **What works** — a unit test renders an icon link through `render`.
- **What doesn't** — not browser-checked in this lane.

## 2026-10-03 — Glass v4 actions pass

- **What changed** — IconButton is the one icon-only control (Button's `icon` prop merged here). `variant="outline"` is cut (UIR-D75; soft is the neutral secondary). Soft repaints to the shared neutral tint: `--fui-bg-hover` at rest, `--fui-bg-active` on hover and press, the same as Button soft. The track gains xs (24) with the micro hit area, so an in-row action no longer needs an override. `pressed` becomes a real toggle on the headless Toggle: `pressed` + `onPressedChange` (controlled) or `defaultPressed`, with `aria-pressed`, painted with `selection.selected` (UIR-D142). `pending` joins from the action recipe: `aria-busy`, presses swallowed (a pending toggle keeps its state), the spinner after a second.
- **What works** — `IconButton.test.tsx` covers the toggle round trip, plain-button semantics without toggle props, pending for both forms and xs from the prop and from an xs region; `IconButton.states.tsx` adds xs, a soft pressed toggle, a pending row and a pressed-under-hover cell.
- **What doesn't** — no solid icon-only look, so a solid split button pairs a solid Button with a soft IconButton or uses a labelled Button; not browser-checked in this lane.
- **Candidates** — a `render` prop if router-link icon actions appear; a Tooltip pairing recipe for unlabelled glyphs.

## 2026-10-03 — interaction recipes: action, focus, target, selection

- **What changed** — the action recipe's states (UIR-D123): hover under `(hover: hover)`, press 0.985 (was 0.96) but not on a popup trigger, disabled dimmed once. Variant hover is the hover tint as a background image, so a pressed toggle keeps its wash and ring underneath. Every size draws the hit area (`target.hit-area("micro")`): its own track for a pointer, 44px coarse; `sm` had a 32px hit area for a pointer and now uses its own 28px (UIR-D127, MIGRATION row).
- **What works** — `IconButton.states.tsx` (new, `@family:actions`) renders variants, sizes, a pressed toggle and the lifecycle row; `FocusRecipe.states.tsx` (`hitAreas`) reads `::after` ≥ 24 and ≥ the track for a pointer, ≥ 44 coarse, with the visual size unchanged.
- **What doesn't** — the `sm` pointer hit area is 4px smaller than before; it still meets the 24px floor.
- **Candidates** — none.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `variant` values join the five chrome families: `subtle` → `soft`, `outlined` → `outline`; `ghost` is unchanged and stays the default.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Actions + Feedback + Display category pass.

## 2026-09-07 — Press feedback (better-ui rule)

- **What changed** — `:active` scales to `0.96` under `prefers-reduced-motion: no-preference`, disabled states excluded; same block as `Button` so the two controls press identically.
- **What works** — the IconButton suite is green at this HEAD.
- **Unverified** — browser proof; touch.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-bg-tertiary`, `--fui-radius-l2`. Corners now read the radius roles (`control`); motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-04 — the soft edge under more contrast

- **What changed** — `soft` takes its border colour from `--fui-button-soft-border` (shared with Button): transparent at rest, `--fui-border-strong` in the high-contrast tier, so `data-high-contrast="true"` no longer leaves it edgeless.
- **What works** — a unit test checks the border slot and the outline mixin; the states `moreContrast` fixture reads the edge at rest and under the attribute.
