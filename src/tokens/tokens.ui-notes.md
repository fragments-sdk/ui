# Token layer — UI notes

Current state, 2026-10-04. The code is the truth: `_variables.scss`, `_derive.scss`, and the static snapshot `libs/ui/tokens.css` for the full token list.

## How it works

- **Six colour inputs plus two size knobs.** `--fui-seed-brand`, `--fui-seed-neutral`, `--fui-seed-{danger,success,warning,info}`, `--fui-radius` and `--fui-scale` sit on `:root`. Every colour role is a CSS expression of them, solved in the browser to WCAG 2 for any sRGB seed. Derived tokens sit in `:where(:root, [data-fui-theme])`, so a plain `:root { --fui-x: … }` override still wins, and any element with `data-fui-theme` re-derives its subtree from seeds set on it.
- **Sass twins.** `$fui-*` and `$fui-dark-*` read `_defaults.generated.scss`: the default's literal light and dark values, written from Chromium by `pnpm run generate:tokens-css`. Browsers without relative colour syntax get these static values.

## Planes

Planes are lightness steps of the neutral: `oklch(from var(--fui-seed-neutral) L calc(min(c, 0.04) * k) h)`. The chroma cap lets a vivid neutral tint the planes without moving ink contrast.

| Plane                                          | Token                                              | L light / dark |
| ---------------------------------------------- | -------------------------------------------------- | -------------- |
| Canvas                                         | `--fui-body-bg` (aliased by `--fui-app-canvas-bg`) | 0.97 / 0.182   |
| Sheets, cards, light `--fui-field-bg`          | `--fui-bg-primary`                                 | 0.998 / 0.214  |
| Band: code, user bubble, dark `--fui-field-bg` | `--fui-bg-secondary`                               | 0.95 / 0.248   |
| Popups, with `--fui-shadow-popup`              | `--fui-bg-elevated`                                | 0.998 / 0.268  |

- **Dark ladder** runs canvas < primary < secondary < elevated, at least 0.02 L between neighbours.
- **Light ladder** runs secondary < canvas < primary = elevated: a grey band, a light canvas, near-white sheets and popups.
- **Light elevated equals primary.** Popups separate by shadow. Accepted.
- **Solve bounds** (`_derive.scss`): the dark lightest plane (elevated) has luminance at most 0.02 (`$plane-ceiling-dark`); the light darkest plane (the band) has luminance at least 0.82 (`$plane-floor-light`).
- **App shell.** Rail, main and header all paint `--fui-app-canvas-bg`. Hairlines are `--fui-border`.
- **Message user bubble** is `--fui-bg-secondary` with a `--fui-border` hairline, the same grammar as CodeBlock.

## Interaction

- `--fui-bg-hover` is ink (`--fui-text-primary`) at 6% light / 4.5% dark. `--fui-bg-active` is 11% light / 8% dark. High contrast: 18% / 26%.
- Dark hover on the canvas lands about 0.043 L above the canvas and about 0.02 below the band, so hover never reads as the band.
- `--fui-control-selected-bg` is 12% of `--fui-control-checked-bg` in both themes, distinct from hover. `--fui-sidebar-item-active-bg` points at it.
- `--fui-control-selected-border`, the selection ring, is `--fui-field-border`: neutral, 3:1 or better on every plane (measured in the `SelectionRecipe` fixture: light 3.15 band, 3.34 canvas, 3.62 sheet and popup; dark 3.06 popup, 3.25 band, 3.54 sheet, 3.78 canvas). The accent ring is focus's alone (UIR-D152). `--fui-sidebar-item-active-border` defaults to `transparent`: the current nav item is the wash alone.

## Tones

- Each tone (accent, danger, success, warning, info) emits `-tint`, `-wash`, `-text`, `-fill-hover`, `-fill-active`, `-tint-hover`, `-tint-active`, `-wash-active` and `-on-fill`. The ramp reads `--fui-seed-*`.
- Tint, light / dark: accent 12 / 20%, danger 11 / 20%, success 12 / 18%, warning 18 / 18%, info 11 / 20%. Wash is half the tint.
- `-on-fill` is picked at runtime (`derive.pick`).
- `recipes/_tone.scss` publishes the ramp as `--_fui-tone-*` channels; Alert, Badge and Button include it. CodeBlock is the only module that reads `-wash` / `-tint` directly.
- The primary action is the accent for every brand. Ink chrome is opt-in via `[data-chrome="ink"]` and mixes `--fui-text-primary`.

## Other roles

- **Fields.** `--fui-field-bg` is `light-dark(var(--fui-bg-primary), var(--fui-bg-secondary))`: a sheet in light, the band in dark. The field recipe, Prompt, Editor and the boolean controls read it. The shell paints `--fui-field-bg` with a `--fui-field-border` edge, which holds 3:1 on every plane.
- **Links and code.** `--fui-link-ink` is `var(--fui-color-accent-text)`. Code surfaces are `--fui-bg-secondary`; `read-safe-contrast.test.ts` gates every syntax stop on that well.
- **Radius.** Eight roles of `--fui-radius` (control, indicator, popup, surface, overlay, row, tooltip, segment), each a CSS formula capped by `r`, so r = 0 squares every role. `recipes/_radius.scss` holds `nested(outer, pad)` and `pill(height)`. No size aliases.
- **Motion.** `--fui-duration-*`, `--fui-ease-standard`, `--fui-popup-from`, `--fui-popup-travel`, `--fui-pending-delay`, loop durations `--fui-duration-spin/pulse/shimmer`.
- **Shadow.** `--fui-shadow-popup` is the only drop shadow for floating layers; `--fui-shadow-sm` is for thumbs. Shadows are `light-dark()` per layer, so they follow `color-scheme` on any element.
- **Units.** No root font size. Type, space and control heights are rem against a 16px host; hairlines, strokes and radius are px. One spacing scale (`--fui-raw-space-*`), one type scale (`--fui-type-*`), two weights, one height family (`--fui-control-height-*`). The old names are removed; `MIGRATION-v4.md` maps them.
- **Access.** `--fui-hit-area` is 24px, or 44px under `(pointer: coarse)`. A forced-colours tier paints the focus ring `Highlight` and the edges `CanvasText`. `@property` registrations sit inside `@layer fui.tokens`.
- **Layout.** `--fui-popup-offset`, `--fui-popup-collision-padding` and `--fui-appshell-sidebar-width{,-wide}`. Menu, Popover, Tooltip, Combobox and DatePicker import `POPUP_COLLISION_PADDING_PX`; Sidebar and AppShell read the width tokens.
- **Overlay layers.** swipe 49, backdrop 50, modal 51, anchored 52, toast 55, tooltip 60.

## What works

- `pnpm run check:tokens-css` holds `tokens.css` equal to the runtime in Chromium and WebKit.
- The contrast lane (`pnpm run test:contrast`) holds 0 failing pairs across brand seeds, both modes, three engines.
- `GlassValues.states.tsx`, `Theme.states.tsx`, `Roles.states.tsx`, `Access.states.tsx` and `ForcedColors.states.tsx` read the defaults back from the browser.

## What doesn't

- The contrast lane fuzzes brands, not neutrals; the vivid-neutral proof is one fixture.
- `data-fui-radius-style` only answers on `<html>`.
- A chart hue can land near a status hue for some brands.
- WebKit matches `(forced-colors: active)` under emulation but repaints nothing.
- The read-safe unit gate does not composite the hover tint over the code well; only the states fixture holds the marked-line floor.
- The `$fui-brand`, `$fui-neutral` and status Sass variables only set runtime defaults; the Sass twins stay at the default whatever they are set to.

## Improvement candidates

- Add a neutral axis to the contrast lane's seeds.
- Composite `--fui-bg-hover` over the well in `read-safe-contrast.test.ts`.
- `fui/target/hit-area` and `fui/target/coarse-row` lint rules; a forced-colours pass in the screenshot matrix.
- A checkbox radius role.
- Emit `tokens.css` from the Sass build once it can resolve `color-mix()` and `calc()` like an engine.

## Landmines

- Inside a custom property declaration, a Sass fallback must be interpolated: `--x: var(--fui-y, #{$fui-y})`. Without `#{}` Sass emits the literal `$fui-y` and the fallback silently does nothing. Gated by `token-fallback-contract.test.ts`.
- Never declare `--fui-seed-*` in the themed block: a nested `[data-fui-theme]` would reset to default seeds.
- Constants no input reaches (`--fui-base-font-size`, the type scale) are declared once on `:root`, not in the themed block; static readers only read `:root`.
- The derive uses products, never `pow()`: Firefox rejects `pow()` on channel keywords.
- Component modules never read `--fui-seed-*` or `@use` the seeds, derive, computed or defaults partials. `fui/layer/no-seed-read` fails `lint:styles`.
- Never register a rem token with `@property`. Never set a 14px root in an app.
- Reduced motion sets `transition-duration: 0.01ms`, so `getComputedStyle` right after a seed change reports the transition's start value. Colour probes turn transitions off.
- A colour probe read through `color(from …)` is repainted under forced colours; `readSystemColor` sets `forced-color-adjust: none`.
- Layout reads snap lengths to 1/64px. Prettier keeps line breaks in long custom-property values, so compare formulas with whitespace collapsed.
- Chromium stores a legacy `rgba()` alpha in 8 bits and WebKit does not; the snapshot check allows WebKit one 8-bit step per channel.
- `button-reset` sets `user-select: none`; non-button include sites (Prompt, Editor textareas) restore `user-select: text`.
- `*.ui-notes.md` is excluded from the package tarball. Do not point consumers at it.

## Log

- **2026-10-05 — selected is not focus.** `--fui-control-selected-border` moves from the selection colour (`--fui-control-checked-bg`) to `--fui-field-border`; the twins follow (#3d5ae8 → #8b857d light, #587cff → #746f68 dark). `--fui-border-strong` was the first candidate and fails 3:1 (1.2 to 1.5:1), so the ring takes the field edge (UIR-D146). The wash is unchanged. `--fui-sidebar-item-active-border` defaults to `transparent` (UIR-D152).
- **2026-10-04 — light ladder re-tuned.** Light canvas 0.94 → 0.97 (chroma ×0.5 → ×0.35), band 0.953 → 0.95, sheets and popups 0.985 → 0.998 (chroma ×0.25 → ×0.1), tint surface 0.985 → 0.998. Fields are white sheets in light. Dark is unchanged. Why: the light canvas read grey and muddy, sheets barely lifted off it, and band-filled fields looked recessed.
