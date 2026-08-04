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
