# Progress — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — the `neutral` meter fills with the inverse plane (ink 1) instead of the tertiary ink, which is not a plane and read faint on the band. The module drops its needless `"use client"` directive, so `Progress` and `Progress.Root` render in a server component (the server-components baseline no longer lists it).
- **What works** — the style lane holds no baseline entry for Progress now.
- **What doesn't** — the server-components and contrast lanes were not run this pass.
- **Candidates** — none new.

## 2026-10-03 — Glass: the states harness pass

- **What changed** — the fixture finds the track as the root's last `div`, not its last child: the progress primitive appends a visually hidden span after the track.
- **What works** — `populated` and `loading` render and pass their checks in all four projects.

## 2026-10-03 — Glass PR5: data on Glass

- **What changed** — one 4px track on the band at the control radius; the fill is the selection colour (`--fui-control-checked-bg`). The fill is the whole track scaled from its start edge (`scaleX`, origin flipped under RTL) on the 200ms ease, never an animated width. Work not yet counted (`value={null}`) is a 30% run that travels the track; under reduced motion it is the whole track at half strength, never a bar parked at the start. Label and value are 11px in ink 2, the value in tabular figures. Cut: `size` (one track), `tone="success"` (a full bar is not a verdict), `Progress.Circular` / `CircularProgress` with `strokeWidth`, `geometry.ts` and the `--fui-progress-diameter` / `--fui-progress-dash-*` properties.
- **What works** — `Progress.test.tsx` checks the scale transform and its origin, the compiled track, fill colour, run and reduced-motion hold, tones, aria naming and clamping; `Progress.states.tsx` measures the 4px track, the band, the radius, the fill colour and scale, the header type and ink, and the run (or the reduced-motion hold).
- **What doesn't** — the default value text ("Loading", "N percent") and name ("Progress") are English; `aria-valuetext` and `aria-label` localise them.
- **Candidates** — read Base UI's locale-aware value formatting instead of the fixed strings.
- **Not run here** — `test:states` (run once for the whole release).

## 2026-10-03 — access tokens: cascade layers, coarse pointer, forced colours

- **What changed** — every rule sits in `@layer fui.components`, after `@layer fui.tokens, fui.base, fui.components;`, so an adopter's unlayered class wins at any specificity (UIR-D122).
- **What works** — `fui/layer/components-layer` passes on the module and `check:layers` on the built stylesheet; the Sass compiles. No fixture of its own covers the rest yet.
- **What doesn't** — screens are not compared visually; forced colours are proven only where a fixture says so above.
- **Candidates** — a states fixture that renders this component under the coarse project and forced colours.

## 2026-09-03 — Wave 0 vocabulary cut

What changed

- `variant` → `tone` on both `Progress` and `Progress.Circular` (`ProgressTone`:
  `accent` default, `neutral`, `success`, `warning`, `danger`). The old
  `default` value is `accent`; the old prop is a TypeScript error.
- The ring now takes `neutral` too (`.circularIndicatorNeutral`), so a meter
  reads the same in bar and ring form.
- The ring geometry is authored on the instance through public properties
  `--fui-progress-diameter`, `--fui-progress-dash-full`,
  `--fui-progress-dash-quarter` (declared in
  `tokens/_component-properties.scss`; were `--_progress-*`). Consumers that
  overrode the outer box via `--_progress-diameter` must use the public name.
- Every `var()` read carries a Sass twin or measurement fallback (track size,
  ring diameter, dash offsets).

What still does not work

- `strokeWidth` is a raw number prop; the defaults in `geometry.ts` are
  unitless px, not measurement targets.

Improvement candidates

- Fold `size` on the ring onto the shared `--fui-icon-*` ladder so a
  `Progress.Circular size="sm"` lines up with an `Icon size="xl"` next to it.

## 2026-10-03 — `@base-ui/react` 1.8.0

- **No visible change** — upstream fixed custom `min`/`max` semantics on the indicator. This component computes its own clamped value, percentage, `aria-valuetext` and indicator width, so nothing moved.
- **Candidate** — drop the local clamping now that the primitive matches it.

## 2026-10-03 — v4 surface and token pass

- **Token reads** — the legacy reads are gone: `--fui-bg-tertiary`, `--fui-transition-normal`. motion reads `--fui-duration-*` with `--fui-ease-standard`; planes and lines follow MIGRATION-v4.md.
- **Not browser-checked** in the token pass; the component lane owns the visual check.
