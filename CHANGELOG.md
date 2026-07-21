# @usefragments/ui

## 1.3.1

### Patch Changes

- [`baec848`](https://github.com/fragments-sdk/fragments/commit/baec8480838cf5a67895ea35a67aa5ba8d782fc6) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Stop `DatePicker` from breaking consumer builds that never use it.

  `DatePicker` statically imported its optional peers (`react-day-picker` and `date-fns`), and the package barrel re-exports `DatePicker` — so importing _anything_ from `@usefragments/ui` dragged both peers into the consumer's build graph. A production `vite build` (Rolldown) then failed with `MISSING_EXPORT` for any project that had not installed them, including a freshly scaffolded app whose demo does not use the calendar at all.

  `DatePicker` now lazy-loads `react-day-picker` on first render via the same `require()` pattern the library already uses for Chart/recharts, and its default date formatting uses `Intl.DateTimeFormat` instead of `date-fns`. The built barrel no longer references either peer, so consumers build cleanly whether or not they use the date picker. Passing your own `formatDate`/`formatRange` is unchanged; the default label format drops the ordinal suffix (e.g. "April 29, 2026" rather than "April 29th, 2026").

## 1.3.0

### Minor Changes

- [#370](https://github.com/fragments-sdk/fragments/pull/370) [`8cb7390`](https://github.com/fragments-sdk/fragments/commit/8cb739095cb633e83ad78dae271f022b883445cd) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Vite / TypeScript 6 developer experience (cold-start friction P0 sweep):
  - Heavy peer dependencies (recharts, `@tanstack/*`, tiptap, react-day-picker, …) are now declared **optional** via `peerDependenciesMeta`, so an app that only uses a few primitives no longer errors on install for packages it does not use.
  - `DataTable` now lazy-loads `@tanstack/react-table` (matching `Chart`/`Editor`), removing the static `@tanstack` import edge that broke Button-only Vite builds. It throws a clear "install @tanstack/react-table" message at render time if the peer is absent.
  - Added type declarations for the `./styles` and `./globals` side-effect imports, fixing `TS2882` under `tsc` on TypeScript 6.
  - Regenerated token metadata no longer emits malformed category names derived from prose comments.

  **Breaking:** `DataTableVirtual` and `useTableVirtualizer` are no longer exported from the package root — the virtualizer wraps a hook that must resolve synchronously, so it cannot be lazy-loaded without re-introducing the static peer edge. Import them from the new dedicated subpath instead:

  ```ts
  // before
  import { DataTableVirtual, useTableVirtualizer } from "@usefragments/ui";
  // after
  import { DataTableVirtual, useTableVirtualizer } from "@usefragments/ui/data-table-virtual";
  ```

## 1.2.0

### Minor Changes

- [#354](https://github.com/fragments-sdk/fragments/pull/354) [`149666d`](https://github.com/fragments-sdk/fragments/commit/149666da5626a4066ea5f46c1c4347c5908c2edb) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add the canonical `Main` page-composition primitive and refine Checkbox radius
  overrides, static Combobox filtering, selected Chip surfaces, and
  TableOfContents alignment. Exclude local design-tool caches from the published
  UI package.

### Patch Changes

- [`4f15c8c`](https://github.com/fragments-sdk/fragments/commit/4f15c8cb478708baa66969b7dfc9047866c4a875) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Increase vertical padding on `Table` and `DataTable` body cells for easier scanning, and add background and surface fallbacks so rows and selected states render correctly without a theme provider.

- [`4f15c8c`](https://github.com/fragments-sdk/fragments/commit/4f15c8cb478708baa66969b7dfc9047866c4a875) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Stop shipping Storybook stories and internal Cloud dashboard prototypes inside the published package. The tarball now carries only the documented component surface, which cuts install size.

## 1.1.1

### Patch Changes

- [#347](https://github.com/fragments-sdk/fragments/pull/347) [`fc000ff`](https://github.com/fragments-sdk/fragments/commit/fc000ff6fcd352ffc93dd1898eab901c96a125fa) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Engine warnings now say where. Tailwind v4 theme-conflict warnings carry
  `file:line:column`, and token-definition conflicts gained an optional
  location on `TokenDefinitionFact` populated from the design-token source
  (locations are ignored when comparing logical definitions, so identical
  values never false-conflict). The warning that exposed it is also fixed:
  the private `--_item-h` custom property was declared with different calc()
  expressions in Listbox, Combobox, and Select — each is now component-scoped
  (`--_listbox-item-h`, `--_combobox-item-h`, `--_select-item-h`) with
  rendered values unchanged.

## 1.1.0

### Minor Changes

- [#324](https://github.com/fragments-sdk/fragments/pull/324) [`824a306`](https://github.com/fragments-sdk/fragments/commit/824a306f9b8d3d8f2ebd80c973f3a573e7d655b3) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add polymorphic Header brand composition, scroll elevation, centered page-width navigation, and mobile action layout.

- [#331](https://github.com/fragments-sdk/fragments/pull/331) [`0888488`](https://github.com/fragments-sdk/fragments/commit/08884882b4dc0cd785b7cdcfe7fb570e1703dd49) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add FragmentsWordmark asset and refresh token palettes/seeds/variables plus Alert, Button, CodeBlock, Popover, TableOfContents, Toast, and ToggleGroup styles for the promoted docs/landing skin.

- [#334](https://github.com/fragments-sdk/fragments/pull/334) [`8c4e9d5`](https://github.com/fragments-sdk/fragments/commit/8c4e9d50e963aeb7572d1726358260b4fa38dcbe) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Upgrade the canonical component implementation to Base UI 1.6. Forward the
  supported Base control props through `Field`, restore form, focus, swipe,
  find-in-page, AppShell, DataTable, and Menu behavior, and add public Button and
  CodeBlock theme hooks. Add `RadioGroup.groupId` for the Base 1.6 group-ID path
  without moving the wrapper's existing `id`, and add `DataTable.getRowProps` so
  row ARIA/interaction semantics no longer require post-render DOM mutation. Add
  `IconButton` contract metadata so the regenerated Fragments catalog can expose
  the already-exported component.

### Patch Changes

- [#336](https://github.com/fragments-sdk/fragments/pull/336) [`7e621c7`](https://github.com/fragments-sdk/fragments/commit/7e621c7810250b0bf705560fff21bf6dac29736f) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Make first-run governance activation truthful and reproducible: install and
  verify the exact local CLI before hooks, gate Ready on Doctor, pin generated
  workflows and hook fallbacks, keep Cloud policy authoritative for connected
  scans, and limit automatic component rewrites to confirmed mappings with
  collision-safe imports and complete, explicitly mapped prop compatibility.
  Verify versioned Cloud FCID preimages before connected scans, negotiate the
  capability across staggered Cloud/CLI rollouts, and refuse malformed identity
  proofs before scanning or reporting.
  Normalize authenticated Cloud workspace measures and restore canonical
  Card header/body spacing so panel composition stays consistent and accessible.
  Upgrade the packaged esbuild runtime beyond the vulnerable 0.24.x development
  server range, and remove unused default-on install telemetry from the public
  packages and READMEs.

## 1.0.2

### Patch Changes

- Keep TanStack peers external in the published build so consumers load their
  installed dependencies instead of a pnpm-specific path embedded in the
  package tarball.

## 1.0.1

### Patch Changes

- Require the peer libraries re-exported by the package root so a documented
  `@usefragments/ui` install can import the complete public surface.

## 0.22.0

### Minor Changes

- [#261](https://github.com/fragments-sdk/fragments/pull/261) [`6367c82`](https://github.com/fragments-sdk/fragments/commit/6367c821caa9bccf6a8beafa1aa6c1b70b56099c) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add cloud-contract aware governance scanning, canonical source helpers, and inspect overlay support.

  The CLI now fails CI scans when a required Cloud policy cannot be fetched, persists served policy metadata for hook enforcement, and surfaces hook stderr. Core and extract gain the canonical source and raw markup resolution helpers used by the inspect workflow. UI primitives now emit canonical stamp metadata and expose popover anchoring options needed by host overlays.

## 0.21.1

### Patch Changes

- [#145](https://github.com/fragments-sdk/fragments/pull/145) [`8bde5c6`](https://github.com/fragments-sdk/fragments/commit/8bde5c67bdf7f9ef842f594784fd8bc543f97494) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Fix `NavigationMenu` click toggling so a pending hover-open timer cannot reopen
  content after the user clicks an open trigger to close it.

## 0.21.0

### Minor Changes

- [`e2b0d0a`](https://github.com/fragments-sdk/fragments/commit/e2b0d0a3f82ff68bfe24259ed57277e0c06ef01e) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Align form-control primitives with Base UI ownership APIs and improve
  accessibility/state coverage across Accordion, Checkbox, Combobox, Drawer,
  RadioGroup, Select, Slider, Tabs, and Toggle.

  Adds support for form ownership, readonly/parent states, committed slider
  values, and related hidden-input plumbing where applicable, backed by expanded
  component tests.

- [#90](https://github.com/fragments-sdk/fragments/pull/90) [`07711a8`](https://github.com/fragments-sdk/fragments/commit/07711a8057b9e30eaa554333a7665c7021f5e5ee) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Design-system consistency pass and new theming tokens.

  New tokens: `--fui-bg-inverse` (theme-flipping inverse surface, used by Tooltip),
  the full `--fui-icon-{xs,sm,md,lg,xl,2xl}` scale exported as CSS variables,
  `--fui-letter-spacing-wide` (uppercase micro-labels), and `--fui-bg-highlight`
  (a neutral, clearly-visible active-item wash for menu/list popups in light and
  dark).

  Unified popup-item interaction model across Combobox, Select, Menu, Listbox,
  Command, and NavigationMenu — pointer hover and keyboard-active now share one
  neutral highlight (fixes near-invisible Combobox hover in dark mode), with accent
  reserved for the selected item. Chroma-aware dark-mode accent derivation keeps
  vibrant brand seeds true in dark mode instead of washing them out. Combobox now
  labels its input with a native `<label>` (was Base UI `Combobox.Label`).
  Broad micro-consistency fixes: tokenized transitions, restored SCSS dual
  fallbacks, unified focus and disabled treatments, and off-ladder typography
  snapped to tokens.

  NOTE — consumer-visible change: the spacing scale for `padding`/`gap` size props
  is now unified (compact `xs/sm/md/lg/xl` = `space-1/2/3/4/6`) across Box, Stack,
  Grid, BentoGrid, Card, and List. Box/Grid/BentoGrid tighten at md/lg/xl and Card
  grows slightly at sm/md; re-check layouts and regenerate visual snapshots.

## 0.19.2

### Patch Changes

- Add `band` prop to `Table.Row` for explicit stripe banding (useful for virtualized or grouped rows) and forward refs to the underlying `<tr>` so consumers can measure or scroll rows.

## 0.19.1

### Patch Changes

- Fix the Prompt component bottom action row by removing the extra actions padding that caused the toolbar content to render misaligned.

## 0.19.0

### Minor Changes

- [#6](https://github.com/ConanMcN/fragments/pull/6) [`3b9dfbb`](https://github.com/ConanMcN/fragments/commit/3b9dfbb0245d088b1a921b74c098be7cf0bf0298) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Evolve design tokens toward Linear/OpenAI design language

  **Token changes:**
  - Font scale compressed: `base`/`md` = 14px (1rem), `xl` = 20px, `2xl` = 24px
  - Transitions: precise easing curves from Linear (`cubic-bezier(0.25, 0.46, 0.45, 0.94)`) and ChatGPT (`cubic-bezier(0.4, 0, 0.2, 1)`)
  - Borders: opacity reduced from 8%/14% to 5%/10% (ChatGPT-style)
  - Shadows: opacity reduced ~33% for flatter aesthetic
  - Color derivation converted to oklch for perceptual uniformity
  - New letter-spacing tokens (`-0.02em` tight, `normal`)
  - Toggle/Switch: iOS dimensions → compact web proportions (36×20 md)
  - Input sm height: 28→32px
  - Sidebar item height: 35→36px

  **Component improvements:**
  - Button: optical alignment for icon + text combinations
  - Input: optical alignment for adornments and kbd shortcuts
  - Command.Input: restyled as proper field with field-shell
  - TableOfContents: restyled to match Sidebar.Item pattern
  - NavigationMenu.Content: flex layout with padding
  - Field bg simplified to `bg-tertiary`

  **Docs:**
  - Hero beam colors extracted to CSS custom properties
  - Mega-menu removed (WebMCP/A2UI not ready), simplified to dropdown
  - Search trigger uses Input with shortcut kbd
  - Share buttons use Button `variant="outline"`
  - Logo uses `currentColor` for theme-aware rendering

### Patch Changes

- [#5](https://github.com/ConanMcN/fragments/pull/5) [`97cd4c5`](https://github.com/ConanMcN/fragments/commit/97cd4c5b74bbb66a8fc984fbdeb534806f42160a) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Extract @fragments-sdk/compiler from CLI to break build dependency cycle

  The fragment compilation logic (build, freshness checking, discovery, parsing) has been extracted from `@fragments-sdk/cli` into a new `@fragments-sdk/compiler` package. This eliminates the `cli → viewer → ui` dependency cycle that required runtime workarounds.
  - **@fragments-sdk/compiler**: New package — fragment build, freshness check, and core compilation utilities. Depends only on `core` + `context`.
  - **@fragments-sdk/cli**: Build commands now delegate to `@fragments-sdk/compiler`. No public API changes.
  - **@fragments-sdk/ui**: Build scripts use compiler directly instead of CLI. No output changes.

## 0.18.0

### Minor Changes

- V2 contract.json — agent-native, framework-agnostic UI registry
  - `.contract.json` is now the canonical component metadata format (replaces `.fragment.tsx`)
  - 30-40% fewer tokens than TSX, framework-agnostic, schema-validatable
  - New required fields: `$schema`, `sourcePath`, `exportName`, `propsSummary`, `provenance`
  - Provenance: `verified: boolean` replaces `confidence: number`
  - Build pipeline: ExtractorAdapter, drift verification, duplicate detection
  - Governance: registry-derived component allowlist, props/unknown and props/invalid-value validators
  - MCP: compact discover includes `propsSummary`, inspect compact mode ~200 tokens
  - CLI: `fragments migrate-contract` command for migration
  - Preview: contract-native via generated `.preview.tsx` modules
  - All 66 UI components migrated, `.fragment.tsx` files removed

## 0.17.0

### Minor Changes

- [`55eaed6`](https://github.com/ConanMcN/fragments/commit/55eaed6ba53b70f1d511104c2952c5e18601e1ed) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Redesign semantic styles across Alert, Toast, Badge, and Button. Add success state and adornments to Input, character counter to Textarea, Fieldset.Description sub-component. Fix theme toggle dark-to-light switching. Improve kbd shortcut hint styling.

## 0.16.1

### Patch Changes

- Redesign CodeBlock to Vercel-style borderless aesthetic, add bg prop for customizable background color, update code tokens, and add synthetic benchmark library

## 0.16.0

### Minor Changes

- [`6f4ef32`](https://github.com/ConanMcN/fragments/commit/6f4ef32171104504a6cf6379bea5787a17516a4d) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Decompose AppShell layout into orthogonal props and add per-slot bg prop
  - `layout` controls grid structure (`default` | `sidebar`)
  - Per-slot `variant` controls floating treatment (`default` | `floating`)
  - Per-slot `bg` accepts any CSS color to override background independently
  - New variants: Floating Main, Floating Main & Aside, Floating Default Layout, Custom Backgrounds
  - Export `AppShellSlotVariant` type
  - Extract `discoverComponents` to `@fragments-sdk/core`

## 0.15.1

### Patch Changes

- Reduce @fragments-sdk/ui npm package size from 8.93 MB to 3.4 MB by disabling source maps, fixing Vite externals, excluding dev files, and stripping inherited props from fragments.json.

## 0.15.0

### Minor Changes

- [`dff9ede`](https://github.com/ConanMcN/fragments/commit/dff9ede9e7205f3b1f7b26539df1c3430fd628dd) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add seed-derivation and theme-presets utilities. Refine palette derivation for improved contrast and consistency across neutral palettes.

## 0.14.0

### Minor Changes

- Publish accumulated UI, viewer, and webmcp updates.

  Includes a new `Slider.showValueOnDrag` option in `@fragments-sdk/ui` (and matching `@fragments-sdk/a2ui` types) to show a value bubble while dragging.

## 0.13.1

### Patch Changes

- e0c5ab2: Extract `@fragments-sdk/viewer` as public npm package from CLI viewer code.
  - **New package**: `@fragments-sdk/viewer` (0.1.0) — Storybook-like React UI for previewing Fragments components. Ships source (TSX/SCSS) for Vite compilation. Subpath exports: `./shared`, `./app`, `./docs-data`, `./docs-layout.scss`.
  - **CLI**: Viewer extraction reduces CLI viewer dir from 28 to 11 files. New `fragments snapshot` command for visual regression testing. New `fragments init` prompts for theme seeds (brand, neutral, density, radius) and snapshot toggle. CLI resolves viewer via monorepo path first, npm `@fragments-sdk/viewer` fallback.
  - **Core**: New `ThemeSeeds` and `SnapshotConfig` types exported. `FragmentsConfig` extended with `theme` and `snapshots` fields.
  - **UI**: Fragment file updates for component metadata.
  - **Context/MCP**: Minor tool updates.

## 0.13.0

### Minor Changes

- UI component DX improvements: better event forwarding (onClick passthrough on Accordion, Collapsible, Dialog, Drawer, Popover triggers), stricter callback types (onValueChange returns undefined for collapsed state), React 19 type fixes (Combobox getNodeText), and expanded test coverage across 15 components.

## 0.12.0

### Minor Changes

- [`5b6a7d7`](https://github.com/ConanMcN/fragments/commit/5b6a7d739733f16cc41586a427759c5bfe9f1ab8) Thanks [@ConanMcN](https://github.com/ConanMcN)! - DX improvements from code review feedback:
  - Add `variant="outline"` alias for Button, Card, Chip, and Badge (Radix/Shadcn convention)
  - Add `asChild` prop for Button to compose with Next.js Link and other elements
  - Add `onCheckedChange` alias for Switch, `onValueChange` alias for Slider and ToggleGroup
  - Add numeric gap support for Stack and Grid (`gap={1-8}` maps to spacing scale)
  - Add Text `truncate`, `lineClamp`, `gradient`, `keyboard`, and `mark` variants
  - Add `configureTheme()` runtime API with density and radius seed tokens
  - Add JSDoc with `@see` doc links on 20+ component interfaces
  - Add `fragments setup` CLI command with framework detection, auto styles import, ThemeProvider wiring, SCSS seeds, and MCP config
  - Add Outline and Numeric Gap fragment variant examples with preview registry
  - Improve runtime CSS warning with actionable Next.js hints and setup command suggestion

## 0.12.0

### Minor Changes

- DX improvements based on external developer feedback
  - **Text**: Add `weight="bold"` (700), `color="muted"` (alias for tertiary), `size="md"` (alias for base)
  - **Button, Card, Chip**: Accept `variant="outline"` as alias for `"outlined"` (Radix/Shadcn convention)
  - **CodeBlock**: Accept language aliases `ts`, `js`, `text` (resolve to `typescript`, `javascript`, `plaintext`)
  - **Tabs**: Narrow `TabValue` type from `string | number` to `string` for better type inference
  - **TooltipProvider**: Add `delayDuration` and `skipDelayDuration` props (Radix-compatible aliases)
  - **Runtime CSS check**: Warn in console when component styles aren't loaded
  - **Sass fix**: Replace deprecated global `index()` with `list.index()` (eliminates 3 deprecation warnings)
  - **Switch**: Add `onCheckedChange` alias for `onChange` (Radix convention)
  - **Slider**: Add `onValueChange` alias for `onChange` (Radix convention)
  - **ToggleGroup**: Add `onValueChange` alias for `onChange` (Radix convention)
  - **Button**: Add `asChild` prop for composing with Next.js Link and other components
  - **Stack, Grid**: Accept numeric `gap` values (1-8) mapping to the spacing scale (e.g. `gap={2}`)
  - **Tokens**: Add `$fui-font-weight-bold` / `--fui-font-weight-bold` (700)
  - **JSDoc**: Add doc links (`@see`) and `@default` annotations to 20+ component prop interfaces for IDE hover tooltips
  - **CLI**: Add `fragments setup` command — auto-configures styles import, providers, and Next.js transpilePackages
  - **README**: Add Next.js `transpilePackages` setup note
  - **Getting Started docs**: Add `transpilePackages` requirement, `use client` metadata guidance

## 0.11.1

### Patch Changes

- Viewer refactor into composable components, mobile-friendly dashboard showcase, shared component docs layout, story filters, and AppShell/CodeBlock/Drawer/Sidebar updates

## 0.11.0

### Minor Changes

- [`db4f057`](https://github.com/ConanMcN/fragments/commit/db4f057954902c04c862cd9f3d3c5faf1c48bea9) Thanks [@ConanMcN](https://github.com/ConanMcN)! - feat: Editor component and centralized keyboard shortcuts
  - Editor compound component with TipTap rich text support (optional peer dep) and textarea fallback
  - Centralized keyboard shortcuts registry with `matchesShortcut()`, `configureShortcuts()`, and `useKeyboardShortcut()` hook
  - Global shortcuts (e.g. Ctrl+B sidebar toggle) automatically yield to editable elements
  - Sidebar refactored to use `useKeyboardShortcut` hook
  - Accessibility docs updated with keyboard shortcut customization section
  - New `BlogEditor` composition block

## 0.10.0

### Minor Changes

- [`c5f0b0a`](https://github.com/ConanMcN/fragments/commit/c5f0b0a28e39c20c37f232e87bd873ab10a39359) Thanks [@ConanMcN](https://github.com/ConanMcN)! - feat: DX improvements — configureTheme API, doctor command, seed validation, deprecate defaultTheme

  **@fragments-sdk/ui**
  - Add `configureTheme()` JS API for runtime theme seed configuration without SCSS
  - Add `Theme` compound export (`Theme.Provider`, `Theme.Toggle`)
  - Deprecate `defaultTheme` prop on ThemeProvider (use `defaultMode` instead, removed in v1.0)
  - Add SCSS compile-time `@error` guards for invalid seed values (neutral, density, radius-style)
  - Add deprecated `./globals` export alias pointing to `./styles`
  - Fix wrong palette names in README (steel/smoke/ash/silver → stone/ice/earth/sand/fire)
  - Fix wrong import paths in README (`/globals` → `/styles`, `/tokens` → `/mixins`)
  - Fix `useTheme()` API in docs (`{ theme, setTheme }` → `{ mode, setMode }`)

  **@fragments-sdk/cli**
  - Add `fragments doctor` command — diagnoses project setup (styles import, ThemeProvider, seeds, peer deps, MCP config)
  - Fix dist-aware alias resolution in CLI viewer for npm-installed packages
  - Fix generated providers to use `defaultMode` instead of `defaultTheme`

  **@fragments-sdk/context**
  - Add `doctor` command to CLI command metadata

  **@fragments-sdk/shared**
  - Add `./docs-data` subpath export with canonical palette, setup, and MCP config data

## 0.9.7

### Patch Changes

- [`284ec11`](https://github.com/ConanMcN/fragments/commit/284ec113727cbda339c531abfecbea89b17beb5b) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Achieve 100/100 react-doctor score: fix conditional hooks, cascading setState, add keyboard handlers, extract helper functions, and configure false positive exclusions

## 0.9.6

### Patch Changes

- Add image avatar support to Message.Avatar (src/alt props), introduce inline-xs padding token, and refine CodeBlock and Combobox styling

## 0.9.5

### Patch Changes

- [`fe18004`](https://github.com/ConanMcN/fragments/commit/fe18004a81b938064b84d86b5a235cca49394de0) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add DataTable component, improve Table, clean up dead code, and update viewer components

## 0.9.2

### Patch Changes

- [`e87cdc1`](https://github.com/ConanMcN/fragments/commit/e87cdc1ff55b202716614eb96d002ed0ff185777) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Fix Loading.Screen and Sidebar component previews breaking the docs app: contain fixed-position Loading.Screen within its preview container, and isolate Sidebar preview state from the docs app's SidebarProvider

## 0.9.1

### Patch Changes

- [`c99d41c`](https://github.com/ConanMcN/fragments/commit/c99d41cbb6542ab022166f352ab1167558f4a0a7) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add light mode colored card headers to landing page feature grid, add Vite build pipeline for UI dist output, and update publishConfig for npm publishing

## 0.9.0

### Minor Changes

- [`2487cb2`](https://github.com/ConanMcN/fragments/commit/2487cb215bb659d2f32ca59adc1d72a23b1ce201) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add BentoGrid component, enhance Avatar with customSize/imageStyle props, add NavigationMenu MobileBrand slot. Update docs landing page with AI-native positioning, redesign blog listing, and improve CLI viewer stability.

## 0.8.9

### Patch Changes

- [`30ffa79`](https://github.com/ConanMcN/fragments/commit/30ffa7928ed84cc700382d8a4f757c4ff052cf43) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add per-component `'use client'` directives for RSC compatibility. Moves the directive from the barrel export to 22 individual component files that need it, keeping 10 layout primitives (Box, Stack, Grid, Text, etc.) server-safe. Converts homepage, /components, and /getting-started doc pages to server components. Removes playground feature.

## 0.8.8

### Patch Changes

- [`04e5019`](https://github.com/ConanMcN/fragments/commit/04e5019d628bcced01a2cbbd067d3be7b7a39d99) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add Command, Drawer, and Pagination components plus docs/viewer updates.

## 0.8.7

### Patch Changes

- [`b61b8d5`](https://github.com/ConanMcN/fragments/commit/b61b8d5bb28a66620542a437c0ffbdebf1aec815) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add Menu submenu support, consolidate viewer toolbar, and center component previews
  - Menu: Add `checked` prop to `Menu.Item` for lightweight check indicators
  - Menu: Add `Menu.Submenu` and `Menu.SubmenuTrigger` for nested menu support
  - Menu: Fix `CheckboxItem` to use check icon instead of embedded Checkbox component
  - CLI viewer: Consolidate toolbar into single Storybook-style Options menu with submenus
  - CLI viewer: Add keyboard shortcuts for component/variant navigation (⌘↑/↓, ⌘←/→) and view modes (m, v)
  - CLI viewer: Center component previews vertically in preview frame

## 0.8.6

### Patch Changes

- [`8dea512`](https://github.com/ConanMcN/fragments/commit/8dea5128a36f6f1c32475e639960883a818593b6) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Fix SSR/hydration issues: add missing 'use client' directives to 13 components (Avatar, Chip, ColorPicker, Combobox, DatePicker, Input, Listbox, ScrollArea, Select, Sidebar, Slider, Table, Toast). Fix Avatar onError not firing for cached images. Fix Image onLoad not firing for cached images during hydration. Fix usePrefersReducedMotion and usePrefersContrast hydration mismatch. Add SSR guard to NavigationMenu createPortal. Fix Listbox CSS.escape fallback consistency. Fix PageAside hydration mismatch with window.location.href.

## 0.8.5

### Patch Changes

- [`1fe960d`](https://github.com/ConanMcN/fragments/commit/1fe960d7361aabf295e2d2a411c9fa4259a4bd9e) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add NavigationMenu component and NavigationHeader block. Enhance Chart, CodeBlock, ColorPicker, DatePicker, Header, Link, Table components with improved props and fragment metadata. Update docs site header, layout, theme builder, and blog posts. Update CLI viewer, parser, schema types, and build config.

## 0.8.4

### Patch Changes

- [`979ab44`](https://github.com/ConanMcN/fragments/commit/979ab44b642bb52bdbac29e6020907a3172dc5ed) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Launch week blog posts, OG image fix, and AppShell layout updates

## 0.8.3

### Patch Changes

- [`66d9ea1`](https://github.com/ConanMcN/fragments/commit/66d9ea1d1f37722936d13deab007d20c2dadbb74) Thanks [@ConanMcN](https://github.com/ConanMcN)! - SCSS token compliance: replace hardcoded CSS values with design tokens, add per-package LICENSE files and author metadata

## 0.8.2

### Patch Changes

- [`52348b2`](https://github.com/ConanMcN/fragments/commit/52348b28ec1b3471b9d6f31e807e8d0f0d9fd7a8) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Fix Menu bullet points, add shared FragmentsLogo component, flatten viewer sidebar, and make Input shortcut prop functional
  - **Menu**: Add `list-style: none` and `margin: 0` to `.popup` to fix bullet points and overflow in dropdown menus
  - **FragmentsLogo**: New shared logo component exported from `@fragments-sdk/ui`, used by the viewer sidebar
  - **Sidebar**: Remove category grouping — render all components as a flat alphabetical list matching docs pattern
  - **Input**: `shortcut` prop now registers a global keydown listener that focuses the input when the shortcut key combo is pressed (e.g., ⌘K)

## 0.8.1

### Patch Changes

- [`06bbba0`](https://github.com/ConanMcN/fragments/commit/06bbba0dad17f19ba69518f671b2f2a320bab61f) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Rename defineSegment to defineFragment across codebase, improve docs pages (Getting Started, CLI, MCP) for new users, and fix CodeBlock header rendering

## 0.8.0

### Minor Changes

- [`1f07312`](https://github.com/ConanMcN/fragments/commit/1f07312b3d2e1a9410164d49a1c1434b9d536421) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add component graph intelligence layer with structural relationship analysis, auto-detection of compound component metadata, and graph-augmented hybrid search. New `fragments graph` CLI command and `fragments_graph` MCP tool enable dependency, impact, composition, and alternatives queries. Add DatePicker and TableOfContents components. Add blog system to docs site.

## 0.7.5

### Patch Changes

- [`160bc1d`](https://github.com/ConanMcN/fragments/commit/160bc1d98a3a67ded3f96833be70baec421c4bf3) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Improve accessibility quality and audit coverage for the UI library.
  - Add an accessible name to the `ColorPicker` popup dialog.
  - Stabilize `ToggleGroup` fragment variants by moving hook state into React components.
  - Expand and modularize accessibility testing with reusable Playwright auditor modules and stronger keyboard-flow coverage.
  - Improve shared UI test accessibility helpers for portal-aware and reusable axe assertions.

## 0.7.4

### Patch Changes

- [#1](https://github.com/ConanMcN/fragments/pull/1) [`bd42d13`](https://github.com/ConanMcN/fragments/commit/bd42d13045df88e37ae10ca0db69ac3bf90b4a1d) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Fix P0/P1/P2 accessibility issues across core UI components, including dialog focus/escape behavior, listbox keyboard model, table/togglegroup semantics, labeling pathways, and related a11y interaction improvements.

## 0.7.3

### Patch Changes

- [`4ca9bdd`](https://github.com/ConanMcN/fragments/commit/4ca9bddf2ce5c8f34d76d8eaf423012922b0a61a) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Standardize interactive item heights to consistent 35px ceiling using item-xs vertical padding across Tabs, Select, Combobox, Listbox, Accordion, Table, Collapsible, and Dialog components

## 0.7.2

### Patch Changes

- [`10cb616`](https://github.com/ConanMcN/fragments/commit/10cb616002699a7f49ae9fe77ef036804ad252f0) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Consolidate shared types, context generation, and citations into @fragments-sdk/context
  - Add `types`, `generate`, and `citations` subpath exports to @fragments-sdk/context
  - New citations module: `buildCitationDocuments()` and `resolveCitations()` for Anthropic-compatible RAG citation workflows
  - MCP and CLI now import compiled types and context generation from @fragments-sdk/context instead of maintaining local copies
  - Fix Sidebar mobile FOUC with pre-hydration transform

## 0.7.1

### Patch Changes

- [`9ffb7fe`](https://github.com/ConanMcN/fragments/commit/9ffb7fe3b91b6bf8926564f69ffa5f0e3815a3a6) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Polish Table component: reduce row padding, strengthen header background, add striped and bordered props, fix selected style bug, replace hardcoded media query with breakpoint mixin

## 0.7.0

### Minor Changes

- [`eadecc6`](https://github.com/ConanMcN/fragments/commit/eadecc6696074bb8c1e90deeba92f8588d1e5a54) Thanks [@ConanMcN](https://github.com/ConanMcN)! - feat(docs,cli): fix component categories, add preview tabs, render markdown
  - Move Chip to "forms" and Markdown to "display" categories
  - Add preview tabs for Chip, Markdown, and Breadcrumbs components
  - Install react-markdown and remark-gfm for proper markdown rendering in docs
  - Add explicit code snippets to Markdown fragment variants
  - Fix CLI parser to support template literals in variant code property

## 0.6.5

### Patch Changes

- [`35e1df9`](https://github.com/ConanMcN/fragments/commit/35e1df98fb850897d7bb1e350b41b82a46b51e75) Thanks [@ConanMcN](https://github.com/ConanMcN)! - fix(ui): Message component CSS tweaks
  - Remove max-width constraint from user and assistant messages
  - Remove white-space: pre-wrap from message content to allow natural text flow

## 0.6.4

### Patch Changes

- [`6273fc6`](https://github.com/ConanMcN/fragments/commit/6273fc6a0bd7545f2514c65006f5d560790be254) Thanks [@ConanMcN](https://github.com/ConanMcN)! - fix(ui): overlay z-index, Select/Combobox maxVisibleItems, SelectItem render loop
  - Fix Select, Combobox, Popover, Menu z-index (50→52) to render above Dialog (51)
  - Add maxVisibleItems prop to Select.Content and Combobox.Content with half-peek scroll hint
  - Fix SelectItem infinite render loop by destructuring stable refs from context
  - Override Base UI inline max-height with !important
  - Add Scrollable List and Custom Max Visible Items fragment variants and previews
  - Fix AppShell.Aside overflow containment (overflow: hidden) to prevent children bleeding out

  fix(cli): MCP variant fuzzy matching and per-segment package name resolution
  - Variant matching now uses exact → prefix → contains fallback ("Dots" matches "Dots (Default)")
  - Track per-segment package names when merging multiple fragments.json files
  - Fixes import paths showing consumer project name instead of library package name

## 0.6.3

### Patch Changes

- [`6c6ae31`](https://github.com/ConanMcN/fragments/commit/6c6ae3143ed2f648de904d08ead2b9ea0ab99335) Thanks [@ConanMcN](https://github.com/ConanMcN)! - fix(ui): default Text component color to themed token for dark mode support
  fix(cli): use Node.js module resolution for fragments.json discovery

## 0.6.2

### Patch Changes

- [`1397be2`](https://github.com/ConanMcN/fragments/commit/1397be23a24a2236a4664e764b9c5f9117b7cd48) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Stabilize linting and warning handling across the monorepo, including stricter package lint targets and cleanup of lint-triggering code paths.

## 0.6.1

### Patch Changes

- [`3380e86`](https://github.com/ConanMcN/fragments/commit/3380e86e9b575e23412a6b609fa36644007933a5) Thanks [@ConanMcN](https://github.com/ConanMcN)! - fix: mobile layout bugs - horizontal scrollbar, missing nav links, aside visibility
  - Fix horizontal scrollbar on mobile when AppShell uses inset layout by removing margin and using width: 100%
  - Add header navigation links (Docs, Components, Blocks, Themes, Accessibility) to mobile sidebar menu
  - Stack AppShell.Aside below main content on mobile instead of hiding it

## 0.6.0

### Minor Changes

- [`5fde1d0`](https://github.com/ConanMcN/fragments/commit/5fde1d0127ef554eb6f7879cb6ff71a99466a1ca) Thanks [@ConanMcN](https://github.com/ConanMcN)! - feat: add Combobox component with single and multi-select support

  New searchable select component built on Base UI's combobox primitive. Supports:
  - Type-ahead filtering of options
  - Single and multiple selection (with chip display)
  - Grouped options with labels
  - Empty state messaging
  - Full keyboard navigation and ARIA combobox roles

## 0.5.0

### Minor Changes

- [`dbd8978`](https://github.com/ConanMcN/fragments/commit/dbd897818e14b798f8b4070798b1ec49c84480d3) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add Chart component (ChartContainer, ChartTooltip, ChartLegend) as thin recharts wrapper with design token integration. Add compact and persistentCopy props to CodeBlock.

## 0.4.0

### Minor Changes

- [`d462050`](https://github.com/ConanMcN/fragments/commit/d4620501ccfd8362b4db166be27f1d630a5e04c8) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Initial public release of Fragments UI
  - 40+ accessible, themeable React components
  - Full HTML prop passthrough on all components
  - Improved accessibility with aria-hidden on decorative icons
  - Production-ready with comprehensive documentation

## 0.3.0

### Minor Changes

- [`17046a1`](https://github.com/ConanMcN/fragments/commit/17046a1e214c651fc9626f5bcea31a092eb8ccaf) Thanks [@ConanMcN](https://github.com/ConanMcN)! - feat(Sidebar): Add shadcn-inspired patterns for improved flexibility and DX
  - Add `SidebarProvider` component for wrapping app layouts with shared state
  - Add `useSidebar` hook for accessing sidebar state from any child component
  - Add Cmd/Ctrl+B keyboard shortcut to toggle sidebar (configurable)
  - Add `asChild` prop to `Sidebar.Item` for polymorphic rendering (Next.js Link, React Router NavLink, etc.)
  - Add `Sidebar.SectionAction` for action buttons in section headers (e.g., "Add Project")
  - Add `Sidebar.MenuSkeleton` for loading states
  - Add `Sidebar.Rail` for edge-based toggle control
  - Add `collapsible` prop with modes: 'icon' (default), 'offcanvas', 'none'
  - Deprecate `useSidebarContext` in favor of `useSidebar` (backwards compatible)

  All changes are additive and fully backwards compatible.

## 0.2.3

### Patch Changes

- [`8866838`](https://github.com/ConanMcN/fragments/commit/88668385fb14d1fcb01c232dcc160eac21c1631f) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add README documentation for MCP and UI packages

## 0.2.2

### Patch Changes

- [`4ec7522`](https://github.com/ConanMcN/fragments/commit/4ec75225be222eec116d211dc0e5c1707e414409) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add README documentation for MCP and UI packages

## 0.2.1

### Patch Changes

- [`f657820`](https://github.com/ConanMcN/fragments/commit/f65782058dfa773088325eef18488dd47220fa72) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Improve fragments.json discovery and optimize build output

  MCP server now discovers fragments.json via the "fragments" field in
  package.json dependencies instead of brute-force scanning node_modules.
  Supports merging multiple fragment libraries. Build output is minified
  (117KB → 87KB) with null/empty fields stripped.

## 0.2.0

### Minor Changes

- [`58bbb8b`](https://github.com/ConanMcN/fragments/commit/58bbb8bb8bb6d0be1de2b1e4505d81a392a3f378) Thanks [@ConanMcN](https://github.com/ConanMcN)! - Add composition recipes system and responsive Grid component
  - New `defineRecipe()` / `compileRecipe()` API for composition patterns
  - New `fragments_recipe` MCP tool for searching recipes by name, tag, or component
  - Recipes included in `fragments_context` output
  - New Grid component with responsive columns: `{ base: 1, md: 2, lg: 3 }`
  - Breakpoint tokens and mobile-first breakpoint mixins added to design system
  - Six example recipes: Login Form, Confirm Dialog, Card Grid, Form Layout, Dashboard Layout, Settings Page

## 0.1.1

### Patch Changes

- [`8fa7a32`](https://github.com/ConanMcN/fragments/commit/8fa7a32f8f34cc39407fc25a291f7580e070fede) Thanks [@ConanMcN](https://github.com/ConanMcN)! - pipeline setup
