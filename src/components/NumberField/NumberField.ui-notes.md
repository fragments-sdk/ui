# NumberField UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the xs size reads the shared `field.size-xs` recipe instead of a local copy; no visual change.
- **What works** — NumberField unit tests pass.

## 2026-10-03 — fields on Glass

- **What changed** — new. A numeric field on the band: the arrow keys step by `step`, Shift by `largeStep`, Home and End jump to the bounds, and dragging the optional `scrub` label scrubs the value. Figures are tabular and end-aligned; the `unit` sits after them in ink 3 and is added to the input's description, so 12 is heard as 12 px. Sizes are xs–lg. No stepper buttons: the keyboard and the scrub label cover them.
- **What works** — unit tests cover rendering, Field plus unit description, ±1/±10 steps, clamping, the scrub label hidden from assistive tech, invalid, the 24 step, disabled and read-only, and axe. `NumberField.states.tsx` renders populated, empty, error, overflow, disabled, read-only and sizes.
- **What doesn't** — not browser-checked; Escape does not restore the value from before the edit.
- **Candidates** — Escape to revert, and optional stepper buttons for touch-only contexts.
- **Disabled group** — the box (`NumberField.Group`) carries `aria-disabled` while disabled, so the unit, which describes the input, reads as part of the inactive control; axe flagged the dimmed unit for colour contrast without it.
