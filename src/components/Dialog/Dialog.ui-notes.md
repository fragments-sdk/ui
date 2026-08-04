# Dialog fragment notes

- Authored states: closed default, confirmation, large, native-button trigger, and rendered long title.
- Matrix declares size, modal mode, both themes, open/focus, and browser-verifiable long titles. Preview
  cards deliberately start closed so independently rendered examples cannot stack modals (D-108).
- Guidance uses Alert for non-blocking confirmation and shows a titled, explicitly closable Dialog for
  focused tasks.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- Brief 11A's independent Browser Gate passed all 23 retained Bundle 01 cases plus the supported
  Button disabled state against implementation `ba6b9cd0` and snapshot `158d5547…`. The fresh Dialog
  path began closed, opened exactly one named modal from Enter, focused its close control, restored the
  trigger after Escape, and rendered the long-title case without desktop, 390px, or 320px overflow.
  See `docs/fragment-workshop/browser/01-contract-pilot.md` for the owned-server record.
- The repair at `b1458c1b` received a second independent PASS against snapshot `b6c7377a…`: C01–C24
  were re-executed on owned port `34175`, the Dialog open/close/focus and long-title paths remained
  correct at desktop, 390px, and 320px, and the fresh Console audit contained zero warnings or errors.
- Brief 11B implementation `0f2ad436` independently passed C01–C24 against stacked-base snapshot
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
- After child #481 landed on the Brief 11A parent, clean head `83938e21` independently passed C01–C24
  against the brief-declared Bundle 01 base snapshot `d39ed67c…` on owned port `34179`. Dialog began
  closed, opened one named modal from Enter with its close control focused, restored trigger focus
  after Escape, retained the long-title fixture at exact desktop/390px/320px widths across both themes,
  and produced zero Browser Console warnings or errors.
- Brief 11C is an evidence-record reconciliation only: it changes no Dialog runtime, fragment,
  generated-catalog, or rendered-state bytes. Independent verifier `/root/browser_11c` bound implementation
  `327f5e44` to base `2887f459` and snapshot `6b52e175…` on owned port `34180`, but the direct Browser Gate
  failed at C18 when ArrowRight focused the first Button `Code` tab and Enter left it unselected. Per the
  stop-on-first-failure rule, C03, C12, C16–C17, C22, and the full-matrix C23 Console audit were not run, so
  this renewal makes no fresh claim about Dialog modal, focus-return, long-title, or responsive behavior.
  The separate tagged Docs E2E suite passed 15/15 in 42.8s, and the partial Browser log contained zero
  warnings and zero errors; see `docs/fragment-workshop/browser/01-contract-pilot.md` for the exact conflict
  and cleanup record.
- Brief 11C round-2 verifier `/root/browser_11c_round2` bound implementation `53161576` to base
  `2887f459` and snapshot `868b696e…` on owned port `34182`. Direct Browser checks passed the Dialog
  deep-link/refresh and long-title cases, including containment at `1280px` dark, `390px` dark, and
  `320px` light. D-122's C18-only raw Enter adapter passed exactly as authorized, but C22 failed:
  with `Open large dialog` focused, neither locator Enter nor Browser CUA Enter opened a modal. No raw
  fallback was used because D-122 does not cover Dialog, so the matrix stopped and C23 remained `NOT RUN`.
  The tagged Docs E2E suite passed 15/15 in 45.5s and the completed partial Browser run had zero warnings
  and zero errors; the Browser record retains both the 11:08 C18 failure and this later C22 failure.
- Brief 11C round-3 verifier `/root/browser_11c_round3` bound implementation `41f0acac` to base
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
