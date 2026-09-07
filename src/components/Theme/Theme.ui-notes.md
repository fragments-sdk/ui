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

## 2026-09-07 — Theme-switch transition suppression (better-ui rule)

- **What changed** — `ThemeProvider` now wraps the `data-theme` write in a one-frame `*{transition:none!important}` style when the resolved mode actually changes: inject, write the attribute, flush layout, remove on the second animation frame. Every surface with a colour transition (buttons, cards, links) used to smear at its own speed for one transition duration on toggle.
- **What works** — the Theme suite verifies both `data-theme` and class changes: transitions are suppressed during the change and restored after the second frame. A matching DOM theme adds no override; hydration can suppress transitions when the DOM and resolved themes differ.
- **Unverified** — browser proof of the smear being gone; needs a private Storybook/docs server (the shared :3001 serves a different branch).
- **Candidates** — none; the suppression is the platform fix for the whole class.
