# Dialog fragment notes

- Authored states: closed default, confirmation, large, native-button trigger, and rendered long title.
- Matrix declares size, modal mode, both themes, open/focus, and browser-verifiable long titles. Preview
  cards deliberately start closed so independently rendered examples cannot stack modals (D-108).
- Guidance uses Alert for non-blocking confirmation and shows a titled, explicitly closable Dialog for
  focused tasks.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- The initial independent Browser Gate passed all 23 retained Bundle 01 cases plus the supported
  Button disabled state against implementation `ba6b9cd0` and snapshot `158d5547…`. The fresh Dialog
  path began closed, opened exactly one named modal from Enter, focused its close control, restored the
  trigger after Escape, and rendered the long-title case without desktop, 390px, or 320px overflow.
- The repair at `b1458c1b` received a second independent PASS against snapshot `b6c7377a…`: C01–C24
  were re-executed on owned port `34175`, the Dialog open/close/focus and long-title paths remained
  correct at desktop, 390px, and 320px, and the fresh Console audit contained zero warnings or errors.
- The follow-up implementation `0f2ad436` independently passed C01–C24 against stacked-base snapshot
  `6c41c22b…` on owned port `34176`. Dialog again began closed, opened one named modal from Enter,
  focused its close control, restored the trigger after Escape, retained the long-title case at desktop,
  390px, and 320px, and produced zero Browser Console warnings or errors.
- After the Gate V ledger-order repair, clean head `84c6bbcb` independently passed C01–C24 against
  stacked-base snapshot `942a22fd…` on owned port `34177`. Dialog's closed/open/one-modal focus path,
  Escape return, long-title fixture, desktop/390px/320px containment, and zero-warning/zero-error
  Console result all remained intact.
- After D-120's canonical identity-ledger capture, clean head `a622b81e` independently passed C01–C24
  against stacked-base snapshot `96bbd7eb…` on owned port `34178`. Dialog again began closed, opened
  one named modal from Enter with its close control focused, restored trigger focus after Escape,
  retained the long-title fixture at exact desktop/390px/320px widths across both themes, and produced
  zero Browser Console warnings or errors.
- After child #481 landed on the parent verification, clean head `83938e21` independently passed C01–C24
  against the recorded Bundle 01 base snapshot `d39ed67c…` on owned port `34179`. Dialog began
  closed, opened one named modal from Enter with its close control focused, restored trigger focus
  after Escape, retained the long-title fixture at exact desktop/390px/320px widths across both themes,
  and produced zero Browser Console warnings or errors.
- This evidence record reconciliation: it changes no Dialog runtime, fragment,
  generated-catalog, or rendered-state bytes. Independent verifier `/root/browser_11c` bound implementation
  `327f5e44` to base `2887f459` and snapshot `6b52e175…` on owned port `34180`, but the direct Browser Gate
  failed at C18 when ArrowRight focused the first Button `Code` tab and Enter left it unselected. Per the
  stop-on-first-failure rule, C03, C12, C16–C17, C22, and the full-matrix C23 Console audit were not run, so
  this renewal makes no fresh claim about Dialog modal, focus-return, long-title, or responsive behavior.
  The separate tagged Docs E2E suite passed 15/15 in 42.8s, and the partial Browser log contained zero
  warnings and zero errors. The conflict and cleanup record remain internal.
- The round-2 verifier `/root/browser_11c_round2` bound implementation `53161576` to base
  `2887f459` and snapshot `868b696e…` on owned port `34182`. Direct Browser checks passed the Dialog
  deep-link/refresh and long-title cases, including containment at `1280px` dark, `390px` dark, and
  `320px` light. D-122's C18-only raw Enter adapter passed exactly as authorized, but C22 failed:
  with `Open large dialog` focused, neither locator Enter nor Browser CUA Enter opened a modal. No raw
  fallback was used because D-122 does not cover Dialog, so the matrix stopped and C23 remained `NOT RUN`.
  The tagged Docs E2E suite passed 15/15 in 45.5s and the completed partial Browser run had zero warnings
  and zero errors; the Browser record retains both the 11:08 C18 failure and this later C22 failure.
- The round-3 verifier `/root/browser_11c_round3` bound implementation `41f0acac` to base
  `2887f459` and snapshot `1dd14008…` on owned port `34184`. The fresh C01–C24 matrix passed under
  D-123: direct Browser reconfirmed Dialog deep-link/refresh, long-title containment at `1280px` dark,
  `390px` dark (`16–374px`), and `320px` light (`16–304px`). For C22 it uniquely identified the exact
  focused `Open large dialog` target; same-server raw native Enter passed 3/3 with
  `keydown` → `keypress` → `click` (`detail=0`) → `keyup`, all `defaultPrevented=false`, exactly one
  `Detailed settings` dialog, `Close dialog` focus, Escape closure, and returned trigger focus. The tagged
  Docs E2E suite passed 15/15 in 53.1s, and the completed direct Browser Console audit contained zero
  warnings and zero errors. Both earlier FAIL rounds remain in the Browser record history.
- D-124 renewed the reusable binary snapshot at final records/ledger head `9ed83b84` to `a6e5e54e…`
  without changing Dialog source, generated catalog bytes, or rendered behavior. A snapshot-only direct Browser
  smoke on owned port `34212` reconfirmed the canonical Dialog deep link, five preview groups, exact
  unique `Open large dialog` trigger, one `Detailed settings` modal, and active `Close dialog` control.
  Browser-wrapper Escape again followed D-123's documented adapter limitation before the modal closed;
  this smoke does not promote the historical `41f0acac` C01–C24 result to a new behavioral round. The final
  rebind followed canonical signed identity-ledger capture only and required no second UI interaction.
- D-125 rebound the final snapshot at test-harness head `5045dba0` to `68ef98a1…` after raising only the
  five-pilot Engine integration test's explicit timeout. Dialog source, catalog bytes, prior Browser behavior,
  and every assertion remain unchanged, so this timeout-only move required no additional UI interaction.
- D-126/D-127 rebound the snapshot at test/evidence head `e2db8516` to `c29d8765…` after serializing Engine
  test files, adding sixth-authoring's targeted timeout, and correcting one stale CLI confidence fixture.
  Dialog source, UI/runtime behavior, generated catalog bytes, and prior Browser observations remain unchanged,
  so the prior D-124 direct smoke is retained without another UI interaction; fresh Gate V/Gate R own regression proof.
- D-128 rebound the snapshot at test/evidence head `2c967827` to `63111a9d…` after reducing only one CLI
  stale-lock fixture's same-process fan-out and restoring two record-integrity findings. Dialog source,
  UI/runtime behavior, generated catalog bytes, and prior Browser observations remain unchanged, so the prior
  D-124 direct smoke is retained without another UI interaction; fresh Gate V/Gate R own regression proof.
- After PR #482 merged, the fresh parent verification renewal bound `6550c77d` to Bundle base `0ae700f4` at
  snapshot `f9e0a425…`. Direct Browser reconfirmed Dialog deep-link/refresh, five authored preview groups,
  long-title containment at `1280px` dark, `390px` dark (`16–374px`), and `320px` light (`16–304px`), plus
  one-modal focus/close/trigger-return lifecycle and zero Console warnings or errors. The Browser's synthesized
  Enter still opened no modal and remains explicit under D-129's carried D-123 boundary; same-server raw native Enter passed 3/3 with
  `keydown` → `keypress` → `click` (`detail=0`) → `keyup`, every event `defaultPrevented=false`, exactly one
  `Detailed settings` dialog, `Close dialog` focus, Escape closure, and trigger-focus return. The clean tagged
  Docs suite passed 15/15 in 34.5 seconds on runner-owned port `34186`.
- After PR #480 merged, the fresh integrated Bundle renewal bound `cd4c6d44` to current main base
  `aa417fae` at snapshot `2616e7d3…`. Direct Browser reconfirmed the Dialog deep link, five authored
  preview groups, the full localized title, and containment at desktop, 390px (`16–374px`), and 320px
  (`16–304px`). Direct click opened one `Detailed settings` modal with Close focus; Escape closed it and
  settled focus back on `Open large dialog`. Synthesized Browser Enter still opened zero dialogs and
  remains explicit under D-129; same-server native Enter passed 3/3 with the required event order and
  lifecycle. Console remained 0/0 and the isolated tagged suite passed 15/15 in 33.1 seconds.

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122); the target mixin's hit area rises to `--fui-hit-area`: 44px under a coarse pointer, 24px floor otherwise (UIR-D120).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — `Dialog.Content size` is `width` (UIR-D16); the panel widths moved into the hash-guarded measurement catalog as `--fui-overlay-*` (UIR-D15). No other prop renamed.
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 1 Navigation + Layout + Overlays category pass.

## 2026-09-04 Wave 1 — floating surface parity (UIR-D40)

- `.footer` and `.close` are recipe-only now: the footer band (hairline top edge, `--fui-bg-secondary`) lives in `overlay.footer`, the close button radius/ink/hover/glyph in `overlay.close`. The hand-written footer `border-radius` is gone; the popup's `overflow: auto` clips the band to the l1 corner (checked in Storybook, OpenByDefault).

## 2026-09-04 Wave 1 — navigation parity (UIR-D41)

- **What changed** — nothing. Dialog is listed here only because the lane re-ran its suite alongside the navigation components after `overlay.backdrop` was extracted from the shape Dialog already used.
- **Not re-checked in this lane** — Dialog was browser-verified under UIR-D40; no UIR-D41 edit touches it.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **Outside presses** — a press that began before the dialog opened no longer dismisses it on release. Touch dismissal without a backdrop and the scroll-lock handoff with other overlays are fixed upstream.
- **Outside clicks under Firefox touch emulation** — the same probe artefact as Popover (see its notes): Playwright's Firefox with `hasTouch` clicks with no `pointerdown`, so an outside mouse click no longer dismisses there. Separately, a backdrop tap does not dismiss under Firefox touch emulation at 1.6.0 or 1.8.0, while Chromium's does; not a regression, and not yet checked on a device.

## 2026-10-03 — popups keep their theme scope

- **What changed** — the portal spreads `useThemePortalProps()`, so a popup opened inside a nested `Theme` renders with that scope's `data-fui-theme`, mode, inputs and chrome instead of the page's. Outside a scope it adds nothing.

## 2026-10-03 — feedback recipes: still popups, overlay fade, loading, dismiss

- **What changed** — the popup fades: 200ms in, 100ms out, opacity only, on the standard ease (`overlay.motion`, UIR-D133); no scale or travel. New `Dialog.states.tsx` (`@family:overlays`): populated, loading (skeleton text in the body), error (errbox in the body), overflow and lifecycleDismiss.
- **What works** — `MotionRecipe.states.tsx` reads the real `transitionrun` timings of panel and scrim: both run opacity alone at 200ms in and 100ms out, rest at an identity transform, and under reduced motion transition opacity only. `Escape` closes and returns focus.
- **What doesn't** — `empty` is argued n/a.
- **Candidates** — none from this pass.

## 2026-10-03 — v4 surface and token pass

- **Floating surface** — `overlay.surface` is shadow only: the raised plane, `--fui-shadow-popup` and the popup radius (overlay radius for a modal or side panel), no border and no footer band. Forced colours keep a CanvasText hairline.
- **Not browser-checked** in the token pass; the component lane owns the visual check.

## 2026-10-03 — Glass v4 Overlays (PR4)

- **What changed** — `modal` cut (a Dialog is always modal; non-modal content is a Popover or a `trap-focus` Drawer); `width` is `sm | md | lg` (`xl`, `full` cut); `asChild` on Trigger/Close is now Base UI `render`; `initialFocus`/`finalFocus` take the primitive's full type (boolean, ref or function). Decisions moved to the new AlertDialog.
- **Surface** — header, body, footer and title come from the `overlay.modal-*` recipes (shared with AlertDialog and Drawer): title-sm, 16px dialog pad, footer on the raised plane with no band and no line, body the only scroll region. A body that overflows joins the tab order (`useOverflowFocusable`), which clears the axe `scrollable-region-focusable` baseline the states overflow fixture carried.
- **What works** — unit tests (21) green: render trigger, initialFocus ref, scrim always present, short body out of the tab order, focus trap and return.
- **What doesn't** — not browser-checked in this lane; states/geometry lanes not run. (Review fix: the sheet partial is folded into `recipes/overlay`; the `overlay.modal-*` recipes now carry the 16px pad and title-sm, and `_sheet.scss` is deleted.)
- **Candidates** — regenerate `fragments.json` from the updated `Dialog.fragment.tsx`.

## 2026-10-04 — the footer's scroll edge

- **What changed** — the footer draws one `--fui-border` hairline across the sheet, only while the body above it overflows. `useOverflowFocusable` now marks the body `data-fui-overflowing` (even when its `tabIndex` is authored) and the footer's `::before` reads that mark. The edge is a border, so forced colours keep it; it fades in over the micro duration, with no fade under reduced motion. A body that fits has no line, so a short dialog stays one plane.
- **What works** — unit tests: the overflowing body is marked and its next sibling is the footer; the short body is not; the recipe draws the hairline only after the mark, with no shadow or fill. States: `populated` checks the edge is hidden and `overflow` checks it is drawn, one solid hairline in the border colour, spanning the sheet.
- **What doesn't** — the edge shows for the whole time the body overflows, not only once it has scrolled; content that is scrolled to its end still has the line.
- **Candidates** — hide the edge at the scroll end (a scroll-driven timeline once every engine has one).
