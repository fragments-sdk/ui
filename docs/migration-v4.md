# Migrating from v3 to v4

v4 is a hard cut. Weak variants, duplicate props and deprecated token aliases are removed with no
compatibility shims, and `NavigationMenu`, `DashboardLayout` and `BentoGrid` are gone. This guide
lists every name that changed and what to do at each call site.

## Upgrade steps

1. Install v4: `pnpm add @usefragments/ui@^4` (or `npm install @usefragments/ui@^4`).
2. Run your type checker. Removed components, props and types show up as errors.
3. Search your stylesheets and inline styles for the old token names in the table. A removed
   `--fui-*` custom property has no alias, so a read of one renders nothing instead of failing.
4. If you configure the theme in Sass (`@use "@usefragments/ui/scss" with (...)`), check each
   variable you pass against the table. Sass stops with an error on a variable the module no
   longer declares.
5. Review your screens. Rows marked "None: a value change" change how something looks, not its
   name.

## Reading the table

- **Old** is the v3 API, token, value or behaviour.
- **New** is what replaces it in v4.
- **How to migrate** is what to change at a call site. A rename or a deletion is mechanical, so a
  find-and-replace does it. "None" means no source change is needed.

There is one row per old name. When one old name splits into several new ones, **New** lists each.

## Every change

| Old | New | How to migrate |
| --- | --- | --- |
| `$fui-brand` / `--fui-color-accent` default `#f56138` | `#3d5ae8`, set as `--fui-seed-brand` on `:root` | To keep the old brand, set `--fui-seed-brand: #f56138` on `:root` (or `$fui-brand` in `@use … with`) |
| `$fui-brand-is-default` (ink primary buttons while the brand was the default) | Removed: the primary button is the accent for every brand | Delete `$fui-brand-is-default` from `@use … with ()` |
| `$fui-danger` / `--fui-color-danger` `#c44732` | `#d13d1f`, set as `--fui-seed-danger` | To keep it, set `--fui-seed-danger: #c44732` |
| `$fui-success` / `--fui-color-success` `#2c8c5f` | `#2fbf8f`, set as `--fui-seed-success` | To keep it, set `--fui-seed-success: #2c8c5f` |
| `$fui-warning` / `--fui-color-warning` `#c4922a` | `#f2a100`, set as `--fui-seed-warning` | To keep it, set `--fui-seed-warning: #c4922a` |
| `$fui-info` / `--fui-color-info` `#3d7aa8` | `oklch(0.58 0.13 245)`, set as `--fui-seed-info` | To keep it, set `--fui-seed-info: #3d7aa8` |
| `configureTheme()` writing derived roles (`--fui-color-accent`, `-hover`, `-active`, `--fui-focus-ring-color`, `--fui-color-danger-hover`, status fills) | `configureTheme()` writes only `--fui-seed-*`; the stylesheet derives every role from them | Drop hand-set hover, press and ring overrides next to `configureTheme()`; read the computed token instead of the inline value |
| Sass colour engine: `_palettes.scss`, `$palettes`, `$palette-paper`, `get-palette()`, `palette-shade()`, `contrast-color()`, `wcag-contrast()`, `ensure-contrast()`, `is-dark-color()`, every `derive-*()` function, `computed.$computed-*` colours | Deleted: colour derives in the browser from `--fui-seed-*` (`_derive.scss` writes the expressions) | Replace each call with the token it computed (`var(--fui-color-accent-text, $fui-color-accent-text)`); set seeds instead of computing colours in Sass |
| Sass twins `$fui-*` and `$fui-dark-*` following `$fui-brand` and `$fui-neutral` | Fixed Glass literals from `_defaults.generated.scss`; only the custom properties follow the seeds | Read `var(--fui-x)` where a value must follow the theme; the twin is a fallback only |
| `$fui-neutral` (`"paper"` only) | A colour or `"paper"`; also the runtime input `--fui-seed-neutral` | None: additive |
| `--fui-bg-primary` `#faf8f5` / `#171614` | `#fffefd` / `#1a1918`, a lightness step of `--fui-seed-neutral` | None: a value change; review screens |
| `--fui-bg-elevated` `#ffffff` / `#262421` | `#fffefd` / `#272624` | None: a value change; review screens |
| `--fui-bg-tertiary` `#f2ede7` / `#1e1c19` | Removed: use `--fui-bg-secondary` for a well (the band) or `--fui-body-bg` for the canvas | Rename to `--fui-bg-secondary`; a page background reads `--fui-body-bg` |
| `--fui-main-bg` | Removed: use `--fui-app-canvas-bg` (the canvas, `--fui-body-bg`) | Rename to `--fui-app-canvas-bg` |
| `--fui-app-canvas-bg` | The canvas role, reading `--fui-body-bg` | None: keep reading it |
| `--fui-bg-subtle` `#fdfcfa` / `#1b1a17` | Removed: use `--fui-bg-secondary` | Rename to `--fui-bg-secondary` |
| `--fui-code-bg` (its own value) | Removed: use `--fui-bg-secondary`; a code well is the band | Rename to `--fui-bg-secondary` |
| `--fui-border-default` | Removed: use `--fui-border` | Rename to `--fui-border` |
| `--fui-border-subtle` `#3c2d1e12` / `#343029ad` | Removed: use `--fui-border` | Rename to `--fui-border` |
| `--fui-border` translucent `#3c2d1e1a` / `#343029` | Opaque `#e2dfda` / `#2c2a28`, a lightness step of the neutral | None: a value change; review screens |
| `--fui-border-strong` translucent `#3c2d1e2e` / `#4a4641` | Opaque `#d4d0ca` / `#373532` | None: a value change; review screens |
| `--fui-text-primary` `#1d1c1a` / `#f0ede9` | `#1b1916` / `#eee9e0` | None: a value change; review screens |
| `--fui-text-secondary` `#59544f` / `#b6b0a8` | `#4f4b45` / `#b8b3aa` | None: a value change; review screens |
| `--fui-text-tertiary` `#58534c` / `#8d8780` | `#67625a` / `#99948b` | None: a value change; review screens |
| Field edges (the field recipe: `Input`, `Textarea`, `Select`, `Combobox` and the rest), the `Checkbox` box and the `Switch` off track, on `--fui-border` or `--fui-border-strong` | `--fui-field-border`, a boundary of at least 3:1 on every plane | None: a value change; review screens |
| `--fui-scrollbar-track`, `--fui-scrollbar-thumb`, `--fui-scrollbar-thumb-hover` (computed from the palette) | `transparent`, `var(--fui-border-strong)`, `var(--fui-field-border)` | None: a value change; review screens |
| `--fui-bg-hover` ink 1 at 7% / 9% | Ink 1 at 6% / 8% | None: a value change; review screens |
| `--fui-bg-active` ink 1 at 14% / 16% | Ink 1 at 11% / 14% | None: a value change; review screens |
| `--fui-opacity-disabled` `0.5` | `0.45` | None: a value change; review screens |
| `--fui-control-selected-bg` ink 1 at 12% / 14% | The selection colour (`--fui-control-checked-bg`) at 12% | None: a value change; review screens |
| `--fui-control-selected-border` `transparent` | `var(--fui-control-checked-bg)`, the selection ring | None: a value change; review screens |
| `--fui-control-checked-bg` `var(--fui-color-accent)` | The brand clamped and solved to 3:1 on every plane (`#3d5ae8` / `#587cff` at the default) | None: a value change; review screens |
| `--fui-focus-ring-color` (fixed per mode) | The brand clamped and solved to 3:1 (`#3d5ae8` / `#6890ff`) | None: a value change; review screens |
| `--fui-link-ink` `#9a3412` / `#f56138` | `var(--fui-color-accent-text)` | None: a value change; review screens |
| `--fui-color-on-accent` (`#000000` on the old brand) | Black or white, picked at relative luminance 0.1791 (`#ffffff` on the default) | None: a value change; review screens |
| `--fui-color-accent-hover` / `-active` `#df4d22` / `#ca3800` | The accent mixed away from its label at 86% / 76% (`#344dc8` / `#2e44b0`) | None: a value change; review screens |
| `--fui-color-{accent,danger,success,warning,info}-tint` (seed at 18% over transparent) and `-wash` | The seed mixed into the surface at the Glass percentages; opaque | None: a value change; review screens |
| `--fui-color-{accent,danger,success,warning,info}-text` (a 72% mix with black) | The seed clamped in lightness and solved to 4.5:1 on every plane and its own tint; `-border` follows it | None: a value change; review screens |
| `--fui-color-{danger,success,warning,info}-on-fill`, `-fill-hover`, `-fill-active`, `--fui-color-danger-hover` | Black or white picked on the seed; hover and press move away from that label | None: a value change; review screens |
| `--fui-control-height-{xs,sm,md,lg}` literal 24 / 28 / 32 / 40px | `calc(var(--fui-scale, 1) * 1.5rem)` to `2.5rem`: rem against the host, scaled with `--fui-scale`, and the one height family (same values at a 16px host and scale 1) | None at the default scale and host |
| `--fui-shadow-sm` / `-md` / `-lg`: a second value under `:root[data-theme="dark"]` and `:root.dark` | One value with `light-dark()` colour stops: it follows `color-scheme`, so dark scopes and an OS-dark page with no `data-theme` get the dark shadow | An override on `:root` now applies in both modes; to keep a light-only override, write its colour stops as `light-dark(<yours>, <dark default>)` |
| `--fui-button-primary-base`, `-hover`, `-active`, `-color` reading the accent ramp directly | The same colours through the primary chrome switch (`color-mix()` on `--_fui-chrome`); `data-chrome="ink"` paints them in ink | None: the same colour under the default chrome; read the computed value, not the declared one |
| `--fui-seed-neutral` chroma used in full by planes, inks and lines | Chroma capped at 0.04 in the plane expression | None: a value change only for a neutral above chroma 0.04; review screens |
| `configureTheme({ neutral })`: a palette name, never written | `"paper"` or any CSS colour, written as `--fui-seed-neutral`; `stone`, `ice`, `sand`, `earth`, `fire` and `fragments` warn and do nothing | Delete a retired palette name; pass a colour to tint the planes |
| A `ThemeProvider` inside another `ThemeProvider` (wrote `data-theme` and storage on `<html>`) | A scope: one `<div data-fui-theme>` with its own mode and inputs; it persists only with its own `storageKey` | A nested provider meant to switch the page moves to the root, or calls `useTheme().setMode` |
| Root `ThemeProvider` leaving `color-scheme` on `<html>` to the stylesheet | Writes `color-scheme` inline on `<html>` with the resolved mode | Delete app code that sets `document.documentElement.style.colorScheme` beside the provider |
| `html { font-size: 14px }` (the library set the root) | No root font size: the host's size is 1rem (16px by default); type, space and control heights are rem against it | Rem the app writes itself was 14px per rem; multiply it by 0.875 to keep its size, and set `font-size: var(--fui-type-ui-standard-size)` on `body` to keep 14px body text. Never set a 14px root: every library length shrinks by an eighth |
| `$fui-base-font-size` / `--fui-base-font-size` `14px` | `16px`, the host the rem values are written against (`spacing.baseFontSize`) | None: a value change; review screens |
| `fui-unit()`, `$fui-base-unit` / `--fui-base-unit` (the 7px grid) | Removed: use `--fui-raw-space-*` (`measurements.raw-space()` in Sass) | Replace `fui-unit(N)` with the nearest `var(--fui-raw-space-M, #{measurements.raw-space(M)})` |
| `$fui-space-px` / `--fui-space-px` `1px` | Removed: use `--fui-stroke-hairline` (1px) | Rename to `--fui-stroke-hairline` |
| `$fui-space-0-5` / `--fui-space-0-5` 2.1px (on the 14px root) | Removed: use `--fui-raw-space-2` (2px) | Rename to `--fui-raw-space-2` |
| `$fui-space-0-75` / `--fui-space-0-75` 3.01px (on the 14px root) | Removed: use `--fui-raw-space-4` (4px) | Rename to `--fui-raw-space-4` |
| `$fui-space-1` / `--fui-space-1` 7px (on the 14px root) | Removed: use `--fui-raw-space-6` (6px) | Rename to `--fui-raw-space-6` |
| `$fui-space-2` / `--fui-space-2` 14px (on the 14px root) | Removed: use `--fui-raw-space-12` (12px) | Rename to `--fui-raw-space-12` |
| `$fui-space-3` / `--fui-space-3` 21px (on the 14px root) | Removed: use `--fui-raw-space-20` (20px) | Rename to `--fui-raw-space-20` |
| `$fui-space-4` / `--fui-space-4` 28px (on the 14px root) | Removed: use `--fui-raw-space-24` (24px) | Rename to `--fui-raw-space-24` |
| `$fui-space-5` / `--fui-space-5` 35px (on the 14px root) | Removed: use `--fui-raw-space-32` (32px) | Rename to `--fui-raw-space-32` |
| `$fui-space-6` / `--fui-space-6` 42px (on the 14px root) | Removed: use `--fui-raw-space-40` (40px) | Rename to `--fui-raw-space-40` |
| `$fui-space-8` / `--fui-space-8` 56px (on the 14px root) | Removed: use `--fui-raw-space-48` (48px) | Rename to `--fui-raw-space-48` |
| `$fui-space-10` / `--fui-space-10` 70px (on the 14px root) | Removed: use `--fui-raw-space-64` (64px) | Rename to `--fui-raw-space-64` |
| `$fui-space-12` / `--fui-space-12` 84px (on the 14px root) | Removed: use `--fui-raw-space-64` (64px) | Rename to `--fui-raw-space-64` |
| Component padding and gaps on the 7px grid (7 / 14 / 21 / 28px and the rest) | The nearest raw-space step (6 / 12 / 20 / 24px), the same table as the `--fui-space-*` aliases | None: a value change; review screens |
| `--fui-popup-padding`, `--fui-popup-item-padding-block` 7px | 6px (`--fui-raw-space-6`) | None: a value change; review screens |
| `--fui-popup-item-padding-inline` 14px | 12px (`--fui-raw-space-12`) | None: a value change; review screens |
| `--fui-kbd-padding-x` 3px | 4px (`--fui-raw-space-4`) | None: a value change; review screens |
| `$fui-font-size-2xs` / `--fui-font-size-2xs` 10px | Removed: use `--fui-type-caption-size` (11px) | Rename to `--fui-type-caption-size` |
| `$fui-font-size-xs` / `--fui-font-size-xs` 12px | Removed: use `--fui-type-body-compact-size` (12px) | Rename to `--fui-type-body-compact-size` |
| `$fui-font-size-sm` / `--fui-font-size-sm` 14px | Removed: use `--fui-type-ui-standard-size` (14px) | Rename to `--fui-type-ui-standard-size` |
| `$fui-font-size-base` / `--fui-font-size-base` 14px | Removed: use `--fui-type-ui-standard-size` (14px) | Rename to `--fui-type-ui-standard-size` |
| `$fui-font-size-md` / `--fui-font-size-md` 15px | Removed: use `--fui-type-title-sm-size` (15px) | Rename to `--fui-type-title-sm-size` |
| `$fui-font-size-lg` / `--fui-font-size-lg` 20px | Removed: use `--fui-type-title-md-size` (20px) | Rename to `--fui-type-title-md-size` |
| `$fui-font-size-xl` / `--fui-font-size-xl` 24px | Removed: use `--fui-type-title-lg-size` (24px) | Rename to `--fui-type-title-lg-size` |
| `$fui-font-size-2xl` / `--fui-font-size-2xl` 30px | Removed: use `--fui-type-display-size` (32px) | Rename to `--fui-type-display-size` |
| `$fui-font-size-3xl` / `--fui-font-size-3xl` 36px | Removed: use `--fui-type-display-size` (32px) | Rename to `--fui-type-display-size` |
| `$fui-font-size-4xl` / `--fui-font-size-4xl` 48px | Removed: use `--fui-type-display-size` (32px) | Rename to `--fui-type-display-size` |
| `$fui-font-weight-medium` / `--fui-font-weight-medium` `500` | Removed: use `--fui-font-weight-semibold` (600) | Rename to `--fui-font-weight-semibold` |
| `$fui-font-weight-bold` / `--fui-font-weight-bold` `700` | Removed: use `--fui-font-weight-semibold` (600) | Rename to `--fui-font-weight-semibold` |
| Button labels at every size, the small Badge and the Tooltip at weight 500 | 600, the strong weight (buttons, badges, tooltips and field labels) | None: a value change; review screens |
| `--fui-kbd-font-size` 10px | 11px (`--fui-type-caption-size`) | None: a value change; review screens |
| `--fui-type-*-size` and `-line` in px; `--fui-type-*-weight` a number | rem against the host (the same px at 16px); the weight reads `var(--fui-font-weight-normal, 400)` or `var(--fui-font-weight-semibold, 600)` | None at a 16px host |
| `--fui-type-caption-*` 12 / 16px, tracking 0 | 11 / 16px, tracking 0.005em | None: a value change; review screens |
| `--fui-type-ui-compact-*` 12 / 16px, weight 500, tracking -0.01em | 11 / 16px, weight 400, tracking 0.005em | None: a value change; review screens |
| `--fui-type-ui-standard-*` weight 500, tracking -0.01em | weight 600, tracking 0.005em | None: a value change; review screens |
| `--fui-type-body-compact-*` 14 / 20px, tracking 0 | 12 / 18px, tracking 0.005em | None: a value change; review screens |
| `--fui-type-body-relaxed-*` tracking 0 | tracking 0.005em | None: a value change; review screens |
| `--fui-type-title-sm-*` 16 / 24px, tracking -0.01em | 15 / 20px, tracking -0.005em | None: a value change; review screens |
| `--fui-type-title-md-*` tracking -0.02em | tracking -0.005em | None: a value change; review screens |
| `--fui-type-title-lg-*` tracking -0.02em | tracking -0.005em | None: a value change; review screens |
| `$fui-font-sans` / `--fui-font-sans` `"Onest Variable", Onest, -apple-system, …` (the face never shipped) | The system stack: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | To keep a brand face, load it and set `--fui-font-sans` on `:root` |
| `$fui-button-height-xs` / `--fui-button-height-xs` | Removed: use `--fui-control-height-xs` (24px, no value change) | Rename to `--fui-control-height-xs` |
| `$fui-button-height-sm` / `--fui-button-height-sm` | Removed: use `--fui-control-height-sm` (28px, no value change) | Rename to `--fui-control-height-sm` |
| `$fui-button-height-md` / `--fui-button-height-md` | Removed: use `--fui-control-height-md` (32px, no value change) | Rename to `--fui-control-height-md` |
| `$fui-button-height-lg` / `--fui-button-height-lg` | Removed: use `--fui-control-height-lg` (40px, no value change) | Rename to `--fui-control-height-lg` |
| `$fui-input-height-sm` / `--fui-input-height-sm` | Removed: use `--fui-control-height-sm` (28px, no value change) | Rename to `--fui-control-height-sm` |
| `$fui-input-height` / `--fui-input-height` | Removed: use `--fui-control-height-md` (32px, no value change) | Rename to `--fui-control-height-md` |
| `$fui-input-height-lg` / `--fui-input-height-lg` | Removed: use `--fui-control-height-lg` (40px, no value change) | Rename to `--fui-control-height-lg` |
| `$fui-control-track-micro` / `--fui-control-track-micro` | Removed: use `--fui-control-height-xs` (24px, no value change) | Rename to `--fui-control-height-xs` |
| `$fui-control-track-sm` / `--fui-control-track-sm` | Removed: use `--fui-control-height-sm` (28px, no value change) | Rename to `--fui-control-height-sm` |
| `$fui-control-track-md` / `--fui-control-track-md` | Removed: use `--fui-control-height-md` (32px, no value change) | Rename to `--fui-control-height-md` |
| `$fui-control-track-lg` / `--fui-control-track-lg` | Removed: use `--fui-control-height-lg` (40px, no value change) | Rename to `--fui-control-height-lg` |
| `--fui-field-track-sm` | Removed: use `--fui-control-height-sm` (28px, no value change) | Rename to `--fui-control-height-sm` |
| `--fui-field-track-md` | Removed: use `--fui-control-height-md` (32px, no value change) | Rename to `--fui-control-height-md` |
| `--fui-field-track-lg` | Removed: use `--fui-control-height-lg` (40px, no value change) | Rename to `--fui-control-height-lg` |
| `--fui-badge-track-md` / `-lg` override hooks (read with 24 / 28px fallbacks) | Removed: the md and lg badges sit on `--fui-control-height-xs` / `-sm`; the badge keeps `--fui-badge-track-sm` (20px), now a real token | Delete the override, or set `--fui-control-height-xs` / `-sm` in the badge's scope |
| `--fui-icon-lg` 20px | 18px | None: a value change; review screens |
| `--fui-field-inline-inset-md` 12px | 10px; new `--fui-field-inline-inset-xs` (8px), so the track is 8 / 10 / 10 / 16 | None: a value change; review screens |
| `$fui-duration-spin` / `--fui-duration-spin` 800ms | 700ms | None: a value change; review screens |
| `$fui-duration-shimmer` / `--fui-duration-shimmer` 2000ms | 1600ms | None: a value change; review screens |
| `--fui-radius-{sm,md,lg,xl}` under `data-fui-radius-style="subtle"`: rem on the 14px root (1.75 / 3.5 / 5.25 / 7px) | Whole px: 2 / 4 / 6 / 8px | None: a value change; review screens |
| `--fui-radius-{sm,md,lg,xl}` under `data-fui-radius-style="default"`: rem on the 14px root (3.5 / 6 / 8 / 12px) | Whole px: 4 / 6 / 8 / 12px | None: a value change; review screens |
| `--fui-radius-{sm,md,lg,xl}` under `data-fui-radius-style="rounded"`: rem on the 14px root (5.25 / 7 / 10.5 / 14px) | Whole px: 6 / 8 / 12 / 16px | None: a value change; review screens |
| `--fui-radius-{sm,md,lg,xl}` under `data-fui-radius-style="pill"`: rem on the 14px root (7 / 10.5 / 14 / 21px) | Whole px: 8 / 12 / 16 / 24px | None: a value change; review screens |
| `@property` registrations for `--fui-space-*`, `--fui-font-size-*`, `--fui-font-weight-medium` / `-bold` and the control heights | Not registered: a rem initial value depends on the root, and deprecated aliases are never registered | None: a transition on one of these now jumps instead of interpolating |
| `tokens.css` spacing and type twins `--fui-space-*` / `--fui-font-size-*` | `--fui-raw-space-*` / `--fui-type-*-size` | None: the engine suggests the new names |
| Sass internals: `computed.$computed-space-*` and the never-emitted `icon` key of `measurements.$legacy` | Deleted: `$fui-space-*` reads the raw-space scale | Read `measurements.raw-space()` or `$fui-control-height-*` |
| `Header` inner measure `calc(var(--fui-space-12) * 31)` 2604px; inline padding clamp up to 84px | 1984px (31 × `--fui-raw-space-64`); the clamp tops out at 64px | None: a value change; review screens wider than 1984px |
| `Text` `scale` `2xl` / `3xl` / `4xl` (30 / 36 / 48px) and `weight` `medium` / `bold` (500 / 700) | 32px (the display role) and 600 (semibold); the props stay until the v4 cut trims the unions | Use `scale="2xl"` for display text and `weight="semibold"` for strong text |
| `$fui-radius-sm` / `--fui-radius-sm` 4px | Removed: use `--fui-radius-indicator`, `--fui-radius` × 0.6 (3px at the default 5px) | Rename to `--fui-radius-indicator` |
| `$fui-radius-md` / `--fui-radius-md` 6px | Removed: use `--fui-radius-control`, `min(--fui-radius, control height md ÷ 2)` (5px) | Rename to `--fui-radius-control` |
| `$fui-radius-lg` / `--fui-radius-lg` 8px | Removed: use `--fui-radius-row` (8px) | Rename to `--fui-radius-row`; a card or panel corner reads `--fui-radius-surface`, a popup `--fui-radius-popup` |
| `$fui-radius-xl` / `--fui-radius-xl` 12px | Removed: use `--fui-radius-surface`, `min(--fui-radius × 2.4, 24px)` (12px) | Rename to `--fui-radius-surface` |
| `$fui-radius-l1` / `--fui-radius-l1` 8px (`--fui-radius-lg`) | Removed: use `--fui-radius-surface` (12px) | Rename to `--fui-radius-surface`; a popup or overlay corner reads `--fui-radius-popup` |
| `$fui-radius-l2` / `--fui-radius-l2` 6px (`--fui-radius-md`) | Removed: use `--fui-radius-control` (5px) | Rename to `--fui-radius-control` |
| `$fui-radius-l3` / `--fui-radius-l3` 4px (`--fui-radius-sm`) | Removed: use `--fui-radius-indicator` (3px) | Rename to `--fui-radius-indicator` |
| `tokens.css` radius twins `--fui-radius-sm` / `-md` / `-lg` / `-xl` | `--fui-radius-control`, `-indicator`, `-surface`, `-row`, `-tooltip`, `-segment` (a value an earlier twin already names is left out, so popup and overlay read as surface) | Read the role the corner serves; the old names are removed |
| `$fui-shadow-md` / `--fui-shadow-md` (two layers: `0 2px 4px -1px`, `0 1px 3px -2px`) | Removed: use `--fui-shadow-popup` (three layers: a 0.5px ring, `0 2px 5px`, `0 10px 24px`) | Rename to `--fui-shadow-popup` on a floating layer; delete it from a surface, which casts no shadow |
| `$fui-shadow-lg` / `--fui-shadow-lg` (two layers: `0 8px 12px -3px`, `0 3px 5px -4px`) | Removed: use `--fui-shadow-popup` | Rename to `--fui-shadow-popup` on a floating layer; delete it from a surface |
| Sass internals: `computed.$computed-shadow-md` / `-lg` and `computed.$computed-dark-shadow-md` / `-lg` | Deleted: `$fui-shadow-popup` and `$fui-dark-shadow-popup` | Read `var(--fui-shadow-popup, $fui-shadow-popup)` |
| `--fui-card-shadow` (inset top highlight), `--fui-card-elevated-shadow` (highlight plus two drop layers), `--fui-card-active-shadow` (inset press), `--fui-card-panel-shadow`, `--fui-card-stat-shadow` | `none`: a surface casts no shadow | None: a value change; review screens |
| Popups, menus, dialogs, drawers, the floating `Chart` tooltip, `Toast`, the `NavigationMenu` viewport, the `ColorPicker` popup, the mobile `Sidebar`, `Prompt` and `Box` `shadow="md"` / `"lg"` on `--fui-shadow-md` or `-lg` | `--fui-shadow-popup` | None: a value change; review screens |
| The pressed `Switch` and `Slider` thumbs on `--fui-shadow-md` | `--fui-shadow-sm`, the thumb shadow at rest | None: a value change; review screens |
| `$fui-transition-fast` / `--fui-transition-fast` `160ms cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Removed: use `var(--fui-duration-micro) var(--fui-ease-standard)`: 100ms `cubic-bezier(0.2, 0, 0, 1)` | Rename to `var(--fui-duration-micro) var(--fui-ease-standard)` |
| `$fui-transition-normal` / `--fui-transition-normal` `200ms cubic-bezier(0.4, 0, 0.2, 1)` | Removed: use `var(--fui-duration-enter-lg) var(--fui-ease-standard)`: 200ms `cubic-bezier(0.2, 0, 0, 1)` | Rename to `var(--fui-duration-enter-lg) var(--fui-ease-standard)` |
| `$fui-anim-offset-sm` / `--fui-anim-offset-sm`, `-md` | Removed: use `--fui-popup-travel` | Rename to `--fui-popup-travel` |
| `--fui-app-main-bg`, `--fui-app-sidebar-bg`, `--fui-sidebar-bg` | Removed: use `--fui-app-canvas-bg` | Rename to `--fui-app-canvas-bg` |
| `--fui-card-*` and `--fui-panel-*` (`-bg`, `-stat-bg`, `-border`, `-hover-border`, `-header-bg`, `-radius`, `-accent-*`, `-shadow`, `-elevated-shadow`, `-active-shadow`, `-panel-shadow`, `-stat-shadow`) | Removed: a card is `surface.plane` (`--fui-bg-primary`, `--fui-border`, `--fui-radius-surface`, no shadow); a header band reads `--fui-bg-secondary` | Replace each read with the plane, line or radius role it served; delete shadow overrides |
| `--fui-form-group-*` (`-bg`, `-border` and the rest) | Removed: `form-group-surface` paints `--fui-bg-secondary` with `--fui-border` and `--fui-radius-surface` | `-bg` → `--fui-bg-secondary`, `-border` → `--fui-border` |
| `--fui-table-bg`, `--fui-table-border`, `--fui-table-header-bg`, `--fui-table-header-border`, `--fui-table-subrow-bg` | Removed: rows are transparent over their plane; header and subrow fills read `--fui-bg-secondary`; lines read `--fui-border` / `--fui-border-strong` | Set the plane on the table's container instead of the table |
| `--fui-tabs-pill-*` / `--fui-tabs-pills-*`, `--fui-header-search-bg` | Removed: the track reads `--fui-bg-secondary`; Header search reads `--fui-bg-hover` | Delete the override |
| `--fui-kbd-bg`, `--fui-kbd-border`, `--fui-kbd-shadow`, `--fui-kbd-radius` | Removed: the key cap is the press tint `--fui-bg-active` with no edge and no shadow, at `--fui-radius-indicator` | Delete the override |
| `--fui-skeleton`, `--fui-skeleton-hi` | Removed: the bar reads `--fui-bg-secondary` with `--fui-bg-active` as its highlight | `--fui-skeleton` → `--fui-bg-secondary`, `-hi` → `--fui-bg-active` |
| `--fui-button-radius`, `--fui-button-neutral-*` (`-bg`, `-bg-hover`, `-bg-active`, `-color`, `-border`, `-border-hover`, `-shadow`, `-shadow-active`), `--fui-button-outlined-shadow`, `--fui-button-primary-shadow`, `-shadow-active` | Removed: no button shadow; neutral reads the neutral channels (`--fui-bg-hover` rest, `--fui-bg-active` hover and press); corner `--fui-radius-control` | Delete neutral and shadow overrides; restyle the primary action through `--fui-button-primary-*` |
| `--fui-badge-radius`, `--fui-sidebar-item-radius` | Removed: `--fui-radius-indicator` (Badge), `--fui-radius-control` (Sidebar rows) | Rename to the role |
| `--fui-sidebar-border`, `--fui-sidebar-footer-border` | Removed: use `--fui-border` | Rename to `--fui-border` |
| `--fui-field-selection-bg-hover`, `--fui-field-selection-border` | Removed: hover paints `--fui-bg-hover` over the selection (`selection.hover-tint`); the edge is `--fui-control-selected-border` | Delete the override |
| `--fui-color-{accent,info,success,warning,danger}-border` | Removed: a tone line reads `--fui-color-*-text` | Rename `-border` to `-text` |
| `data-fui-radius-style` writing `--fui-radius-sm` / `-md` / `-lg` / `-xl` | Writes only `--fui-radius` (5px under `default`, the profile's md step otherwise); every radius role derives from it | None: read a radius role |
| `surface-elevated` mixin (`tokens/_mixins.scss`) | Removed: `surface.plane` (`recipes/surface`) for a static surface, `overlay.surface` for a floating one | Include the recipe the surface is |
| Floating surfaces (`overlay.surface`: Popover, Menu, Select, Combobox, Command, DatePicker, ColorPicker, Dialog, Drawer, Toast): raised fill, hairline border, `--fui-radius-l1`, the popup shadow | Shadow only: `--fui-bg-elevated`, `--fui-shadow-popup`, `--fui-radius-popup` (`-overlay` for a modal or side panel), no border; forced colours draw an outline | None: a value change; review screens |
| Dialog and Drawer footer: a hairline top edge on the band | No band: the footer sits on the overlay plane with 12px below, and a hairline top edge shows only while the body above it overflows | None: a value change; review screens |
| Static surfaces (Card, BentoGrid item, the in-flow pick list): raised fill, translucent edge, row radius | `surface.plane`: `--fui-bg-primary`, the opaque `--fui-border` hairline, `--fui-radius-surface` (the in-flow pick list keeps `--fui-radius-popup`), no shadow | None: a value change; review screens |
| Card `soft` and `outline`, the tone capsule | `soft` sits on the band, `outline` is transparent; the capsule paints only its hairline in `--fui-color-*-text`, no radial wash | None: a value change; review screens |
| Field shell fill `--fui-bg-primary` at `--fui-radius-md` | `--fui-field-bg` (the sheet in light, the band in dark) with `--fui-field-border`, at `--fui-radius-control` | None: a value change; review screens |
| Pick-list rows (Menu, Select, Combobox, Command, Listbox) at `--fui-radius-l2` | `--fui-radius-row` | None: a value change; review screens |
| Inline code (prose, Markdown) on `--fui-bg-tertiary` at `--fui-radius-sm` | `--fui-bg-secondary` at `--fui-radius-indicator` | None: a value change; review screens |
| Button `outline` rest fill (the raised plane at 42%) and the neutral `soft` fill `--fui-bg-secondary` | `outline` rests on `--fui-bg-primary`; neutral `soft` rests on `--fui-bg-hover`; `soft` has no edge until more contrast gives it `--fui-border-strong` (`--fui-button-soft-border`) | None: a value change; review screens |
| Chip selected: the field-selection fill, a darker hover, a ring only on press | The selection wash plus its ring at rest, the hover tint painted over both | None: a value change; review screens |
| Table rows painted the canvas (`--fui-app-canvas-bg`) | Transparent over the plane the table sits on; the stripe and row states paint over it | None: a value change; review screens |
| `--fui-sidebar-item-active-bg` `var(--fui-bg-active)`, `--fui-sidebar-item-active-border` `transparent` | `var(--fui-control-selected-bg)` and `var(--fui-control-selected-border)`: the current item is the selection | To keep the press tint, set both on `Sidebar.Root` |
| Input key cap: raised fill, hairline edge, `--fui-kbd-shadow` | The press tint `--fui-bg-active`, no edge, no shadow | None: a value change; review screens |
| `--fui-popup-offset` set on the popup container as `var(--fui-raw-space-4)` | A root token from the `popup` measurement target, 4px × `--fui-scale`; `POPUP_OFFSET_PX` reads the same target | None: the value is unchanged at scale 1 |
| `EmptyState` inline measure 240 / 320 / 400px by size (the recipe fallbacks of `--fui-feedback-empty-max-inline-*`) | 40ch at every size, set as `--fui-feedback-empty-max-inline-sm` / `-md` / `-lg` | None: a value change; review screens |
| Target mixin hit area (`target.hit-area("micro" \| "compact")`): the role's own track, 24 / 32px × `--fui-scale` under every pointer | `max(track, --fui-hit-area)`: unchanged for a pointer at scale 1, never below 24px at a smaller scale, and 44px under a coarse pointer | None: a value change; review touch screens |
| `target.hit-size("touch")` (48px, the coarse-pointer override in Switch and Slider) | Removed: `hit-size("micro" \| "compact")` already rises to 44px under a coarse pointer | Delete any `@media (pointer: coarse)` block that sets a hit size from `hit-size("touch")`; the role covers it |
| Pick-list row (Menu, Select, Combobox, Command, Listbox) under a coarse pointer: 48px | `max(--fui-popup-row-pitch, --fui-hit-area)`: 44px under a coarse pointer, the pitch otherwise | None: a value change; review touch screens |
| Typed text under a coarse pointer: the field's type role (12px at `md`), and `font` set per component | 16px in every text-entry element (`field.size()`, `field.coarse-typed-text`), each with `font: inherit`; `field.size($size, $typed: false)` opts a trigger out | None: a value change; a custom text field built on `field.size()` gets 16px too |
| `--fui-focus-ring-color` registered as a `<color>` (`@property`) | An unregistered custom property, so it can hold `Highlight` under forced colours; it no longer interpolates in a transition | Do not transition the ring colour; a stylesheet that registered it again must use `syntax: "*"` |
| Under `(forced-colors: active)`: `--fui-focus-ring-color` and the edge roles kept their light or dark values | The ring is `Highlight`; `--fui-border` (`-default`, `-strong`), `--fui-field-border`, `--fui-control-selected-border`, `--fui-field-selection-border` are `CanvasText` | None: a value change under forced colours only |
| Component, recipe and `@property` CSS shipped unlayered, so a library selector with more specificity beat a consumer class | Every library rule sits in a cascade layer (`fui.tokens`, `fui.base`, `fui.components`), so unlayered consumer CSS always wins | Remove `!important` and doubled selectors written to beat library styles; a consumer stylesheet in its own layer must order that layer after `fui.components` |
| Button and IconButton press: `scale: 0.96` while active | `--fui-press-scale` (0.985), never on a popup trigger, a pending or disabled action, or under reduced motion | None needed; to keep a deeper press set `--fui-press-scale` on `:root` |
| A disabled control inside a disabled container (Fieldset): dimmed twice, 0.45 × 0.45 | Dimmed once at the outermost disabled element (0.45) | None needed; a custom disabled wrapper that sets `opacity` should include `mixins.disabled-state` instead |
| Button pending: `aria-busy="true"` styled by the consumer, label and width free to change | `pending` prop: nothing for 1s, then the label hides in place, a spinner shows, the width holds and presses are swallowed | `<Button aria-busy="true">` → `<Button pending>` |
| Disabled Button: always removed from the tab order | `focusableWhenDisabled` keeps it focusable with `aria-disabled="true"` (default unchanged) | Pass `focusableWhenDisabled` where an unavailable action should still be found by keyboard and announce why |
| Action md inline inset 12px, icon-side inset 10px | 10px and 8px | None needed; a Button pinned to an exact width may lose 4px |
| Button and IconButton label at md and lg: the 14px `ui-standard` role | 11px (`ui-compact`) at micro, sm and md; 12px (`body-compact`) at lg; the strong weight at every size | None needed; set `size="lg"` where a larger label is wanted |
| Globals `:focus-visible`: a 1px ring at 24% of the ring colour, two halo shadows | The one focus ring: 2px solid, 2px outside, in `--fui-focus-ring-color` | A consumer element that relied on the faint ring now shows the full ring; remove a local `outline: none` only through `focus.delegated` |
| Field focus: the edge turned `--fui-color-accent`, the ring the state colour at 34% | The edge keeps its state colour; the ring is the focus ring in every state | None needed |
| Invalid field edge: `--fui-color-danger` | `--fui-color-danger-text` | None needed |
| Current nav item (Header, NavigationMenu, Pagination, TableOfContents, Sidebar): the selection wash; NavigationMenu also turned the text accent | `--fui-bg-active`, ink 1, the semibold weight, no ring | None needed |
| `--fui-table-row-selected-border`: `var(--fui-border-strong)` | `var(--fui-control-selected-border)` | To keep the old edge, set `--fui-table-row-selected-border: var(--fui-border-strong)` |
| `--fui-sidebar-item-active-bg`: `var(--fui-control-selected-bg)` | `var(--fui-bg-active)` | To keep the old fill, set `--fui-sidebar-item-active-bg: var(--fui-control-selected-bg)` |
| Nav panel rows, table rows and Sidebar items: their own track under every pointer | `max(own track, --fui-hit-area)`: unchanged for a pointer, 44px under a coarse pointer | None needed; a fixed-height layout of rows on touch devices grows |
| Field hover: no change; read-only: same as editable | Hover darkens the edge toward ink 1; read-only is a dashed edge on the field fill (the sheet in light, the band in dark) | None needed |
| IconButton hit area: 32px on `sm` only, none on md and lg | Every size draws `max(own track, --fui-hit-area)`: `sm` is its own 28px track for a pointer, every size 44px under a coarse pointer | None needed; icon buttons packed closer than 44px apart on touch screens now overlap their hit areas, so space them with a `Stack` gap |
| Select and Combobox: a highlighted selected row filled with `--fui-field-selection-bg-hover` | The wash and ring stay, with the hover tint painted over them; Select and Combobox no longer read `--fui-field-selection-bg-hover` (Chip and DatePicker still do) | A theme that set `--fui-field-selection-bg-hover` for pick-list rows should set `--fui-field-selection-bg` or `--fui-bg-hover` instead |
| Small popups (Menu, Select, Combobox, Popover, Tooltip, DatePicker, ColorPicker, Header nav menu): fade plus `scale(0.95)` (and a few pixels of travel on Popover and Tooltip) over `--fui-transition-fast` (160ms) | Still: appear and leave in 0ms (`--fui-duration-enter` / `-exit`), no scale, no travel, through `popup.motion` | None needed; a consumer popup that wants the old grow should own its motion rather than restyle a library popup |
| Popover `sideOffset` default 8; Tooltip `sideOffset` default 6 | 4 (`POPUP_OFFSET_PX`) for both | Pass `sideOffset={8}` or `sideOffset={6}` where the old gap mattered |
| Popup positioners: the headless library's collision padding (5px) | 8px (`POPUP_COLLISION_PADDING_PX`) on every popup positioner | None needed; a popup at a viewport edge now sits 8px in |
| Menu viewport: `block-size` transition when a submenu changes the list height | Removed: the height changes in the same frame | None needed |
| Dialog popup: fade plus `scale(0.95)` and `--fui-anim-offset-md` travel, 200ms in and out | Opacity only: 200ms in (`--fui-duration-enter-lg`), 100ms out (`--fui-duration-exit-lg`), on `--fui-ease-standard` (`overlay.motion`) | None needed |
| Drawer panel: slides in and out from its side over `--fui-transition-normal` | Fades like the dialog (200ms in, 100ms out); `transform` moves only with a swipe, and under reduced motion only opacity transitions | None needed; a test that waited for the slide transform should wait for opacity |
| Dialog and Drawer backdrop exit: 200ms | 100ms (`--fui-duration-exit-lg`), opacity only | None needed |
| Toast entry: `toastEnter` keyframes (rise plus `scale(0.95)`) | Removed: the toast appears in place | None needed; remove any override of the `toastEnter` animation |
| Skeleton keyframes `skeleton-shimmer`, painted in each module | `fui-skeleton-shimmer` from `recipes/_skeleton.scss` (`skeleton.band`); under reduced motion one still band | Rename `skeleton-shimmer` to `fui-skeleton-shimmer` in consumer overrides |
| Loading spinner keyframes `spin`, stopped under reduced motion | `fui-loading-spin` from `recipes/_loading.scss`; keeps turning under reduced motion | Rename `spin` to `fui-loading-spin` in consumer overrides |
| Loading delays decided per caller | `useLoadingPhase(loading)` returns `idle`, `quiet` (under 1s), `loading` or `slow` (past 10s); `LOADING_DELAY_MS`, `LOADING_SLOW_MS` | None: additive |
| Alert dismiss: the alert unmounts and focus falls to the page | Focus moves to the next focusable item (else the one before) in the same frame; `useDismiss` and `nextFocusTarget` exported for other dismissible surfaces | None needed |
| `useAnnounce`: two live regions per mounted hook, created with their first message | One shared polite and one shared assertive region per document, mounted empty; repeats before they land are read once | None needed; a test that queried the hook's own region should query `[data-fui-announcer]` |
| No errbox recipe: errors drawn per surface | `feedback.errbox`, `errbox-icon`, `errbox-words`, `errbox-actions` mixins | None: additive |
| No working recipe | `working.area`, `working.text`, `working.keyframes`; tokens `--fui-working-sweep-duration` (1800ms) and `--fui-working-sheen-duration` (2400ms) | None: additive |
| Globals under reduced motion: every `animation` and `transition` cut to 0.01ms | Only smooth scrolling is turned off; each component holds its own motion still | A consumer animation that relied on the blanket must add its own `@media (prefers-reduced-motion: reduce)` block |
| Tabs indicator and Prompt beam under reduced motion: still only through the globals blanket | Their own reduced-motion blocks: the indicator jumps, the beam holds still | None needed |
| Action controls (Button, IconButton, segments, menu triggers) forced to the semibold weight by `action.base` | Labels take the size step's regular weight; a component that needs the strong weight includes `action.weight("strong")` | A consumer override that expected semibold labels sets `font-weight: var(--fui-font-weight-semibold, $fui-font-weight-semibold)` itself |
| `action.motion` and `interactive-base` on `--fui-transition-fast` (160ms) or `--fui-transition-normal` (200ms) | `--fui-duration-micro` (100ms) on `--fui-ease-standard`, for background, border, colour, shadow, opacity and scale | None needed |
| Hover styles drawn on every pointer, including touch | Hover drawn only under `@media (hover: hover)` (`action.hover`, Tabs ghost and default tabs) | A consumer hover override wraps itself in `@media (hover: hover)` |
| `layout.page-gutter()` 24px | 16px | A page that wants the wider gutter sets its own inline padding with `--fui-raw-space-24` |
| Current nav item (`navigation.link-active`, `selection.current`): press tint, ink 1, strong weight, no ring | The selection wash plus the 1px selection ring, ink 1, regular weight (Header, Pagination, TableOfContents, NavigationMenu) | None needed; screenshots of nav change |
| `boolean.card` mixin (`recipes/_boolean-range.scss`) | removed: `choice-card.root` and `choice-card.size($size)` from `recipes/_choice-card.scss` | Replace `@include boolean.card($size)` with `@include choice-card.root; @include choice-card.size($size)` |
| Outline Checkbox and RadioGroup item: raised fill, outer accent ring when checked | The surface fill and hairline; checked takes the selection wash and its hairline becomes the 1px selection ring | None needed |
| ToggleGroup `soft`: colour-mixed pill track and `--fui-form-group-*` hooks | The segmented track (band, hairline, control radius, pad 2) with the lifted thumb at the strong weight; the hooks are not read | Drop overrides of `--fui-form-group-*` on soft ToggleGroups |
| Tabs `soft`: tinted list and `--fui-tabs-pills-*` hooks | The same segmented track and thumb as ToggleGroup `soft`; `Tabs.List` carries `data-size` | Drop overrides of `--fui-tabs-pills-*` |
| Skeleton keyframes `fui-skeleton-shimmer` (a travelling highlight) and the `--fui-skeleton` / `--fui-skeleton-hi` hooks | `fui-skeleton-pulse`: the press tint pulses over the band on the bar's `::after`; the hooks are not read | Rename `fui-skeleton-shimmer` to `fui-skeleton-pulse` in consumer overrides; a consumer `::after` on a skeleton bar must move to a wrapper |
| `Card` `variant` `solid` / `soft` / `outline` | Removed: one card, the surface plane with the hairline | Delete the prop |
| `Card` `tone` `accent` / `warning` | Removed: `tone` is `neutral` or `danger`; put a warning in an Alert inside the card | Drop accent; move a warning card's message into `<Alert tone="warning">` |
| `Card` / `Card.Body` `padding` `sm` / `lg` | `padding` `none` or `md` (the compact inset) | `sm` and `lg` become `md` |
| `Card` with `onClick` (a clickable div) | `Card` `render={<a href />}` or `render={<button />}`: a real link or button; `selected` marks the held card | Move the handler onto the element passed to `render` |
| `CardRoot`, `CardHeader`, `CardTitle`, `CardDescription`, `CardBody`, `CardFooter` (flat exports) | `Card`, `Card.Header`, `Card.Title`, `Card.Description`, `Card.Body`, `Card.Footer` | Rewrite the import and the JSX tag |
| `Box` `background` `primary` / `secondary` / `tertiary` / `elevated` | `Box` `plane` `surface` / `band` / `canvas` / `raised` | Rename the prop and map the value |
| `Box` `shadow` `sm` / `md` / `lg` | Removed: static boxes cast no shadow; floating surfaces own shadow | Delete the prop |
| `Box` `padding` `none`-`xl` | `Box` `inset` `none` / `compact` (12) / `default` (16) | `none` stays; `xs` and `sm` become `compact`; `md` and up become `default` |
| `Box` `paddingX` / `paddingY` | Removed: use `inset` | Pick the `inset` role that matches the larger axis |
| `Box` `margin` / `marginX` / `marginY` | Removed: the parent owns spacing (`Stack` `gap`) | Move the space to the parent Stack or Grid gap |
| `Box` `rounded` `sm` / `md` / `lg` | `Box` `radius` `control` / `nested` / `surface` | `sm` becomes `control`, `md` and `lg` become `surface`; a box inside a surface takes `nested` |
| `Box` `rounded` `full` | Removed: pills belong to Badge, Chip and Avatar | Use the component that owns the pill |
| `Box` `borderTop` / `borderBottom` / `borderLeft` / `borderRight` | `Box` `border` `block-start` / `block-end` (logical sides) | `borderTop` becomes `border="block-start"`, `borderBottom` becomes `border="block-end"`; by hand for left and right |
| `Box` `borderColor` `default` / `strong` / `accent` / `danger` | Removed: `border` draws the one hairline, `--fui-border` | Delete the prop; a state edge is an Alert |
| `Box` `color`, `display`, `overflow` | Removed: Text owns ink, Stack and Grid own layout, ScrollArea owns scrolling | Move each to the component that owns it |
| `Box` `width` / `minWidth` / `maxWidth` / `height` / `minHeight` / `maxHeight` | Removed: size the box with `className` or the parent layout | Move the size into a class |
| `BentoGrid`, `BentoGrid.Item`, `BentoGridProps`, `BentoGridItemProps`, `ResponsiveSpan` | `Grid` with `Grid.Item` `colSpan` / `rowSpan` around a `Card` | Rewrite the mosaic as a Grid with spanning items |
| `Text` `role` `ui-compact` / `ui-standard` / `body-compact` / `body-relaxed` | `Text` `type` `control` (ui-compact) or `body` (the rest) | Map the role value |
| `Text` `role` `title-sm` / `title-md` / `title-lg` | `Text` `type` `title` (15) or `display` (24) | `title-sm` and `title-md` become `title`; `title-lg` becomes `display` |
| `Text` `role` `eyebrow` | `Text` `type` `section-label` | Rename the value |
| `Text` `scale`, `font`, `letterSpacing` | Removed: pick a `type` | Choose the role whose size matches the old scale step |
| `Text` `weight` | `Text` `strong` (the semibold weight) | `weight="semibold"`, `"medium"` or `"bold"` becomes `strong`; `"normal"` is deleted |
| `Text` `role` (the type step) and the `TextRole` type | `Text` `type` and the `TextType` type; `role` is the ARIA attribute again (`variant` stays chrome only) | Rename `role=` to `type=` on `Text`; rename `TextRole` to `TextType` |
| `Separator` `soft` | Removed: no rule takes opacity; a quieter break is more `gap` | Delete `soft`; raise `gap` where the break should read quieter |
| `Text` `color` `muted` | `Text` `color` `tertiary` | Rename the value |
| `Badge` `variant` `soft` / `outline` / `ghost`, `BadgeVariant` | Removed: one badge, the tone tint | Delete the prop and the type import |
| `Badge` `size` `sm` / `md` / `lg` | Removed: one 20px badge | Delete the prop |
| `Badge` `dotPulse`, `dotColor`, `active` | Removed: the dot takes the tone ink and never animates | Delete the props |
| `Avatar` `size` `xs` / `sm` / `md` / `lg` / `xl` (24 / 32 / 40 / 48 / 64) | `Avatar` `size` `xs` / `sm` / `md` / `lg` on the control tracks (24 / 28 / 32 / 40), default `xs` | Keep the step whose pixel size is nearest; `xl` becomes `lg` |
| `Avatar` `shape` `circle` / `square` | Removed: every avatar is the rounded square | Delete the prop |
| `Avatar` `color`, `customSize`, `imageStyle` | Removed: initials paint the accent tint; use `className` for one-off sizing | Delete the props |
| `Avatar.Group` overlap (one step for every size) | Per size: none on xs (the tiles meet and the ring parts them), sm 2px, md 2px, lg 4px, so no stacked avatar covers a wide pair of initials beside it | None: a value change; review screens |
| `Alert` `tone` `success` | Removed: a pass is a `Badge` verdict, a confirmation is a `Toast` | Move a confirmation to Toast and a standing pass to a Badge |
| `Alert` `emphasis` `tint` / `surface` | Removed: the tint is the only treatment | Delete the prop |
| `AlertRoot`, `AlertIcon`, `AlertBody`, `AlertTitle`, `AlertContent`, `AlertActions`, `AlertAction`, `AlertClose`, `useAlertContext` | `Alert`, `Alert.Icon`, `Alert.Body`, `Alert.Title`, `Alert.Content`, `Alert.Actions`, `Alert.Action`, `Alert.Close` | Rewrite the import and the JSX tag; `useAlertContext` has no replacement |
| `EmptyState` `size` `lg` | `EmptyState` `size` `md`: size changes padding only | `lg` becomes `md` |
| `EmptyState` `variant` `ghost` / `outline` | Removed: the state never draws its own frame | Delete the prop; frame a reserved region with its Card |
| `EmptyStateRoot`, `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateActions`, `useEmptyStateContext` | `EmptyState`, `EmptyState.Icon`, `EmptyState.Title`, `EmptyState.Description`, `EmptyState.Actions` | Rewrite the import and the JSX tag |
| Hand-drawn keycaps (`<kbd>` styled per component) | `Kbd` and `Kbd.Group`: the press-tint keycap | Render shortcuts as `<Kbd>`; glyph keys pass `label` |
| `--fui-badge-dot-color` | Removed: the dot paints the tone ink (`currentColor`) | Delete the override |
| `--fui-feedback-empty-max-inline-lg`, the `feedback.empty-state` Sass recipe | Removed with `size="lg"`: `--fui-feedback-empty-max-inline-sm` / `-md` remain, and EmptyState authors its own sizes | Rename the override to `-md`; replace an `@include feedback.empty-state(...)` with the EmptyState component |
| Segmented selection (soft Tabs, ToggleGroup, Prompt modes; ThemeToggle is cut): the selection wash plus an inset selection ring | The thumb: `--fui-bg-primary`, a hairline `--fui-border` ring and `--fui-shadow-sm` | None needed |
| Button `variant="outline"` | `variant="soft"`: the neutral secondary, a quiet tint with no border | Rename `variant="outline"` to `variant="soft"` on `Button` |
| Button `tone="info"`, `tone="success"`, `tone="warning"` | removed: the tone matrix is `solid` accent or danger, `soft` and `ghost` neutral or danger, `link` accent or neutral; a tone outside the matrix falls back to the variant default | Drop the status tone (status sits in a Badge or Alert beside the action); a type error flags each pair outside the matrix |
| Button `icon` (icon-only square button) | `IconButton` with `aria-label` | `<Button icon aria-label="X">{glyph}</Button>` becomes `<IconButton aria-label="X">{glyph}</IconButton>` |
| Button `asChild` and `as="a"` | `render`, e.g. `render={<a href="/docs" />}` or a router link; a rendered anchor keeps link semantics, and `nativeButton` overrides the inference | `<Button asChild><a href=x>Y</a></Button>` and `<Button as="a" href=x>Y</Button>` become `<Button render={<a href={x} />}>Y</Button>` |
| Button and IconButton `size`: sm, md, lg | xs (24), sm (28), md (32), lg (40); a `ComponentDefaultsProvider controlSize="xs"` region reaches xs | None needed; a dense row can drop to `size="xs"` |
| IconButton `variant="outline"` | `variant="soft"` | Rename `variant="outline"` to `variant="soft"` on `IconButton` |
| IconButton `pressed` (a styling flag) | A real toggle: `pressed`, `defaultPressed` or `onPressedChange` set `aria-pressed`, and pressed paints the selection wash and ring | A call site that toggled `pressed` from its own `onClick` moves the update to `onPressedChange` |
| IconButton without `render` | `render`, as on Button: `render={<a href="/settings" />}` for an icon link | None: additive |
| ButtonGroup `gap`, `align`, `wrap` | removed: a ButtonGroup is one joined cluster (no gap, one row, hairline dividers); spaced buttons are a `Stack direction="row"` | A ButtonGroup with `gap` other than none becomes a `Stack direction="row" gap=…`; drop `align` and `wrap` |
| ButtonGroup without a name | `role="group"` with a required `aria-label` or `aria-labelledby` | Name each ButtonGroup for what its buttons act on |
| Link `color` (primary, secondary, tertiary) | `tone="neutral"`: ink 1 at rest, no hover colour change (the underline is the cue); `tone="accent"` (default) reads the link ink | Drop `color`; `color="secondary"` or `"tertiary"` becomes `tone="neutral"` |
| Link `underline` (always, hover, none, dotted) | removed: a link is always underlined with a hairline at the 3px offset | Drop `underline`; text that must not underline is not a Link (use Button `variant="link"` for an action) |
| Link `asChild` | `render`, e.g. `render={<RouterLink to="/" />}` | `<Link asChild><X …>Y</X></Link>` becomes `<Link render={<X … />}>Y</Link>` |
| `--fui-link-underline-offset: 0.2em` | 3px, shared by Link, Button `link` and prose links | None needed |
| Chip `variant` (soft, outline), `tone`, `size` and `avatar` | removed: one look (24 high, band fill, hairline, control radius); a leading avatar goes in `icon` | Drop `variant`, `tone` and `size`; rename `avatar` to `icon` |
| Chip as a button always | A static `<span>` unless `selected` or `onClick` is set (or it sits in a Chip.Group); then a toggle button with `aria-pressed`. A removable chip's remove control is its own button, named by `removeLabel` | A chip that must be focusable passes `selected` or `onClick` |
| Chip.Group `onChange` | `onValueChange(values: string[])`; the group is `role="group"` and needs `aria-label` or `aria-labelledby` | Rename `onChange` to `onValueChange` on `Chip.Group`; add a name |
| ToggleGroup `variant` (soft, ghost, outline) and `gap` | removed: one look, the segmented track with the lifted thumb | Drop `variant` and `gap` on `ToggleGroup` |
| ToggleGroup `onChange` and `selectionMode` | `onValueChange(value: string)`; `multiple` makes the value a `string[]` | Rename `onChange` to `onValueChange` on `ToggleGroup`; drop `selectionMode` |
| ToggleGroup as a radiogroup of radios with `aria-checked` | A `role="group"` of toggle buttons with `aria-pressed`; a chosen segment stays chosen when pressed again | Tests that query `radiogroup` or `radio` query `group` and `button` with `aria-pressed` |
| ToggleGroup `size`: sm, md, lg | xs, sm, md, lg; new `fullWidth` | None needed |
| `ThemeToggle`, `ThemeButton`, `Theme.Toggle`, `Theme.Button` and their prop types | removed: a ToggleGroup wired to `useTheme` (System, Light, Dark; System first), or an `IconButton` calling `toggleMode` | Replace with the colour-mode composition from the ToggleGroup and Theme docs |
| Theme `componentDefaults` prop | `<ComponentDefaultsProvider controlSize=…>` inside the Theme | `<Theme componentDefaults={{ controlSize: x }}>` becomes `<Theme><ComponentDefaultsProvider controlSize={x}>` |
| `ComponentDefaultsProvider value={{ controlSize }}` | `ComponentDefaultsProvider controlSize` | Hoist `value.controlSize` to the `controlSize` prop |
| `useResolvedControlSize(explicit, fallback)` | `useResolvedControlSize(explicit, steps?)`: the provider size resolves to the nearest of the control's steps (sm, md, lg unless the control passes `CONTROL_SIZES`) | A custom control passes the steps it draws instead of a fallback size |
| `Field` `size` | Removed: the control inside owns its height (`size` on Input, Select, Textarea, Combobox, NumberField) | Move `size` from `<Field>` to the control inside it |
| `Input` `label`, `helperText`, `required` chrome (the built-in label row and asterisk) | `<Field>` with `Field.Label`, `Field.Description` and `Field.Required`; `required` stays as the native attribute | Wrap in `<Field>`, move `label` to `<Field.Label>` and `helperText` to `<Field.Description>` |
| `Input` `error` (boolean) | `invalid` on the Input, or `invalid` on its Field, plus a `Field.Error` that says why | Rename `error` to `invalid`; move the reason from `helperText` into `<Field.Error match>` |
| `Input` `withFieldWrapper` | Removed: Input never renders a wrapper; it is bare by default | Delete the prop |
| `Input` `onChange(value: string)` | `onValueChange(value)`; `onChange` is the native change event | Rename `onChange` to `onValueChange` where the handler takes a string |
| `Input` `shortcutBehavior="focus-input"` (global focus hotkey) | Removed: `shortcut` is a display-only hint; the app registers the key | Register the hotkey in the app and focus the input through a ref |
| `Input` `rootProps` | Removed: there is no wrapper element | Move the attributes to the Input or to an element around it |
| `Input` `inputStyle` | `style` on the Input | Rename `inputStyle` to `style` |
| `Input` `inputClassName` | `className` on the Input (the field box) | Rename `inputClassName` to `className` |
| `Input` `className` / `style` on the wrapper div | On the field box itself | None: review layout classes that targeted the wrapper |
| `Input` `size` `sm \| md \| lg` | `xs \| sm \| md \| lg` (24, 28, 32, 40) | None: additive |
| `Textarea` `rows` | `minRows`; the field grows with its text to `maxRows` | Rename `rows` to `minRows` |
| `Textarea` `resize="horizontal"` / `resize="both"` | Removed: `none` or `vertical` only; width never resizes | Replace with `vertical` |
| `Textarea` `showCharCount` | Removed: the counter shows whenever `maxLength` is set | Delete the prop; drop `maxLength` where no counter is wanted |
| `Textarea` `label`, `helperText` | `<Field>` with `Field.Label` and `Field.Description` | Wrap in `<Field>` and move both |
| `Textarea` `error` | `invalid`, plus a `Field.Error` that says why | Rename `error` to `invalid` |
| `Textarea` `onChange(value: string)` | `onValueChange(value)`; `onChange` is the native change event | Rename `onChange` to `onValueChange` where the handler takes a string |
| `Textarea` `rootProps` | Removed: the wrapper only appears with a counter and takes no props | Move the attributes to the Textarea or an element around it |
| `Select` `variant="outline"` | Removed: the one field look is the default | Delete the prop |
| `Select` `variant="ghost"` | Removed: style a quiet trigger in the consuming component, or use Menu with a Button trigger | Give `Select.Trigger` a class that clears the edge and fill, or rebuild as Menu |
| `SelectVariant` type | Removed | Delete the import |
| `Select` `onChange` | `onValueChange` | Rename `onChange` to `onValueChange` |
| `Select` `label`, `helperText`, `error` | `<Field>` with `Field.Label`, `Field.Description` and `Field.Error`; `invalid` on the Select | Wrap in `<Field>`, move the text into its parts, rename a boolean `error` to `invalid` |
| `Select` root `className` and the wrapper div | Removed: the root renders no element; style `Select.Trigger` | Move `className` to `<Select.Trigger>` |
| `Select` `size` `sm \| md \| lg` | `xs \| sm \| md \| lg` (24, 28, 32, 40) | None: additive |
| `Select` list over the trigger (item-aligned) | The list opens beside the trigger | None: review screens |
| `Combobox` `onChange` | `onValueChange` | Rename `onChange` to `onValueChange` |
| `Combobox` `label`, `helperText`, `error` | `<Field>` with `Field.Label`, `Field.Description` and `Field.Error`; `invalid` on the Combobox | Wrap in `<Field>`, move the text into its parts, rename a boolean `error` to `invalid` |
| `Combobox` root `className` and the wrapper div | Removed: the root renders no element; style `Combobox.Input` | Move `className` to `<Combobox.Input>` |
| `Combobox` built-in "No results found" | "No match for “query”", or "No options" with nothing to filter; `Combobox.Empty` still overrides | None: review copy assertions in tests |
| `Form` `onFormSubmit` | `onSubmit` | Rename `onFormSubmit` to `onSubmit` |
| `Form` `onClearErrors` | Removed (it was never called): a field's server error clears when the field is edited | Delete the prop |
| `Input.Root` | `Input` (it has no parts) | `<Input.Root` to `<Input` |
| `Form.Root` | `Form` (it has no parts) | `<Form.Root` to `<Form` |
| Flat part exports `FieldRoot`, `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`, `FieldValidity`, `FieldRequired` | `Field`, `Field.Label`, `Field.Control`, `Field.Description`, `Field.Error`, `Field.Validity`, `Field.Required` | `FieldX` to `Field.X` |
| Flat part exports `FieldsetRoot`, `FieldsetLegend`, `FieldsetDescription` | `Fieldset`, `Fieldset.Legend`, `Fieldset.Description` | `FieldsetX` to `Fieldset.X` |
| Flat part exports `ComboboxRoot`, `ComboboxInput`, `ComboboxTrigger`, `ComboboxContent`, `ComboboxItem`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxGroupLabel` | `Combobox` and its dot parts (`Combobox.Input` …) | `ComboboxX` to `Combobox.X` |
| `Input type="search"`: Escape always stopped at the field | Escape clears a filled search and stops there; on an empty search it blurs and propagates, so a surrounding Dialog or Popover closes | None: behaviour change; a test that expects the first Escape to stay in an empty search now sees the overlay close |
| Field, ColorPicker and Slider labels each styled on their own | One `field.label` recipe: body-compact, semibold, ink 1; a disabled field dims the label only | None: a value change; review screens |
| `ColorPicker` error text as a styled helper line | `Field.Error` (announced, in `aria-describedby`); helper text is `Field.Description` | None: markup change; tests query the error by its text or `aria-describedby`, not a class |
| `Dialog` `modal` prop | Removed: Dialog is always modal, with a scrim | Delete `modal`; a non-blocking panel moves to `Popover` or `Drawer modal="trap-focus"` |
| `Dialog.Content width="xl"` / `width="full"` | `width` is `sm` · `md` · `lg` | `xl` and `full` become `lg` |
| `asChild` on `Dialog.Trigger` / `Dialog.Close` | `render={<Button … />}` with the label as the part's children | `<Dialog.Trigger asChild><Button …>Label</Button></Dialog.Trigger>` becomes `<Dialog.Trigger render={<Button … />}>Label</Dialog.Trigger>` |
| A confirm or delete flow built on `Dialog` | `AlertDialog` (`role="alertdialog"`, no outside-press dismiss, focus on `AlertDialog.Cancel`, a 500ms settle window on `AlertDialog.Action`) | Move the question to `AlertDialog` with `AlertDialog.Cancel` and `AlertDialog.Action` |
| Dialog sheet: bordered modal shell, title 20/28, 24px section insets | The raised sheet on the popup shadow with no edge, title 15/20, 16px insets, a body that scrolls on its own and joins the tab order only when it overflows | None: a visual change; review screens |
| `Drawer.Content side="left"` / `side="right"` | `side="start"` / `side="end"` (follow the writing direction) | `left` becomes `start`, `right` becomes `end` |
| `Drawer.Content side="top"` | Removed: `start` · `end` · `bottom` | Move a top sheet to `bottom` or to `Dialog` |
| `Drawer.Content width` (`sm` · `md` · `lg` · `xl` · `full`) | `size` (`sm` · `md` · `lg`): the width on start and end, the height on bottom | Rename `width` to `size`; `xl` and `full` become `lg` |
| `Drawer.Content backdrop` | `Drawer modal`: `true` draws the scrim, `"trap-focus"` traps focus without one, `false` leaves the page usable | `backdrop={false}` becomes `modal="trap-focus"` on the root; drop `backdrop` |
| `Drawer swipeDirection` / `Drawer.SwipeArea swipeDirection` | Derived from `side` (dismiss toward the drawer's own edge) | Delete the prop |
| `Drawer.Content viewportProps` | Removed | Style the drawer through `Drawer.Content className` |
| `asChild` on `Drawer.Trigger` / `Drawer.Close` | `render={<Button … />}` | As for Dialog |
| `Popover.Content size="lg"` | `size` is `sm` · `md` | `lg` becomes `md` |
| `Popover.Content sideOffset` | Removed: every popup sits the library's popup offset from its anchor | Delete the prop |
| `Popover.Content positionerClassName` | Removed | Style the panel through `Popover.Content className` |
| `asChild` on `Popover.Trigger` / `Popover.Close` | `render={<Button … />}` | As for Dialog |
| Popover panel border and bordered arrow; title 14/600 | The raised panel on the popup shadow with no edge; the arrow is fill only; title 12/550 | None: a visual change |
| `Tooltip arrow` | Removed: a tooltip has no arrow | Delete the prop |
| `Tooltip sideOffset` | Removed: the library's popup offset | Delete the prop |
| `Tooltip.Root` | `Tooltip` | Rename `Tooltip.Root` to `Tooltip` |
| `Tooltip.Provider delayDuration` / `skipDelayDuration` | `delay` / `timeout` | Rename the props |
| HTML attributes passed to `Tooltip` itself (forwarded to the popup) | `contentProps={{ … }}` | Move `className`, `style`, `id` and `data-*` from `Tooltip` into `contentProps` |
| `Tooltip closeOnClick` default `false` | Default `true`: a press on the trigger closes the tooltip | Pass `closeOnClick={false}` where the tooltip must stay through a press |
| Tooltip delay with no provider: 600ms every time | 500ms cold, then 0ms for the next tooltip within 300ms (warm); a disabled control still shows its tooltip; `shortcut` adds a key | None: behaviour |
| `Menu.Item danger` | `tone="danger"` | `danger` becomes `tone="danger"` |
| `Menu.Item checked` | `Menu.CheckboxItem` / `Menu.RadioItem` (a check in the leading column) | Move a checked row to `Menu.CheckboxItem checked` or a `Menu.RadioGroup` |
| `Menu.Content sideOffset` | Removed: the library's popup offset | Delete the prop |
| `asChild` on `Menu.Trigger` | `render={<Button … />}` | As for Dialog |
| Menu radio dot indicator | A check, like every selected menu row | None: a visual change |
| `Toast tone="info"` / `useToast().info()` | `tone="neutral"` / `useToast().toast()` | `info` becomes `neutral`; `info(…)` becomes `toast({ … })` |
| `useToast().error()` | `useToast().danger()` | Rename `error(` to `danger(` on the `useToast()` result |
| `ToastProvider position` `top-left` · `top-right` · `bottom-left` · `bottom-right` | `bottom-end` (default) · `bottom-center` · `top-center` | `bottom-right` becomes `bottom-end`; the other corners become `bottom-end` or `top-center` |
| `ToastProvider duration` default 8000, any value | Default 5000; anything under 5000 is raised to 5000; 0 keeps a toast until dismissed | Drop short durations; pass `0` for a toast that must stay |
| `ToastProvider max` (default 5, drops the oldest) | Removed: three on screen, the rest queued in order | Delete the prop |
| A toast with an action stays until dismissed | It keeps the provider duration (five seconds, paused on hover, focus and window blur); the action closes it | Pass `duration: 0` where an action toast must stay |
| `Toast` props `id`, `duration`, `onPause`, `onResume`; the `ToastData` type | Removed from the static `Toast`; `ToastInput` (`id`, `duration`) is what `useToast().toast()` takes | Pass those fields to `toast({ … })`, not to `<Toast>` |
| Toast: tone wash, tone border and tone ink; action as a link button; `role="alert"` for warning | The raised plane with no edge; the tone is the icon's ink only; the action is a small ghost button; only danger announces urgently | None: a visual and announcement change |
| `Command hosted` | Removed: Command is frameless; `Command.Dialog` is the floating palette | Delete `hosted`; a Command inside `Dialog` moves to `Command.Dialog` |
| `Command.Item onItemSelect` | `onSelect` (the Menu verb) | Rename the prop |
| Command root `role="search"`, `Command.Empty role="option"`, no active row until an arrow key | No landmark; Empty is not an option; the first match is active on mount and after every search change, sorted by score | None: behaviour; Return now runs the first match |
| `Command.Separator` line and group lines | Space between groups; group labels separate them | None: a visual change |
| Flat part exports `DialogRoot`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`, `DialogClose` | `Dialog` and its dot parts (`Dialog.Trigger` …) | `DialogX` to `Dialog.X` |
| Flat part exports `AlertDialogRoot`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogBody`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction` | `AlertDialog` and its dot parts (`AlertDialog.Cancel` …) | `AlertDialogX` to `AlertDialog.X` |
| Flat part exports `DrawerRoot`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerBody`, `DrawerFooter`, `DrawerClose`, `DrawerSwipeArea` | `Drawer` and its dot parts (`Drawer.SwipeArea` …) | `DrawerX` to `Drawer.X` |
| Flat part exports `CommandRoot`, `CommandInput`, `CommandList`, `CommandItem`, `CommandGroup`, `CommandEmpty`, `CommandError`, `CommandSeparator`, `CommandDialog` | `Command` and its dot parts (`Command.Dialog` …) | `CommandX` to `Command.X` |
| `Command` search as a 40px track with a hairline below | The search is a field inside the palette (field shell, hover and focus ring), inset by the popup inset | None: a value change; review screens |
| `Menu.Content` without a busy state | `loading` on `Menu.Content`: busy at once, and after a second a spinner row below the rows it has | None: additive |
| `Loading` `kind` (`spinner`, `dots`, `pulse`, `fragments`) and the `LoadingKind` type | Removed: one spinner | Delete `kind` |
| `Loading` `size` (`sm`, `md`, `lg`, `xl`) and the `LoadingSize` type | Removed: one size, the icon md (16px); `inline` sizes it to the text (1em) | Delete `size`; inside a line of text add `inline` |
| `Loading` `color` (`accent`, `current`, `muted`) | Removed: the spinner follows `currentColor` | Delete `color`; set `color` on a parent where it must differ |
| `Loading` `centered` | `fill` (centres the spinner in its parent) | Rename `centered` to `fill` |
| `Loading` `overlay` | Removed: dim the waiting content in place, or use `Loading.Screen` for a full-page wait | Replace the overlay with the content's own busy state, or `Loading.Screen` |
| `Loading.Inline`, `LoadingInline`, `LoadingInlineProps` | `<Loading inline />`, `LoadingProps` | `<Loading.Inline …/>` to `<Loading inline …/>`; drop its `size` |
| `Loading.Screen` `kind`, `size`, `color` and the fragments symbol | Removed: one spinner on the canvas, with `label` and `showLabel` | Delete `kind`, `size` and `color` from `Loading.Screen` |
| `Loading` shows at once | Shows after `delay` (default 1000ms); the status region stays mounted and empty until then | Pass `delay={0}` where the spinner must show at once (tests, fixtures) |
| `ThinkingIndicator` `kind` (`dots`, `pulse`, `spinner`) and the `ThinkingKind` type | Removed: one row with the work wash and a selection-colour dot | Delete `kind` |
| `ThinkingIndicator` `steps` (data array) and the `ThinkingStep` data type (`ThinkingStepType` in the barrel) | `ThinkingIndicator.Steps` with `ThinkingIndicator.Step label status` children | Map `steps={[{ id, label, status }]}` to `<ThinkingIndicator.Steps>{steps.map((s) => <ThinkingIndicator.Step key={s.id} label={s.label} status={s.status} />)}</ThinkingIndicator.Steps>` |
| `StepStatus` `"streaming"` | `"pending"` | Rename `status="streaming"` to `status="pending"` on steps |
| `useThinkingIndicatorContext` | Removed | Read `active` from your own state |
| `Message` `role` (`user`, `assistant`, `system`) and the `MessageRole` type | `from` (`user`, `assistant`) and `MessageFrom`; a system line is `ConversationList.Event` | Rename `role=` to `from=` on `Message`; replace `role="system"` messages with `<ConversationList.Event>…</ConversationList.Event>` |
| `Message.Content` `markdown` | Removed: an assistant string always renders as markdown; a user string keeps its line breaks | Delete `markdown`; pass a node to opt out of markdown |
| Default user and assistant avatars on `Message` | No avatar unless `avatar` is passed (usually `Message.Avatar`) | Pass `avatar={<Message.Avatar …/>}` where avatars are wanted; delete `avatar={null}` |
| Error state as styling on the message | `status="error"` adds `Message.Error` (an alert with Try again when `onRetry` is set) | Pass `onRetry`; move custom error copy into `<Message.Error>` |
| `ConversationList` `showAvatars` | Removed: avatars are opt-in per `Message` | Delete `showAvatars` |
| `ConversationList` `autoScroll={true}` (always follow) and `AutoScrollBehavior` `boolean` | `autoScroll` `"smart" \| false`; `"smart"` is the default | `autoScroll={true}` to `autoScroll="smart"` |
| `ConversationList` `scrollTopThreshold`, `scrollBottomThreshold` | Removed: one follow distance | Delete both |
| `ConversationList` `loadingHistory` | `history` (`"idle" \| "loading" \| "error"`) with `onRetryHistory` | `loadingHistory={x}` to `history={x ? "loading" : "idle"}` |
| `ConversationList` `onScrollTop(event)` | `onScrollTop()` with no argument | Read scroll position from your own ref if the handler used the event |
| `ConversationList.DateSeparator`, `DateSeparator`, `DateSeparatorProps` | `ConversationList.Event` (`date`, `format`, or children for an event), `ConversationListEventProps` | Rename `ConversationList.DateSeparator` and `DateSeparator` to `ConversationList.Event` |
| `ConversationList.TypingIndicator`, `TypingIndicator`, `TypingIndicatorProps` | `ThinkingIndicator` as the last child | Replace with `<ThinkingIndicator label="…" />` |
| `useOptionalConversationList` | Removed: `useConversationList` inside the list | Call `useConversationList` only inside `ConversationList` |
| `Prompt` `variant` (`outline`, `ghost`) and the `PromptVariant` type | Removed: one field, toolbar on the same plane | Delete `variant` |
| `Prompt` `placement` (`inline`, `fixed`, `sticky`) and the `PromptPlacement` type | Removed: the page places the composer | Delete `placement`; position the wrapper in page CSS |
| `Prompt` `loading` | `pending` (sending) or `working` with `onStop` (responding) | Rename `loading` to `pending`; use `working` + `onStop` while the reply streams |
| `Prompt` `autoResize` | Removed: the text area always grows between `minRows` and `maxRows` | Delete `autoResize`; `autoResize={false}` becomes `maxRows` equal to `minRows` |
| `Prompt` `onChange(value)` | `onValueChange(value)` | Rename `onChange` to `onValueChange` on `Prompt` |
| `Prompt.Tabs`, `Prompt.Tab`, `PromptTabsProps`, `PromptTabProps` | Removed: put Tabs above the composer, or a `Prompt.Picker` | Move modes into a `Prompt.Picker` or page-level Tabs |
| `Prompt.ActionButton`, `PromptActionButtonProps` | An `IconButton` (ghost, sm) in `Prompt.Toolbar` | `<Prompt.ActionButton …>` to `<IconButton variant="ghost" size="sm" …>` |
| `Prompt.ModeButton`, `PromptModeButtonProps` | `Prompt.Picker` (one of a few options) or a `Toggle` | Replace a mode toggle with `Prompt.Picker` options or a `Toggle` |
| `Prompt.Select` | `Prompt.Picker` (`aria-label`, `options`, `value`, `onValueChange`) | Map the select options to `Prompt.Picker options` |
| `Prompt.Usage`, `PromptUsageProps` | `Prompt.Info` with your own words | Render usage text in `Prompt.Info` |
| `CodeBlock` `theme` and the `CodeBlockTheme` type (12 bundled highlighter themes) | Removed: one css-variables theme that follows the mode through `--fui-code-token-*` | Delete `theme`; set `--fui-code-token-*` to restyle syntax colours |
| `CodeBlock` `bg` | Removed: the block is the band | Delete `bg` |
| `CodeBlock` `filename` | `title` (in the header inside the block) | Rename `filename` to `title` |
| `CodeBlock` `title` as a label above the block | `title` in the header inside the block | None needed; screenshots change |
| `CodeBlock` `caption` | Removed: put the caption in the surrounding text | Move the caption into a `Text` after the block |
| `CodeBlock` `compact` | `size="sm"` | `compact` to `size="sm"` |
| `CodeBlock` `persistentCopy`, `copyPlacement` and the `CodeBlockCopyPlacement` type | Removed: copy is always visible, in the header when titled, over the first line otherwise | Delete both |
| `CodeBlock` `collapseAction` (`lines`, `expand`) | Removed: one fold bar (Show N more lines / Show less) | Delete `collapseAction` |
| `TabbedCodeBlock` `theme`, `copyPlacement`, `tabsVariant`, `collapseAction` | Removed; `size` forwards to every panel | Delete the four props |
| Copy result as an aria-label swap (`Copied!`) | A visible status: Copied, or Couldn't copy in the danger ink, for two seconds; the button stays Copy code | Tests query `role="status"` instead of the button name |
| Barrel exports `MessageRoot`, `MessageContent`, `MessageActions`, `MessageTimestamp`, `MessageAvatar`, `MessageError` | `Message` and its dot parts (`Message.Content` …) | `MessageX` to `Message.X` |
| Barrel exports `ConversationListRoot`, `ConversationListEvent` | `ConversationList`, `ConversationList.Event` | `ConversationListX` to `ConversationList.X` |
| Barrel exports `LoadingRoot`, `LoadingScreen` | `Loading`, `Loading.Screen` | `LoadingScreen` to `Loading.Screen`, `LoadingRoot` to `Loading` |
| `TabbedCodeBlock` (flat export) | `CodeBlock.Tabbed` | `<TabbedCodeBlock` to `<CodeBlock.Tabbed` |
| `ConversationList` history rows (`history="loading"`, `history="error"`) inside the scrolling log | Above the log, outside `role="log"`, so they stay in view and are not announced as messages | None: markup change |
| `Checkbox` `onChange` | `onCheckedChange` | Rename `onChange` to `onCheckedChange` on `Checkbox` |
| `Checkbox` `size` (`sm`, `md`, `lg`) | Removed: one 16px box | Delete `size` from `Checkbox` |
| `Checkbox` `description` | `helperText` | Rename `description` to `helperText` on `Checkbox` |
| `Checkbox` `controlClassName`, `contentClassName` | Removed: style the row with `className` | Move the styles onto `className` on the row, or drop them |
| `RadioGroup` `onChange` | `onValueChange` | Rename `onChange` to `onValueChange` on `RadioGroup` |
| `RadioGroup` `size` (`sm`, `md`, `lg`) | Removed: one 16px circle | Delete `size` from `RadioGroup` |
| `RadioGroup` `error` (string) | `invalid` plus `errorMessage` | `error="x"` becomes `invalid errorMessage="x"` |
| `RadioGroup` `wrapperClassName` | `className` (on the wrapper) | Rename `wrapperClassName` to `className` |
| `RadioGroup` `groupClassName` | Removed: style the group through `className` | Target the radiogroup inside `className`, or drop it |
| `RadioGroup` `groupId` | `id` (now on the radiogroup element) | Rename `groupId` to `id`; a wrapper selector that read `id` now reads `className` |
| `RadioGroup` `ref` and `id` on the outer wrapper | On the radiogroup element | A ref that measured the wrapper now gets the radiogroup |
| `RadioGroup.Item` `description` | `helperText` | Rename `description` to `helperText` on `RadioGroup.Item` |
| `RadioGroup.Item` `controlClassName`, `contentClassName` | Removed: style the row with `className` | Move the styles onto `className` on the item, or drop them |
| `Switch` `onChange` | `onCheckedChange` | Rename `onChange` to `onCheckedChange` on `Switch` |
| `Switch` `size` (`sm`, `md`, `lg`) | Removed: one 36×18 track | Delete `size` from `Switch` |
| `Switch` `description` | `helperText` | Rename `description` to `helperText` on `Switch` |
| `Switch` label and helper inside the switch element | Beside it, in a `label` row; the switch is named by `aria-labelledby` | None: review tests that read the switch's text content |
| `Slider` `onChange` | `onValueChange` | Rename `onChange` to `onValueChange` on `Slider` |
| `Slider` `valueSuffix` | `format` (`Intl.NumberFormatOptions`) and `locale` | `valueSuffix="%"` on a 0–100 scale becomes `max={1} format={{ style: "percent" }}`; units use `style: "unit"` |
| `Slider` `error` | `invalid` plus `errorMessage` | Rename `error` to `invalid`; add the `errorMessage` |
| `Slider` fallback accessible name `"Slider"` | Removed: a development warning asks for `label`, `aria-label` or `aria-labelledby` | Give every unnamed slider a `label` or `aria-label` |
| `Slider` fill on `--fui-color-accent` | `--fui-control-checked-bg`, the selection fill | None: a value change; review screens |
| `Tabs.List` `variant` and `size` | The root's `variant` and `size`; the list follows them | Move `variant` and `size` from `<Tabs.List>` to `<Tabs>` |
| Tabs `size="lg"` | `md` (Tabs sizes are `sm` and `md`; `lg` resolves to `md`) | `size="lg"` → `size="md"` on `<Tabs>` |
| Tabs `orientation="vertical"` | Removed: tabs are horizontal; a vertical index is TableOfContents or Sidebar | Replace vertical Tabs with TableOfContents (in-page) or Sidebar (routes) |
| `Tabs.Panel` `flush` | Removed: panels have no padding; the caller pads the content | Drop `flush`; add padding inside non-flush panels |
| Flat `TabsRoot`, `TabsList`, `Tab`, `TabsPanel` exports from the module | `Tabs`, `Tabs.List`, `Tabs.Tab`, `Tabs.Panel` (the barrel only exported the compound) | `TabsList` → `Tabs.List`, `Tab` → `Tabs.Tab`, `TabsPanel` → `Tabs.Panel` |
| `Collapsible.Trigger` `asChild` | `render` | `<Collapsible.Trigger asChild><X/></…>` → `<Collapsible.Trigger render={<X/>} />` |
| `Collapsible.Trigger` `showChevron` and `chevronPosition` | One leading caret on the default trigger; a `render` trigger draws its own | Drop both props; use `render` for a trigger without the caret |
| `Collapsible.Content` `forceMount` | `keepMounted` | Rename `forceMount` to `keepMounted` |
| `CollapsibleRoot`, `CollapsibleTrigger`, `CollapsibleContent`, `CollapsibleRootProps` | `Collapsible`, `Collapsible.Trigger`, `Collapsible.Content`, `CollapsibleProps` | Rename the flat parts to the compound parts |
| `useCollapsibleContext` | Removed: read `open` from your own state with `open`/`onOpenChange` | Control the Collapsible and read the state you own |
| Collapsible `onOpenChange(open)` | `onOpenChange(open, eventDetails)` | None: additive |
| Accordion `type="single"` / `type="multiple"` | `multiple` boolean (default single) | `type="multiple"` → `multiple`; drop `type="single"` |
| Accordion `value` / `defaultValue` as a string | `string[]` (the open items) | Wrap a string value in an array; `onValueChange` receives an array |
| Accordion `collapsible` | Removed: a single accordion always closes the open item when it is pressed again | Drop `collapsible` |
| Flat `AccordionRoot`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` exports from the module | `Accordion`, `Accordion.Item`, `Accordion.Trigger`, `Accordion.Content` | Rename the flat parts to the compound parts |
| ScrollArea `scrollbarVisibility="hover"` | `auto`: shows while scrolling, on hover and while focus is inside | `"hover"` → `"auto"` |
| Breadcrumbs `separator` and `Breadcrumbs.Separator` | One caret separator drawn by the component | Drop `separator` and every `<Breadcrumbs.Separator>` |
| `Breadcrumbs.Item` `current` | The last item is the current page (never a link, `aria-current="page"`) | Drop `current`; make the current page the last item |
| `Breadcrumbs.Item` `icon` | Removed: crumbs are text | Drop `icon` |
| Breadcrumbs `maxItems` inline `…` expander | `maxItems` folds the items after the first into a menu of links | None: same prop |
| `BreadcrumbsRoot`, `BreadcrumbsItem`, `BreadcrumbsSeparator`, `BreadcrumbsSeparatorProps` | `Breadcrumbs`, `Breadcrumbs.Item` | Rename to the compound parts; drop the separator |
| Pagination `size="lg"` | `md` (Pagination sizes are `sm` and `md`) | `size="lg"` → `size="md"` |
| Pagination `edgeCount` | Removed: the first and last page always show | Drop `edgeCount` |
| `Pagination.Item`, `Pagination.Ellipsis`, `PaginationItemProps` | `Pagination.Items` (with `renderLink` for link pages) | Replace hand-placed items with `<Pagination.Items />` |
| Pagination with `totalPages` 0: an empty `<nav>` | Nothing renders | None: review layouts that reserved the space |
| Flat `PaginationRoot`, `PaginationPrevious`, `PaginationNext`, `PaginationItems` exports from the module | `Pagination`, `Pagination.Previous`, `Pagination.Next`, `Pagination.Items` | Rename the flat parts to the compound parts |
| TableOfContents `hideTitle` | `title={null}` | `hideTitle` → `title={null}` |
| TableOfContents title default "On This Page" | "On this page" | None: a copy change |
| `TableOfContents.Item` `id` | `targetId` | Rename `id` to `targetId` on `TableOfContents.Item` |
| `TableOfContents.Item` `indent` | Nesting: put the items in a `TableOfContents.Group` | Wrap indented items in a Group (`collapsible={false}` for a plain label) |
| `TableOfContents.Group` `disabled` | `collapsible={false}` | `disabled` → `collapsible={false}` |
| `TableOfContents.Group` `active` and TableOfContents `hideSubItems` | Removed: the active item carries the marking; render fewer items for a compact index | Drop both props |
| `TableOfContentsRoot`, `TableOfContentsItem`, `TableOfContentsGroup` | `TableOfContents`, `TableOfContents.Item`, `TableOfContents.Group` | Rename the flat parts to the compound parts |
| `NavigationMenu`, `NavigationMenu.List`, `NavigationMenu.Item`, `NavigationMenu.Link` | `Header.Nav` with one `Header.NavItem` per link (`href`, `active`, `render`) | `NavigationMenu` to `Header.Nav` inside a `Header`; drop `.List` (the nav renders the list); merge each `.Item` + `.Link` into one `Header.NavItem`, keeping `href` and `active` |
| `NavigationMenu.Trigger` + `NavigationMenu.Content`, `NavigationMenu.Viewport`, `NavigationMenu.Indicator` | `Header.NavMenu` (`label`, `active`) holding `Header.NavMenuItem` rows; it opens a floating menu, with no viewport or indicator | Turn each trigger and content pair into `<Header.NavMenu label="…">` with one `Header.NavMenuItem href` per link; a rich panel (columns, descriptions) becomes a plain list or its own page |
| `navigation.active-indicator($placement)`, `navigation.active-rail()`, `navigation.active-dot()`, `--fui-navigation-active-rail`, `--fui-navigation-active-dot` | removed: the current row is the selection wash and ring, with no rail or dot | Drop the include; mark the current row with `aria-current` |
| `navigation.link-states`, `navigation.link-active`, `navigation.collapsed-shell` | removed: Header, Sidebar and Main own their row states | Drop the include |
| `NavigationMenu.MobileBrand`, `NavigationMenu.MobileContent`, `NavigationMenu.MobileSection` | `Header.Trigger` opening a `Drawer` of `Sidebar.Item` rows, or the `Sidebar` mobile panel inside `AppShell` | Inside `AppShell` delete the mobile parts (`Header.Trigger` opens the sidebar panel); standalone, open a `Drawer side="left"` from `Header.Trigger onClick` and list the links as `Sidebar.Item` |
| The flat `NavigationMenuRoot`, `…List`, `…Item`, `…Trigger`, `…Content`, `…Link`, `…Indicator`, `…Viewport`, the mobile flat exports and the `NavigationMenu*Props` types | removed with the component: the `Header` parts and their `Header*Props` types | Map each flat import to the `Header` part above; `NavigationMenuLinkProps` to `HeaderNavItemProps` |
| `KEYBOARD_SHORTCUTS.NAV_TOGGLE`, `KEYBOARD_SHORTCUTS.NAV_CLOSE` | removed: `Header.NavMenu` uses the menu keys (Enter, Space, arrows, Escape) | Drop references to the two entries |
| `DashboardLayout` block and `DashboardLayoutProps` | `AppShell layout="sidebar"` with `Main` (and `Grid` for the cards); the AppShell `Dashboard` example | Rebuild the page as `AppShell` > `AppShell.Header` + `AppShell.Sidebar` + `AppShell.Main` > `Main` > `Main.Header` + `Main.Content`; put stat cards in a `Grid` |
| `Header` `height` | the `--fui-appshell-header-height` token | Move a custom height to a `--fui-appshell-header-height` override on a theme scope |
| `Header` `position="fixed"` | `position="sticky"`, or `AppShell`, where the header row never scrolls | `position="fixed"` to `position="sticky"`; remove the page's top padding that made room for it |
| `Header` `navAlign`, `container` and the `HeaderNavAlign` / `HeaderContainer` types | removed: the nav follows the brand and the bar spans its container with the 16 gutter | Drop the props; centre a nav with your own wrapper if a page needs it |
| `Header` `icons` and the `HeaderIcons` / `HeaderIconSlot` / `HeaderIconRenderState` types | `Header.Trigger` children for the glyph; the menu chevron is fixed | Pass a custom trigger glyph as `Header.Trigger` children; drop the other slots |
| `Header.Spacer` | removed: `Header.Actions` takes the free space | Delete `<Header.Spacer />` |
| `Header.MobileNav`, `Header.MobileNavLink`, `Header.MobileNavActions` and `HeaderMobileNavProps` / `HeaderMobileNavActionsProps` | `Header.Trigger` opening a `Drawer` of `Sidebar.Item` rows (standalone) or the `Sidebar` mobile panel (inside `AppShell`) | Move the mobile links into a `Drawer` opened from `Header.Trigger onClick`, one `Sidebar.Item` per link and actions in its footer; inside `AppShell` delete them |
| `asChild` on `Header.Brand`, `Header.NavItem`, `Header.NavMenuItem` | `render`, e.g. `render={<RouterLink to="/" />}` | `<Header.NavItem asChild><Link …>x</Link></Header.NavItem>` to `<Header.NavItem render={<Link … />}>x</Header.NavItem>` |
| `Header` inside `AppShell.Header` rendered a second `<header>` banner | `Header` renders a `div` there; `AppShell.Header` is the banner | None: markup only |
| `Sidebar` / `Sidebar.Provider` `width`, `collapsedWidth` | the `--fui-appshell-sidebar-width` and `--fui-navigation-sidebar-collapsed-width` tokens | Move custom widths to token overrides on a theme scope |
| `Sidebar` `position="right"` | removed: the rail sits at the inline start | Drop the prop; a right-hand panel is `AppShell.Aside` |
| `Sidebar` `activeIndicator` and the `--fui-sidebar-item-active-indicator` token | the current item takes the selection wash and ring | Delete the prop and token overrides |
| `Sidebar.Trigger` and `SidebarTriggerProps` | `Header.Trigger` (it opens the mobile panel and brings back a hidden rail) and `HeaderTriggerProps` | `Sidebar.Trigger` to `Header.Trigger` |
| `Sidebar.Overlay` and `SidebarOverlayProps` | removed: the mobile panel draws its own scrim | Delete `<Sidebar.Overlay />` |
| `Sidebar.Rail`, `SidebarRailProps` and the floating collapse toggle on the rail edge | `Sidebar.CollapseToggle` in `Sidebar.Footer`, or Cmd/Ctrl+B | `Sidebar.Rail` to `Sidebar.CollapseToggle` inside `Sidebar.Footer` |
| `asChild` on `Sidebar.Item`, `Sidebar.SubItem` | `render`, e.g. `render={<RouterLink to="/" />}` | As for the `Header` parts |
| `Sidebar.Item` `multiline` | removed: rows hold one line and truncate | Drop the prop; move secondary text to a tooltip or the page |
| `SidebarProvider`, `SidebarRoot` and the other flat `Sidebar*` component exports | `Sidebar.Provider` and the other compound parts | `SidebarProvider` to `Sidebar.Provider`; flat part imports to `Sidebar.<Part>` |
| `useSidebarContext` | `useSidebar` | Rename |
| State props on a `Sidebar` inside a `Sidebar.Provider` or `AppShell` were merged with the provider's | the provider (or `AppShell`) owns the state; props on the inner `Sidebar` are ignored with a development warning | Move `collapsed`, `defaultCollapsed`, `onCollapsedChange`, `open`, `defaultOpen`, `onOpenChange`, `collapsible` and `enableKeyboardShortcut` to the provider or `AppShell` |
| `Sidebar.MenuSkeleton` rendered a `div` | an `li`, so it sits inside the nav list; `SidebarMenuSkeletonProps` extends `HTMLLIElement` attributes | None: place it inside `Sidebar.Nav` as before |
| `--fui-sidebar-section-label-size` `var(--fui-type-body-compact-size)` | `var(--fui-type-caption-size)` | None: value change |
| `AppShell` `layout="sidebar-floating"`, `layout="floating"`, slot `variant="floating"` and `AppShellSlotVariant` | `layout="default"` or `layout="sidebar"`: canvas planes split by hairlines, no floating panels | `sidebar-floating` to `sidebar`, `floating` to `default`; delete `variant` |
| `bg` on `AppShell` and every slot | removed: the shell is canvas; `AppShell.Aside` is the surface plane | Drop the prop; recolour through theme tokens |
| `AppShell.Header` `height` | the `--fui-appshell-header-height` token | As for `Header` `height` |
| `AppShell.Sidebar` `width`, `collapsedWidth`, `position`, `activeIndicator` | the sidebar width tokens; `position` and `activeIndicator` are gone as on `Sidebar` | As for the `Sidebar` rows |
| `AppShell.Sidebar` `collapsible`, `defaultCollapsed` | the same props on `AppShell`, with the rest of the sidebar state | Move the props from `AppShell.Sidebar` to `AppShell` |
| `AppShell.Aside` `width` | the `--fui-appshell-sidebar-width-wide` token | Move a custom width to a token override |
| `AppShell.Main` `padding` and its `<main id="main-content">` element | `AppShell.Main` is the scroll pane (a `div`); put `Main` inside it, which owns `<main id="main-content">` and the 16 gutter | Delete `padding`; wrap the children of `AppShell.Main` in `<Main>` |
| The shell scrolled the page | `AppShell` is 100dvh and `AppShell.Main` scrolls, so the header row stays put and `Header` `elevatedOnScroll` does nothing inside it | Drop `elevatedOnScroll` and `position` on a `Header` inside `AppShell.Header`; scroll listeners on `window` move to the pane |
| `useAppShell`, `AppShellRoot`, `AppShellHeader`, `AppShellSidebar`, `AppShellMain`, `AppShellAside` | `useSidebar` for the state; the compound `AppShell` parts | `useAppShell` to `useSidebar`; flat part imports to `AppShell.<Part>` |
| `Main` `as` values `ul`, `ol`, `nav`, `aside`, `header`, `footer`, `article` | `as` is `main` (default), `section` or `div`; the `MainElement` type | Keep `Main` as the page region and put the list or landmark inside `Main.Content` |
| Table `size` (`sm`/`md`/`lg`) and `density` (`compact`/`regular`/`relaxed`/`condensed`) | Removed: one 32px row track (44px under a coarse pointer) | Delete `size` and `density` from `<Table>` |
| Table `striped` | Removed: rows are transparent on the table's plane; the hairline divides them | Delete `striped` from `<Table>` |
| `Table.Row` `band` | Removed: no row fill except hover, press and the selection wash | Delete `band` from `<Table.Row>` |
| `Table.Caption` `hidden` | `Table.Caption` `visuallyHidden` | Rename `hidden` to `visuallyHidden` on `<Table.Caption>` |
| `--fui-table-row-bg` hook and the `--_fui-table-*` density tracks | Removed: `--fui-table-row-track` (one track) and the `--fui-table-row-hover-bg` / `-active-bg` / `-selected-*` hooks | Move row fills to the hover, active and selected hooks |
| `recipes/table-chrome.ts`: `TableDensity`, `TableDensityInput`, `LegacyTableSize`, `TABLE_ROW_TRACKS`, `resolveTableDensity`, `resolveTableRowTrack` | `TABLE_ROW_TRACK` (32) | Read `TABLE_ROW_TRACK` where a row height is needed |
| `table-chrome.tree-cell` mixin | `table-chrome.tree-indent` (indent from `--fui-table-tree-depth`) | Rename the include |
| DataTable `size`, `density` and `striped`; the `DataTableDensity` type | Removed: DataTable composes Table and takes its one row track | Delete the props and the type import |
| DataTable `emptyMessage` (string) | `emptyState`: EmptyState parts, rendered in a row under the real header | `emptyMessage="X"` to `emptyState={<EmptyState.Title as="p">X</EmptyState.Title>}` |
| DataTable default empty copy "No data available" | "No data" | None: a copy change |
| Skeleton `radius` | Removed: each shape carries its radius (indicator, or control for `control`) | Delete `radius` |
| Skeleton `static` | Removed: reduced motion holds every bar still | Delete `static` |
| `Skeleton.Circle` | `<Skeleton shape="avatar" size=…>` (a square at the indicator radius) | `<Skeleton.Circle size="md">` to `<Skeleton shape="avatar" size="md">` |
| Skeleton `shape="button"` and `shape="input"` | `shape="control"` with `size` `sm`/`md`/`lg` (28/32/40) | Rename both shapes to `control` |
| Skeleton avatar sizes 32/40/48 | 24/32/40 (Avatar xs/sm/md) | None: a size change; review screens |
| `Skeleton.Text` `gap` | Removed: lines sit at the 18px body pitch | Delete `gap` from `<Skeleton.Text>` |
| List `marker="decimal"` | `as="ol"` (an `ol` numbers its items by default) | `marker="decimal"` to `as="ol"`, dropping the marker prop |
| List `gap="md"` | `gap="sm"` | Rename the value |
| List `gap="lg"` and `gap="xl"` | Removed: space larger groups with the parent (`Stack` gap) | Wrap the items in a `Stack` or move the spacing to the parent |
| List type and markers at the reading size (16px) | Body size (12px), markers in ink 3 | None: a value change; review screens |
| `List.Item` `icon` ignored unless `marker="icon"` | `icon` renders whenever it is passed, in the marker column | Remove icons you passed but did not want shown |
| `useListContext` (module export, not in the barrel) | Removed | None: nothing reads it |
| Progress `size` (`sm`/`md`/`lg`) | Removed: one 4px track | Delete `size` from `<Progress>` |
| Progress `tone="success"` | Removed: say done in words; `tone="neutral"` for a meter | Delete `tone="success"` |
| `Progress.Circular` / `CircularProgress`, `CircularProgressProps`, `strokeWidth` | Removed: `Progress` for a value, `Loading` for a wait | Replace a ring with `<Progress>` or `<Loading>` |
| `--fui-progress-diameter`, `--fui-progress-dash-full`, `--fui-progress-dash-quarter` | Removed with the ring | Delete overrides of these properties |
| Progress fill by animated `inline-size`; indeterminate 50% ping-pong, parked under reduced motion | `scaleX` from the start edge; a 30% travelling run, full width at half strength under reduced motion | None: a motion change; review screens |
| Progress `tone="neutral"` filled in ink 3 | The inverse plane (the strongest neutral), so a meter reads against its track | None: a value change; review screens |
| Icon `color="primary"` | removed: the default inherits `currentColor` | Delete `color="primary"` on Icon |
| Icon `color="secondary"` / `color="tertiary"` | `tone="secondary"` / `tone="tertiary"` (one ink prop) | Rename `color` to `tone` on Icon |
| Icon `tone="accent"` painting the accent fill | `tone="accent"` paints `--fui-color-accent-text` | None needed |
| Icon `weight` free string (`thin`, `light`, `duotone`) | `weight: "regular" \| "bold" \| "fill"` | `thin`/`light` → `regular`, `duotone` → `fill` |
| Icon `iconProps` | removed | Size and weight come from Icon's `size` and `weight`; label the wrapper with `aria-label` |
| `IconColor` type | removed (use `IconTone`) | Rename the type import |
| Image `rounded="none"` | `radius="none"` (the default: the container clips the corner) | Delete `rounded="none"` |
| Image `rounded="sm"` / `rounded="md"` | `radius="control"` | Rename `rounded` to `radius` and map the value |
| Image `rounded="lg"` | `radius="surface"` (or `radius="nested"` inside a padded surface) | Rename `rounded` to `radius="surface"` |
| Image `rounded="full"` | removed (use Avatar for a round picture) | A person or a round thumbnail is an Avatar |
| Image `aspectRatio="21:9"` | removed (use `16:9`) | `21:9` → `16:9` |
| Image `objectFit="fill"` / `objectFit="none"` | removed (`cover` or `contain`) | `fill` → `cover`, `none` → `contain` |
| Image `fallback` shown while loading | the frame pulses (skeleton band) while loading; `fallback` replaces only the built-in error fallback | Drop loading placeholders passed as `fallback` |
| Separator `gap="…"` | removed; the parent owns the space (Stack `gap`) | Move the space to the parent Stack `gap` |
| Separator inner `.line` span | the separator element is the rule | Selectors that styled the inner span target the separator itself |
| Separator `label` inside `role="separator"` | label is a sibling of the rule; only the first rule has the role | Queries for the label inside the separator role look beside it |
| Stack `gap={1…8}` | `gap="xs"` (1) · `"sm"` (2) · `"md"` (3) · `"lg"` (4) · `"xl"` (6); 5, 7 and 8 have no step | Map 1–4 and 6; by hand for 5, 7, 8 |
| Stack `gap={{ base, sm, md, lg, xl }}` | one `gap` token | Pick one gap; let `collapseBelow` change the flow |
| Stack `direction={{ base: "column", md: "row" }}` | `collapseBelow="<length>"` (answers the Stack's own width, not the viewport) | Choose the width below which the row folds |
| Stack `separator` / `separator={node}` | `divided` (renders Separator; list-safe) | `separator` → `divided`; by hand for custom nodes |
| Stack `data-direction-base…xl` attributes | removed | Style hooks on these attributes target the direction class |
| `--fui-stack-direction*`, `--fui-stack-gap*` | removed (private `--_fui-stack-collapse`) | Set `gap` / `collapseBelow` instead of the property |
| `resolveLayoutGap` (internal util) | removed | None (never exported) |
| Grid `columns={5 \| 7 \| 8 \| 9 \| 10 \| 11}` | `columns={1 \| 2 \| 3 \| 4 \| 6 \| 12}` or `"auto"` | Pick the nearest kept count or auto-fill |
| Grid `columns={{ base, sm, md, lg, xl }}` | `columns={N} minChildWidth="<length>"` (a ceiling answering the grid's own width) | Largest count becomes N; choose the narrowest track |
| Grid `gap={1…8}` | `gap="xs" \| "sm" \| "md" \| "lg" \| "xl"` | 1→xs, 2→sm, 3→md, 4→lg, 6→xl; by hand for 5, 7, 8 |
| Grid `padding` | removed (the shell owns the gutter; Card or Box owns inset) | Move the inset to the surrounding surface |
| Grid `repeat(N, 1fr)` tracks | `repeat(N, minmax(0, 1fr))` | None (content can no longer widen a track) |
| `--fui-grid-cols*`, `--fui-grid-min-child-width` | removed (private `--_fui-grid-min`, `--_fui-grid-max`, `--_fui-grid-gap`) | Set `columns` / `minChildWidth` / `gap` props |
| `ResponsiveColumns`, `ResponsiveDirection`, `ResponsiveGap` types | removed | See the Grid and Stack rows above |
| VisuallyHidden skip link with its own inline reveal styles | `<VisuallyHidden focusable>` (raised chip while focused) | Delete the hand-rolled reveal styles |
| Theme `defaultTheme` | `defaultMode` | Rename the prop |
| Theme / configureTheme `neutral="stone" \| "ice" \| "sand" \| "earth" \| "fire" \| "fragments"` | `neutral="paper"` or any CSS colour (retired names are plain strings now) | Delete the retired name or set `paper` |
| Theme / ThemeScript `attribute="class"` | removed; the mode is always `data-theme` on `<html>` | CSS keyed on `.dark` keys on `[data-theme="dark"]` |
| `ThemeProvider`, `Theme.Provider` | `Theme` (or `Theme.Root`) | Rename the element and import |
| `ThemeProviderProps` | `ThemeProps` | Rename the type |
| `configureTheme({ radiusStyle })` | `configureTheme({ radius })` | Pick the radius in px or a CSS length |
| `NeutralPalette`, `RadiusStyle` type exports | removed | Type neutral as `ThemeNeutral`, radius as `number \| string` |
| `useTheme().toggleMode` light ⇄ dark | steps system → light → dark → system | Call `setMode` for a two-state flip |
| `useTheme()` outside a Theme returns inert no-ops | reads and writes `data-theme` on `<html>` | None (a hook outside a Theme now works) |
| Chart config `{ label, color: "…" }` | `{ label, series: 1..6 }`; draw with `var(--fui-chart-N)` | Map each key to a series index; replace status-hue strokes/fills with series tokens |
| Chart frame custom properties `--chart-<key>` | removed | Read `var(--fui-chart-N)` for the key's series |
| `ChartTooltip`/`ChartTooltipContent` `indicator="dot \| line \| dashed"` | removed; the swatch follows the series (dashed stroke, line, filled) | Delete the prop |
| `ChartTooltip`/`ChartTooltipContent` `hideIndicator` | removed; hidden automatically for one series | Delete the prop |
| Chart with an empty `data` array drew blank axes | shows an EmptyState ("No data to show", `empty` sets the copy) | None |
| `Listbox.Item selected` + `onClick` per item | root `value` / `defaultValue` / `onValueChange` (single) or `multiple` with `string[]`; `Listbox.Item value` (required) | Lift the selected id to the root `value`; give each item a `value` |
| `Listbox.Empty` as `role="option" aria-disabled` | `role="status"` line beside the listbox (direct child of `Listbox`) | None |
| Listbox DOM: one `role="listbox"` element took `className`/`style` | an outer plane takes `className`/`style`; the inner `role="listbox"` takes the ARIA and handlers | Selectors that targeted the listbox element by class move to `[role="listbox"]` |
| ColorPicker `onChange` | `onValueChange` | Rename the prop |
| ColorPicker `description` | `helperText` | Rename the prop |
| ColorPicker `showInput={false}` | removed; the hex field always shows | Delete the prop |
| ColorPicker `error` | `invalid` + `errorMessage` | Move the error copy from `helperText` into `errorMessage` |
| ColorPicker `size="lg"` | `size="md"` | Lg → md |
| ColorPicker reverted a bad hex on blur | keeps it and flags it inline ("Enter a hex color like #3366ff") | None |
| `<DatePicker selected={d} onSelect={fn}>` / `onChange={fn}` | `<DatePicker value={d} onValueChange={fn}>` | Rename props |
| `<DatePicker mode="range" selectedRange={r} onRangeSelect={fn}>` | `<DatePicker mode="range" value={r} onValueChange={fn}>` | Rename props |
| `<DatePicker fixedWeeks>` | `<DatePicker>` (six weeks always) | Delete prop |
| `<DatePicker formatDate={f} formatRange={g}>` | `<DatePicker format={f}>` (or `locale`; ranges join with an en dash) | Keep one formatter for a single date |
| `<DatePicker error="Message">` / `error` | `<DatePicker invalid errorMessage="Message">` | Split prop |
| `<DatePicker size="lg">` | `<DatePicker size="md">` | Replace value |
| DatePicker single pick closes after 150ms | closes in the same event | No change needed |
| `<Editor size="sm" \| "md" \| "lg">` | `<Editor rows={n}>` (lines of text) | Replace with a line count |
| `formats={["heading1", "heading2", "heading3"]}` | `formats={["heading"]}` (one heading step) | Replace values |
| `<Editor toolbarIcons={…}>`, `EditorToolbarIcons`, `EditorToolbarIconSlot`, `EditorToolbarIconRenderState` | (none; glyphs come from Icon) | Delete prop and types |
| `<Editor.Separator />`, `EditorSeparator`, `EditorSeparatorProps` | `<Separator orientation="vertical" length="control" />` | Replace component |
| `EditorSize` | (none) | Delete type |
| Editor status bar on by default | on only with `maxLength` or `onAutoSave`; pass `statusBar` to force it | Add `statusBar` where counts are wanted |
| Editor named by its placeholder | `label` (visible) or `aria-label` | Add a label |
| `<LoginForm loading>` | `<LoginForm pending>` | Rename prop |
| LoginForm form error in a custom box | `Alert tone="danger"`; per-field `emailError` / `passwordError` | None (render change) |
| LoginForm "Sign In" title and button | "Sign in" | Update text queries in tests |
| `<StatsCard changeTone="warning">` | `changeTone="danger"` or `"neutral"` | Replace value |
| StatsCard `changeTone` default `success` | default `neutral`; pass `changeTone="success"` for a good change | Add `changeTone="success"` where wanted |
| `<StatsCard icon={<TrendUp />}>` (node) | `<StatsCard icon={TrendUp}>` (component, drawn neutral) | Pass the component |
| `<StatsCard value>` required | optional; null shows "—" | None |
| ActivityFeed title "Recent Activity" | "Recent activity" | Update text queries in tests |
| ActivityFeed ref on the inner list `div` | ref on the root `div` around the Card | None |
| ActivityFeed renders every item | first 5, then "Show more"; pass `limit` | Pass `limit={items.length}` to show all |
| `KEYBOARD_SHORTCUTS.EDITOR_HEADING1`, `KEYBOARD_SHORTCUTS.EDITOR_HEADING3` | removed: Editor offers only the level-2 heading command | Drop references to the two entries |
| `:root.dark` / `:root.light` class selectors set the colour scheme | removed: `data-theme="dark"` / `data-theme="light"` on `<html>` (or `Theme`) | Set `data-theme` instead of the class |
| Table unbordered first and last columns flush with the surrounding surface (0 inline inset) | The first column starts 12 in on every table, bordered or not; every other cell pads 8 | Remove padding added around a table to line its text up with a card's inset; a selected row's ring no longer touches the content |
| Table head `position: sticky` and opaque at every size (it could never stick: the wrapper is its scrollport) | `maxHeight` on Table and DataTable bounds the wrapper; the head sticks inside it and fills its plane only while rows pass under it. Unbounded heads scroll with the page and draw no band | Set `maxHeight` where the head must stay in view |
| DataTable sub-rows with no fill, expand button `size="sm"` drawn down to 24 by a module override | Sub-rows sit on the band (`--fui-bg-secondary`, yielding to the selection wash); the expand button is IconButton `size="xs"` | None: a visual change |
| Sidebar.Header showing `children` while the rail is collapsed | `collapsedContent` alone while collapsed (nothing when unset) | Pass the brand mark as `collapsedContent` |
| Flat part exports `ListRoot`, `ListItem`, `ListRow` | `List`, `List.Root`, `List.Item`, `List.Row` | Rename to the compound parts |
| Flat part exports `ListboxRoot`, `ListboxItem`, `ListboxGroup`, `ListboxEmpty` | `Listbox`, `Listbox.Root`, `Listbox.Item`, `Listbox.Group`, `Listbox.Empty` | Rename to the compound parts |
| Flat part exports `DatePickerRoot`, `DatePickerTrigger`, `DatePickerContent`, `DatePickerCalendar`, `DatePickerPreset` (root and `./datepicker`) | `DatePicker`, `DatePicker.Root`, `.Trigger`, `.Content`, `.Calendar`, `.Preset` | Rename to the compound parts |
| Flat part exports `EditorRoot`, `EditorToolbar`, `EditorToolbarGroup`, `EditorToolbarButton`, `EditorStatusIndicator`, `EditorContentArea`, `EditorStatusBar` (root and `./editor`) | `Editor`, `Editor.Root`, `.Toolbar`, `.ToolbarGroup`, `.ToolbarButton`, `.StatusIndicator`, `.Content`, `.StatusBar` | Rename to the compound parts |
| Flat part exports `ToggleGroupRoot`, `ToggleGroupItem` | `ToggleGroup`, `ToggleGroup.Root`, `ToggleGroup.Item` | Rename to the compound parts |
| Flat part exports `ThinkingIndicatorRoot`, `ThinkingSteps`, `ThinkingStep` | `ThinkingIndicator`, `ThinkingIndicator.Root`, `.Steps`, `.Step` | Rename to the compound parts |
| `FragmentsLogo` | Removed: use your own logo | Remove the library import and provide your own logo in the existing slot |
| `fragmentsLogoSvg` | Removed: use your own logo | Remove the library import and provide your own logo in the existing slot |
| `fragmentsSymbol` | Removed: use your own logo | Remove the library import and provide your own logo in the existing slot |
| `FragmentsLogoProps` | Removed: use your own logo props | Remove the library import and provide your own logo props in the existing slot |
| `FragmentsWordmark` | Removed: use your own logo | Remove the library import and provide your own logo in the existing slot |
| `FragmentsWordmarkProps` | Removed: use your own logo props | Remove the library import and provide your own logo props in the existing slot |
| `FragmentsBrand` | Removed: use your own logo | Remove the library import and provide your own logo in the existing slot |
| `FragmentsBrandProps` | Removed: use your own logo props | Remove the library import and provide your own logo props in the existing slot |
| `fragmentsWordmarkAspect` | Removed: use your own logo measurements | Remove the library import and provide your own logo measurements in the existing slot |
| `fragmentsWordmarkSvg` | Removed: use your own logo | Remove the library import and provide your own logo in the existing slot |
| `fragmentsWordmarkSymbol` | Removed: use your own logo measurements | Remove the library import and provide your own logo measurements in the existing slot |
| `NavGlyph` | Removed: use your own logo or generic icon | Remove the library import and provide your own logo or generic icon in the existing slot |
| `NAV_GLYPH_NAMES` | Removed: use your own glyph names | Remove the library import and provide your own glyph names in the existing slot |
| `NavGlyphName` | Removed: use your own glyph names | Remove the library import and provide your own glyph names in the existing slot |
| `NavGlyphProps` | Removed: use your own glyph props | Remove the library import and provide your own glyph props in the existing slot |
| `./assets/*` | Removed: use your own logo | Remove the library import and provide your own logo in the existing slot |
| `*.contract.json` | `*.meta.json` | Rename metadata files and update relative imports; review custom metadata loaders |
