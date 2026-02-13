# @fragments-sdk/ui

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
