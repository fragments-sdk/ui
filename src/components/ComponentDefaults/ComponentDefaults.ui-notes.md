# ComponentDefaults — UI notes

## 2026-10-03 — Glass v4 actions pass

- **What changed** — the track gains xs (24): `CONTROL_SIZES` is xs/sm/md/lg and `controlSize` accepts xs. `useResolvedControlSize(explicit, steps?)` takes the steps the control draws; a provider size the control lacks resolves to its nearest step, so a control with no xs step renders sm inside an xs region. Button, IconButton and ToggleGroup opt into all four, and so do the field controls (Input, Textarea, Select, Combobox, NumberField), so an xs region reaches them too. The provider's `value` object and Theme's `componentDefaults` prop are cut (UIR-D75): `ComponentDefaultsProvider controlSize` is the one entry point.
- **What works** — nesting, inheritance of an omitted size, explicit-wins and xs clamping are covered in `ComponentDefaults.test.tsx`; `ComponentDefaults.states.tsx` (new, `@family:actions`) renders Button, IconButton and ToggleGroup in an xs, sm, md and lg region, a nested xs region and an explicit size winning.
- **What doesn't** — controls owned by other lanes (Input, Select, Checkbox, Radio, Switch, Tabs, Pagination) still draw three steps and clamp xs to sm until they opt in.
- **Candidates** — every control on the track opts into xs by passing `CONTROL_SIZES`; a solid IconButton so a dense split button needs no soft half.

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — no prop renamed; the provider gained its first `ComponentDefaults.contract.json`, filed under `utilities` with a one-sentence lead (UIR-D24), and dropped out of `publicUiPrimitiveNames()` so `components/prefer-library` never points authors at a provider (UIR-D25).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — none.
