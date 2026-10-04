# @usefragments/ui

A component library built on [Base UI](https://base-ui.com/) headless primitives with design tokens, SCSS modules, and full AI agent support. Project home: [usefragments.com](https://usefragments.com).

## About this repository

Source and issues for `@usefragments/ui` live at
[fragments-sdk/ui](https://github.com/fragments-sdk/ui).

- **Install from npm:** `pnpm add @usefragments/ui` (or `npm install @usefragments/ui`)
- **Docs:** [usefragments.com](https://usefragments.com)
- **Issues:** [report a bug or propose a change](https://github.com/fragments-sdk/ui/issues).

## Install

```bash
pnpm add @usefragments/ui
# or: npm install @usefragments/ui
```

**Required peers:** `react` and `react-dom` only.

Heavy libraries used by optional advanced components (charts, editor, markdown,
data table, date picker, etc.) are declared as **optional** peers via
`peerDependenciesMeta`. Install them only when you use those components:

```bash
# Examples — install only what you need:
npm install recharts                 # Chart
npm install @tanstack/react-table    # DataTable
npm install react-day-picker date-fns  # DatePicker
```

## Setup

**Quick start (no SCSS)** — import the prebuilt CSS in your app entry point. This loads **default design tokens** (including dark mode) plus component styles:

```tsx
import "@usefragments/ui/styles";
```

**Custom theming (SCSS)** — create a `.scss` file with `@use '@usefragments/ui/scss' with (...)` to set your seed values. The Sass entry emits tokens and base styles. Import the prebuilt component CSS first, then your configured SCSS so its seeds take precedence:

```tsx
import "@usefragments/ui/styles";
import "./styles/globals.scss"; // your @use … with (…) seed overrides
```

**Next.js compatibility** — current releases can consume the package directly.
If your Next.js version reports an untranspiled-package error or omits the
stylesheet, add `transpilePackages` to `next.config.js`:

```js
// next.config.js
const nextConfig = {
  transpilePackages: ["@usefragments/ui"],
};
```

Then use components:

```tsx
import { Button, Card, Field, Input, Grid } from "@usefragments/ui";

function App() {
  return (
    <Card>
      <Grid columns={2} gap="md">
        <Field>
          <Field.Label>Email</Field.Label>
          <Input type="email" />
        </Field>
        <Field>
          <Field.Label>Name</Field.Label>
          <Input />
        </Field>
      </Grid>
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

## Components

| Component         | Category   | Description                                                                                                                                                                                                                |
| ----------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion         | Layout     | Vertically stacked, collapsible content sections. Use for organizing related content that can be progressively disclosed.                                                                                                  |
| Alert             | Feedback   | Contextual feedback messages for user actions or system status. Supports multiple severity levels with optional actions and dismissibility.                                                                                |
| AppShell          | Layout     | Full layout wrapper integrating sidebar, header, main content, and optional aside panel. Supports three layout modes: default (header on top), sidebar (sidebar full height), and sidebar-floating (rounded main content). |
| Avatar            | Display    | Visual representation of a user or entity                                                                                                                                                                                  |
| Badge             | Display    | Compact label for status, counts, or categorization. Draws attention to metadata without dominating the layout.                                                                                                            |
| Box               | Layout     | Primitive layout component for applying spacing, backgrounds, and borders. A flexible container for building custom layouts.                                                                                               |
| Breadcrumbs       | Navigation | Breadcrumb navigation showing the current page location within a hierarchy. Helps users navigate back through parent pages.                                                                                                |
| Button            | Forms      | Interactive element for user actions and form submissions                                                                                                                                                                  |
| ButtonGroup       | Forms      | Groups related buttons together with consistent spacing and alignment. Useful for action bars, toolbars, and related button sets.                                                                                          |
| Card              | Layout     | Container for grouping related content                                                                                                                                                                                     |
| Chart             | Display    | Composable chart wrapper for recharts with theme-aware tooltips, legends, and color integration.                                                                                                                           |
| Checkbox          | Forms      | Binary toggle for form fields. Use for options that require explicit submission, unlike Switch which takes effect immediately.                                                                                             |
| Chip              | Forms      | Interactive pill-shaped element for filtering, selecting, and tagging. Supports single and multi-select via Chip.Group.                                                                                                    |
| CodeBlock         | Display    | Syntax-highlighted code display with copy functionality, theming, diff view, and collapsible sections                                                                                                                      |
| Collapsible       | Layout     | An interactive component that expands/collapses to show or hide content                                                                                                                                                    |
| ColorPicker       | Forms      | Color selection control with hex input and visual picker. Displays a swatch that opens a full color picker on click.                                                                                                       |
| Combobox          | Forms      | Searchable select input that filters a dropdown list of options as you type. Supports single and multiple selection with chips.                                                                                            |
| ConversationList  | Ai         | Scrollable message container with auto-scroll and history loading                                                                                                                                                          |
| Dialog            | Feedback   | Modal overlay for focused user interactions. Use for confirmations, forms, or content requiring full attention.                                                                                                            |
| EmptyState        | Feedback   | Placeholder for empty content areas. Provides context, guidance, and actions when no data is available.                                                                                                                    |
| Field             | Forms      | The label, description and error for one control. Input, Textarea, Select, Combobox and NumberField take their label from it.                                                                                              |
| Fieldset          | Forms      | Groups related form fields with an accessible legend. Use to organize forms into logical sections.                                                                                                                         |
| Form              | Forms      | Form wrapper that hands server errors to its Fields and locks every control while a submit is pending.                                                                                                                     |
| Grid              | Layout     | Responsive grid layout for arranging items in columns with consistent spacing                                                                                                                                              |
| Header            | Navigation | Composable header with slots for brand, navigation, search, and actions. Supports dropdown nav groups via Header.NavMenu. Designed for use within AppShell with responsive mobile support.                                 |
| Icon              | Display    | Wrapper for Phosphor icons with consistent sizing and semantic colors. Provides standardized icon rendering across the design system.                                                                                      |
| Image             | Display    | Responsive image component with aspect ratio control, loading states, and error fallbacks. Handles image display with consistent styling.                                                                                  |
| Input             | Forms      | Single-line text field. type="search" adds a clear button, Escape to clear and a live match count.                                                                                                                         |
| Link              | Navigation | Styled anchor element for navigation. Supports internal and external links with consistent visual treatment.                                                                                                               |
| List              | Display    | Compound component for rendering ordered or unordered lists with consistent styling. Supports bullet, numbered, and icon-prefixed items.                                                                                   |
| Listbox           | Forms      | Controlled listbox for search results, autocomplete dropdowns, and command menus. Provides Menu-like styling without requiring a trigger.                                                                                  |
| Loading           | Feedback   | Versatile loading indicator with multiple variants for showing progress or waiting states                                                                                                                                  |
| Markdown          | Display    | Renders markdown strings as styled prose using react-markdown and remark-gfm. Supports headings, lists, tables, code blocks, blockquotes, and more.                                                                        |
| Menu              | Feedback   | Dropdown menu for actions and commands. Use for contextual actions, overflow menus, or grouped commands.                                                                                                                   |
| Message           | Ai         | Individual chat message display with role-based styling                                                                                                                                                                    |
| NumberField       | Forms      | Numeric field that steps with the arrow keys, scrubs from a short label and reads its unit with the value.                                                                                                                 |
| Popover           | Feedback   | Rich content overlay anchored to a trigger element. Use for forms, detailed information, or interactive content that should stay in context.                                                                               |
| Progress          | Feedback   | Visual indicator of task completion or loading state. Available in linear and circular variants.                                                                                                                           |
| Prompt            | Ai         | Multi-line input with toolbar for AI/chat interfaces                                                                                                                                                                       |
| RadioGroup        | Forms      | Single selection from a list of mutually exclusive options                                                                                                                                                                 |
| ScrollArea        | Layout     | A styled scrollable container with thin scrollbars and optional fade indicators.                                                                                                                                           |
| Select            | Forms      | Dropdown for choosing from a list of options. Use when there are more than 4-5 choices that would clutter the UI.                                                                                                          |
| Separator         | Layout     | Visual divider between content sections. Use to create clear visual boundaries and improve content organization.                                                                                                           |
| Sidebar           | Navigation | Responsive navigation sidebar with collapsible desktop mode and mobile drawer behavior.                                                                                                                                    |
| Skeleton          | Feedback   | Placeholder loading state for content                                                                                                                                                                                      |
| Slider            | Forms      | Range input control for selecting a numeric value within a defined range. Supports labels, value display, and custom step intervals.                                                                                       |
| Stack             | Layout     | Flexible layout component for arranging children in rows or columns with consistent spacing. Supports responsive direction and gap.                                                                                        |
| Table             | Display    | Data table with sorting and row selection. Use for displaying structured data that needs to be scanned, compared, or acted upon.                                                                                           |
| Tabs              | Navigation | Organize content into switchable panels. Use for related content that benefits from a compact, navigable layout.                                                                                                           |
| Text              | Display    | Typography component for rendering text with consistent styling. Supports various sizes, weights, colors, and semantic elements.                                                                                           |
| Textarea          | Forms      | Multi-line text input for longer form content                                                                                                                                                                              |
| Theme             | Navigation | Theme management system with provider, toggle, and hook pattern. Supports light, dark, and system modes with localStorage persistence.                                                                                     |
| ThinkingIndicator | Ai         | Animated indicator showing AI is processing                                                                                                                                                                                |
| Toast             | Feedback   | Brief, non-blocking notification messages                                                                                                                                                                                  |
| Switch            | Forms      | Binary on/off switch for settings and preferences. Provides immediate visual feedback and is ideal for options that take effect instantly.                                                                                 |
| ToggleGroup       | Forms      | A group of toggle buttons where only one can be selected at a time. Useful for switching between views, modes, or options.                                                                                                 |
| Tooltip           | Feedback   | Contextual help text that appears on hover or focus. Perfect for explaining icons, truncated text, or providing additional context.                                                                                        |
| VisuallyHidden    | Navigation | Hides content visually while keeping it accessible to screen readers. Essential for accessible icon-only buttons and supplementary text.                                                                                   |

## Fragment Snippet Authoring

All fragment and block previews are authored source snippets, not runtime-serialized JSX.

- Add explicit `variant.code` (or block `code`) for every example.
- Keep snippets as full examples: include imports + renderable JSX.
- Use Fragments primitives for layout wrappers (`Box`, `Stack`, `Text`) instead of raw HTML wrappers (`div`, `span`, `p`, headings).
- Do not use inline `style={...}` in snippets or example renders.
- Do not use alias drift tags (`*Root`, `*2`) in snippet code.

## Design Tokens

### Seeds

Seven seeds drive every derived token. Set them with the SCSS `@use ... with()` syntax on the Sass entry point:

```scss
// styles/globals.scss

// Minimal setup — just your brand color
@use "@usefragments/ui/scss" with (
  $fui-brand: #0066ff
);
```

```scss
// Full customization
@use "@usefragments/ui/scss" with (
  $fui-brand: #0066ff,
  $fui-radius-style: "rounded",
  $fui-danger: #dc2626,
  $fui-success: #16a34a
);
```

#### Available Seeds

| Seed                | Type   | Default                | Description                                                                 |
| ------------------- | ------ | ---------------------- | --------------------------------------------------------------------------- |
| `$fui-brand`        | Color  | `#3d5ae8`              | Brand color — derives the accent ramp, focus rings and the dark-mode accent |
| `$fui-neutral`      | Color  | `"paper"`              | The neutral every plane, ink and line is a lightness step of                |
| `$fui-radius-style` | String | `"default"`            | Corner radius style                                                         |
| `$fui-danger`       | Color  | `#d13d1f`              | Danger semantic color                                                       |
| `$fui-success`      | Color  | `#2fbf8f`              | Success semantic color                                                      |
| `$fui-warning`      | Color  | `#f2a100`              | Warning semantic color                                                      |
| `$fui-info`         | Color  | `oklch(0.58 0.13 245)` | Info semantic color                                                         |

`$fui-neutral` takes `"paper"` (a warm grey) or any colour. Its chroma is capped at 0.04, so every
plane keeps its ink contrast however vivid the neutral is.

#### Radius Styles

| Name      | Feel                              |
| --------- | --------------------------------- |
| `sharp`   | No rounding (technical, precise)  |
| `subtle`  | Minimal rounding (modern minimal) |
| `default` | Balanced rounding (current)       |
| `rounded` | More prominent (friendly)         |
| `pill`    | Maximum rounding (playful, soft)  |

### Runtime attributes

The compiled stylesheet also answers these attributes on `<html>` or a scope element, so a page
can switch without a rebuild:

| Attribute               | Values                                  | Effect                                                           |
| ----------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| `data-theme`            | `light` · `dark` (`system` on a scope)  | Colour scheme (`Theme` sets it)                                  |
| `data-fui-theme`        | present                                 | A theme scope: every role re-derives from the inputs set on it   |
| `data-chrome`           | `accent` · `ink`                        | Primary action chrome: the accent ramp, or ink on the page plane |
| `data-fui-radius-style` | `sharp` · `subtle` · `rounded` · `pill` | Radius profile on `<html>`; absent = `default`                   |

### Theme at runtime

`Theme` at the root owns `<html>`: the mode, its storage, and
any inputs you pass. Add `ThemeScript` to `<head>` so a reload paints the stored mode first. It is a
server component, so it works in a server layout:

```tsx
import { Theme, ThemeScript } from "@usefragments/ui";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript brand="#0066ff" />
      </head>
      <body>
        <Theme brand="#0066ff">{children}</Theme>
      </body>
    </html>
  );
}
```

A `Theme` inside another `Theme` scopes a subtree instead. It renders one
`<div data-fui-theme>`, and every role inside re-derives from the inputs it sets, so a dark panel
on a light page, an ink toolbar or a rebranded preview all hold contrast. Popups opened inside the
scope (Dialog, Popover, Menu, Tooltip and the rest) carry it into their portal.

```tsx
<Theme mode="dark" brand="#16a34a">
  <SettingsPanel />
</Theme>
```

| Input             | Sets                 | Notes                                      |
| ----------------- | -------------------- | ------------------------------------------ |
| `brand`           | `--fui-seed-brand`   | Any CSS colour                             |
| `neutral`         | `--fui-seed-neutral` | `"paper"` or any CSS colour; chroma capped |
| `radius`          | `--fui-radius`       | A number is pixels                         |
| `scale`           | `--fui-scale`        | Multiplier on every measurement            |
| `font`            | `--fui-font-sans`    | Sans-serif stack                           |
| `pressScale`      | `--fui-press-scale`  | Scale while pressed; `1` turns it off      |
| `primaryChrome`   | `data-chrome`        | `accent` or `ink`                          |
| `danger` … `info` | `--fui-seed-*`       | Tone colours                               |

Without React, set the same custom properties on any element with `data-fui-theme`.

### Shared state tokens

Every component reads these instead of carrying its own literal, so one override changes the whole kit:

| Token                    | Default            | Purpose                                                                                                                                                                                |
| ------------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--fui-opacity-faint`    | `0.3`              | Faint decoration: pulse rings and glow tracks                                                                                                                                          |
| `--fui-opacity-disabled` | `0.5`              | Disabled controls (`@include disabled-state` in SCSS)                                                                                                                                  |
| `--fui-opacity-muted`    | `0.7`              | Dimmed but live: collapsed rails, secondary glyphs, decorative rules                                                                                                                   |
| `--fui-radius-none`      | `0`                | Square corners: joined segments, skeleton blocks, code gutters                                                                                                                         |
| `--fui-radius-l1`        | `--fui-radius-lg`  | Outermost surface level: cards, dialogs, panels                                                                                                                                        |
| `--fui-radius-l2`        | `--fui-radius-md`  | Control level: buttons, inputs, menus                                                                                                                                                  |
| `--fui-radius-l3`        | `--fui-radius-sm`  | Inner level: checkboxes, badges, nested chips                                                                                                                                          |
| `--fui-scale`            | `1`                | Multiplies the spacing scale (`--fui-space-*`) and the measurement-catalog lengths (control and field tracks, insets, overlay widths, navigation); radius, strokes and type stay fixed |
| `--fui-stroke-default`   | measurement target | Stroke used by `@include high-contrast-outline` under `prefers-contrast`                                                                                                               |

### Individual Token Overrides

You can still override individual tokens directly:

```scss
@use "@usefragments/ui/tokens" as *;

.custom {
  padding: $fui-space-4;
  border-radius: $fui-radius-md;
  color: var(--fui-text-primary);
}
```

### Breakpoints

```scss
@use "@usefragments/ui/mixins" as *;

.responsive {
  @include breakpoint-md {
    grid-template-columns: repeat(2, 1fr);
  }
  @include breakpoint-lg {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

| Token                | Value  |
| -------------------- | ------ |
| `$fui-breakpoint-sm` | 640px  |
| `$fui-breakpoint-md` | 768px  |
| `$fui-breakpoint-lg` | 1024px |
| `$fui-breakpoint-xl` | 1280px |

### Migrating token overrides to seeds

Instead of overriding many individual tokens, set seed values; dark mode, hover states and derived colors are computed automatically:

```scss
// Before: many individual overrides
$fui-color-accent: #0066ff;
$fui-color-accent-hover: #0052cc;
$fui-bg-secondary: #f1f5f9;
// ...many more

// After: just seeds
@use "@usefragments/ui/scss" with (
  $fui-brand: #0066ff
);
```

## AI Agent Support

This package ships a `fragments.json` file that describes every component's props, usage guidelines, accessibility rules, and code examples. Projects indexed in Fragments Cloud can expose their curated design-system data to AI agents through the hosted Fragments MCP service.

### Setup with Claude Code

Add the hosted MCP server to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "fragments": {
      "type": "http",
      "url": "https://app.usefragments.com/api/mcp",
      "headers": {
        "Authorization": "Bearer ${FRAGMENTS_API_KEY}"
      }
    }
  }
}
```

Interactive clients can use the endpoint's OAuth discovery flow instead of an
API-key header. There is no MCP npm package or local stdio process to install.

## Composition Blocks

The library includes composition blocks — named patterns showing how components wire together for common use cases:

- **Login Form** — Email/password authentication form
- **Stats Card** — Metric tile with delta badge
- **Activity Feed** — Avatar-led activity list

Access blocks through the Fragments docs or context generated by the CLI.

## License

MIT
