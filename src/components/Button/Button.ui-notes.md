# Button fragment notes

- Authored states: primary, secondary, ghost, danger, disabled, and a rendered long label.
- Matrix declares variants, sizes, both themes, hover/focus/disabled, and a browser-verifiable long label.
- Guidance now uses the canonical Link for plain navigation; a Button remains only for actions.
- The Bundle 01 browser record is the source of verification evidence; no Figma reference is authored.
- Integrated Bundle renewal `cd4c6d44` reconfirmed the canonical Primary state,
  full localized label, disabled `Unavailable` state, Preview/Code focus and
  selection, and Ctrl/Cmd-K preview isolation at desktop, 390px, and 320px.
  D-129's C18 native-Enter diagnostic passed 3/3; Console remained 0/0.

## 2026-09-02 — Long Label specimen vs `nowrap`

The catalog variant "Long Label" claims "Long labels wrap instead of clipping",
but `.button` is `white-space: nowrap`: a 614px label in a 346px docs capsule
scrolls inside its container rather than wrapping. Decide one way — allow
wrapping (multi-line buttons change the control-track contract) or rewrite the
example copy to say what the component does. Logged as G-19 in
`docs/docs-reference-grade/GOVERNANCE-FRICTION.md`.
