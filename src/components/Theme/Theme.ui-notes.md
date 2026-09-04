# Theme — UI notes

## 2026-09-04 — Wave 0 vocabulary migration

- **What changed** — the deleted `appearance` axis splits the control in two: `Theme.Toggle` is the segmented light/dark/system control and `Theme.Button` the single icon button (UIR-D11). `ThemeProvider` renders no chrome and its contract lead is a one-sentence utility-provider description (UIR-D24).
- **What works** — the vocabulary schema gate (`src/contract-vocabulary.test.ts`) and the kit test suite are green at this HEAD.
- **Candidates** — Wave 2 Docs proof (the theming page renders this provider); no Wave 1 category owns it.

## 2026-09-04 Wave 1 — density axis deleted (UIR-D36)

- **What changed** — public API: `configureTheme` no longer accepts `density`, and `DensityPreset` is no longer exported. `ThemeSeeds` in `@usefragments/core` and `ThemeConfig` / `SeedConfig` in the CLI lost their `density` key with it. `--fui-scale` is the replacement and reaches every measurement, not just `--fui-space-*`.
- **What works** — `configureTheme.measurements.test.ts` and the packaging suite are green at this HEAD; the built stylesheet emits no `[data-fui-density` selector.
- **Breaking for consumers** — the CLI theme schema is `.strict()`, so a theme file still carrying `density` now fails validation rather than ignoring the key. Covered by the `delete-density-axis` changeset at a major bump for ui, core and cli.
- **Not re-checked in this lane** — the Theme.Toggle / Theme.Button chrome (Wave 0, unchanged here).
