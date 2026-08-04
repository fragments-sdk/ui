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
