# Theme — UI notes

## 2026-10-03 — Glass: review and browser fixes

- **What changed** — `Theme.states.tsx` fills the harness columns: the cold-load fixture is the loading case (`loadingStoredMode`), a new `lifecycleModeSwitch` fixture flips a nested scope through `setMode` and checks its plane re-derives while the page keeps its mode, and empty and overflow are marked not applicable. The stories no longer pin `defaultMode: "system"` in the meta args, so a story's own mode reads, and the demo rows compose Stack and Text instead of raw elements.
- **What works** — the Theme unit tests and the typecheck pass with the new fixture.
- **What doesn't** — the mode-switch fixture is unverified in the browser lanes this run (state lanes are run once for the release).
- **Candidates** — none new.

## 2026-10-03 — long tail on Glass (v4)

- **What changed** — every shim is hard-cut. `defaultTheme` is gone (use `defaultMode`). The retired neutral names (stone, ice, sand, earth, fire, fragments) are no longer special: `neutral` is `"paper"` or a CSS colour, with no warning path. `attribute` is cut from `Theme` and `ThemeScript`: the mode is always `data-theme` on `<html>`. `Theme.Provider` and the `ThemeProvider` export are merged into `Theme` / `Theme.Root`; the props type is `ThemeProps`. `configureTheme` drops `radiusStyle` (and the `NeutralPalette` / `RadiusStyle` type exports); `radius` is the one corner input. `toggleMode` steps system → light → dark → system instead of skipping system. `useTheme` with no `Theme` above is no longer a silent no-op: it reads `data-theme` on `<html>`, re-renders when it changes, and its `setMode` writes it (`system` removes it so the stylesheet's `light dark` follows the OS). The `:root.dark` / `:root.light` selectors are gone from the token stylesheet; only `data-theme` sets the document mode.
- **What works** — `Theme.test.tsx` covers the document-backed hook (read, write, external change, system), the toggle cycle, the single root name and type errors on the cut props; `ThemeScript.test.tsx`, `inputs.test.ts` and `configureTheme.measurements.test.ts` cover the data-theme-only script, plain colour neutrals and the radius-only configure path.
- **What doesn't** — the measurement module's named radius profiles (`data-fui-radius-style`) have no Theme caller now.
- **Candidates** — integration: the actions batch cut `Theme.Toggle`, `Theme.Button` and `componentDefaults`; the IconButton composition flips with `setMode`, because `toggleMode` now passes through system.

## 2026-10-03 — actions on Glass (v4)

- **What changed** — `Theme.Toggle`, `Theme.Button` and the `componentDefaults` prop are cut with ThemeToggle and ThemeButton (UIR-D75). The colour-mode control is a composition: a ToggleGroup wired to `useTheme` (System, Light, Dark; System first), or one IconButton calling `setMode`. Stories, contract examples and the compound-identity test follow. Two fixtures in `Theme.states.tsx` moved off the cut Button `outline` to `soft`.
- **What works** — `Theme.test.tsx` asserts `Toggle` and `Button` are gone from the compound; the stories render both compositions.
- **What doesn't** — the colour-mode composition is copy-paste: there is no exported control for it.
- **Candidates** — a docs recipe page for the colour-mode composition.

## 2026-10-03 — units and scales

- **What changed** — `Theme.states.tsx` reads the new names (`--fui-raw-space-*`, `--fui-type-*`).
- **What works** — `v4-surface.test.ts` fails if any component, recipe or block reads a deprecated name; the library suite, the geometry lane and the state lanes pass at this commit.
- **What doesn't** — Fixture only; no component change.
- **Candidates** — None.

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

## 2026-10-03 — `configureTheme` writes seeds

- **What changed** — `configureTheme({ brand, danger, success, warning, info })` sets `--fui-seed-*` on `:root` and nothing else. The stylesheet derives accent hover and press, selection, focus ring and every tone's text, tint and on-fill from the seeds, holding contrast for any seed. The hex-only lightness helpers are deleted, so any CSS colour works as a seed.
- **What works** — `configureTheme.measurements.test.ts` asserts that only seed properties are written. The same rebrand works in CSS alone: `:root { --fui-seed-brand: #e11d48; }`, or seeds on any `[data-fui-theme]` element (`src/tokens/Rebrand.states.tsx`).
- **What doesn't** — the `neutral` option is still typed as a palette name and is not written. `Theme` has no nested provider that renders `data-fui-theme`.
- **Candidates** — write `neutral` as `--fui-seed-neutral`, and render `data-fui-theme` from a nested `Theme`.

## 2026-10-03 — Scoped themes, `ThemeScript`, every input written

- **What changed** — the outermost `Theme` owns `<html>` (mode, storage, inputs, inline `color-scheme`); a `Theme` inside another renders one `<div data-fui-theme>` and every derived role re-resolves inside it. New inputs on `Theme`, `ThemeScript` and `configureTheme`: `neutral` (now written as `--fui-seed-neutral`, chroma capped at 0.04 in the plane expression), `radius`, `scale`, `font`, `pressScale`, `primaryChrome` (`data-chrome="accent|ink"`), plus the seeds. `ThemeScript` is a server component for `<head>` that writes the stored mode before first paint. Storage that throws falls back to the default mode with no error. Shadows carry `light-dark()` stops, so a dark scope gets dark shadows on a light page. Every overlay portal (Dialog, Drawer, Popover, Menu, Select, Combobox, DatePicker, ColorPicker, Tooltip, Header nav menu) spreads `useThemePortalProps()`, so a popup opened in a scope keeps it; the Header and NavigationMenu mobile drawers, which use `createPortal`, render inside `ThemePortalScope`, one element carrying the same props. A scope that sets `font` (or sits under one that does) hands its portals `font-family: var(--fui-font-sans)` too, so a popup reads the scope's font, not the page's. New stories: `NestedScope` and `InkChrome`; the contract gains the inputs, the nesting guidelines and two examples.
- **What works** — `Theme.states.tsx` (`@tag:theme-scope`) proves in Chromium, WebKit, Firefox and coarse, light and dark: a dark panel on a light page re-derives canvas, ink, fill and shadows; an ink toolbar; a tuned scope (neutral, scale, radius, font, press scale); a vivid neutral holding 4.5:1 on four planes; a Tooltip portal carrying the dark scope; `ThemeScript` cold load and blocked storage in a fresh document. `test:rsc` renders `ThemeScript` in the server layout of every route with no new failures. The unit tests in this folder cover the portal props, the portal font and every input; the Header and NavigationMenu suites open each drawer in a dark scope.
- **What doesn't** — WebKit axe flags Base UI's focus guards (`role="button"`, no name) inside an open Popover portal, so the portal proof uses a Tooltip. The drawer scope is proven in jsdom only. `data-fui-radius-style` profiles key off `<html>` only, so a nested scope cannot pick a radius profile (set `radius` instead). CodeBlock reads the root `data-theme`, not the scope's. Storybook's Theme stories now render nested scopes inside the preview's root provider, so their toggles switch the story scope, not the page. `pressScale` writes `--fui-press-scale`, but no action recipe reads it yet; press feedback lands with the interaction recipe.
- **Candidates** — a states fixture that opens a drawer in a scope; a scope-aware CodeBlock theme; move the docs app's hand-written pre-paint script to `ThemeScript`.

## 2026-10-04 — a stored nested mode paints first

- **Fixed** — `Theme` reads its stored mode in a layout effect, not a passive one. A nested scope with its own `storageKey` used to paint its default mode for a frame before the stored one, because no `ThemeScript` covers a nested scope.
- **What works** — a headless check in Chromium, WebKit and Firefox (a nested scope set to light by default, `dark` stored, a 60ms subtree) sampled the scope at every animation frame: the old code showed `light` then `dark` in 5 of 5 runs per engine; the new code showed only `dark`. The Theme unit tests pass.
- **What doesn't** — server-rendered HTML still carries the default mode until hydration; a nested scope that must be right before hydration takes a controlled `mode` (for example from a cookie).
