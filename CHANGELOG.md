# @fragments-sdk/ui

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
