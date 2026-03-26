# @fragments-sdk/ui

A component library built on [Base UI](https://base-ui.com/) headless primitives with design tokens, SCSS modules, and full AI agent support via [Fragments](https://github.com/ConanMcN/fragments).

## Install

```bash
npm install @fragments-sdk/ui
```

Peer dependencies:

```bash
npm install react react-dom
```

## Setup

**Quick start (no SCSS)** — import the prebuilt CSS in your app entry point. This loads component styles with default tokens:

```tsx
import '@fragments-sdk/ui/styles';
```

**Custom theming (SCSS)** — create a `.scss` file with `@use '@fragments-sdk/ui/styles' with (...)` to set your seed values, then import both:

```tsx
import '@fragments-sdk/ui/styles';   // component styles (ui.css)
import './styles/globals.scss';       // your seed overrides
```

**Next.js users** — add `transpilePackages` to your `next.config.js`:

```js
// next.config.js
const nextConfig = {
  transpilePackages: ['@fragments-sdk/ui'],
};
```

Then use components:

```tsx
import { Button, Card, Input, Grid } from '@fragments-sdk/ui';

function App() {
  return (
    <Card>
      <Grid columns={2} gap="md">
        <Input label="Email" type="email" />
        <Input label="Name" />
      </Grid>
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

## Components

| Component | Category | Description |
|-----------|----------|-------------|
| Accordion | Layout | Vertically stacked, collapsible content sections. Use for organizing related content that can be progressively disclosed. |
| Alert | Feedback | Contextual feedback messages for user actions or system status. Supports multiple severity levels with optional actions and dismissibility. |
| AppShell | Layout | Full layout wrapper integrating sidebar, header, main content, and optional aside panel. Supports three layout modes: default (header on top), sidebar (sidebar full height), and sidebar-floating (rounded main content). |
| Avatar | Display | Visual representation of a user or entity |
| Badge | Display | Compact label for status, counts, or categorization. Draws attention to metadata without dominating the layout. |
| Box | Layout | Primitive layout component for applying spacing, backgrounds, and borders. A flexible container for building custom layouts. |
| Breadcrumbs | Navigation | Breadcrumb navigation showing the current page location within a hierarchy. Helps users navigate back through parent pages. |
| Button | Forms | Interactive element for user actions and form submissions |
| ButtonGroup | Forms | Groups related buttons together with consistent spacing and alignment. Useful for action bars, toolbars, and related button sets. |
| Card | Layout | Container for grouping related content |
| Chart | Display | Composable chart wrapper for recharts with theme-aware tooltips, legends, and color integration. |
| Checkbox | Forms | Binary toggle for form fields. Use for options that require explicit submission, unlike Switch which takes effect immediately. |
| Chip | Forms | Interactive pill-shaped element for filtering, selecting, and tagging. Supports single and multi-select via Chip.Group. |
| CodeBlock | Display | Syntax-highlighted code display with copy functionality, theming, diff view, and collapsible sections |
| Collapsible | Layout | An interactive component that expands/collapses to show or hide content |
| ColorPicker | Forms | Color selection control with hex input and visual picker. Displays a swatch that opens a full color picker on click. |
| Combobox | Forms | Searchable select input that filters a dropdown list of options as you type. Supports single and multiple selection with chips. |
| ConversationList | Ai | Scrollable message container with auto-scroll and history loading |
| Dialog | Feedback | Modal overlay for focused user interactions. Use for confirmations, forms, or content requiring full attention. |
| EmptyState | Feedback | Placeholder for empty content areas. Provides context, guidance, and actions when no data is available. |
| Field | Forms | Compositional form field wrapper providing validation, labels, descriptions, and error messages. Use for advanced form needs beyond baked-in Input/Textarea props. |
| Fieldset | Forms | Groups related form fields with an accessible legend. Use to organize forms into logical sections. |
| Form | Forms | Form wrapper that handles server-side error distribution to Field components. Pairs with Field for complete form validation. |
| Grid | Layout | Responsive grid layout for arranging items in columns with consistent spacing |
| Header | Navigation | Composable header with slots for brand, navigation, search, and actions. Supports dropdown nav groups via Header.NavMenu. Designed for use within AppShell with responsive mobile support. |
| Icon | Display | Wrapper for Phosphor icons with consistent sizing and semantic colors. Provides standardized icon rendering across the design system. |
| Image | Display | Responsive image component with aspect ratio control, loading states, and error fallbacks. Handles image display with consistent styling. |
| Input | Forms | Text input field for single-line user data entry |
| Link | Navigation | Styled anchor element for navigation. Supports internal and external links with consistent visual treatment. |
| List | Display | Compound component for rendering ordered or unordered lists with consistent styling. Supports bullet, numbered, and icon-prefixed items. |
| Listbox | Forms | Controlled listbox for search results, autocomplete dropdowns, and command menus. Provides Menu-like styling without requiring a trigger. |
| Loading | Feedback | Versatile loading indicator with multiple variants for showing progress or waiting states |
| Markdown | Display | Renders markdown strings as styled prose using react-markdown and remark-gfm. Supports headings, lists, tables, code blocks, blockquotes, and more. |
| Menu | Feedback | Dropdown menu for actions and commands. Use for contextual actions, overflow menus, or grouped commands. |
| Message | Ai | Individual chat message display with role-based styling |
| Popover | Feedback | Rich content overlay anchored to a trigger element. Use for forms, detailed information, or interactive content that should stay in context. |
| Progress | Feedback | Visual indicator of task completion or loading state. Available in linear and circular variants. |
| Prompt | Ai | Multi-line input with toolbar for AI/chat interfaces |
| RadioGroup | Forms | Single selection from a list of mutually exclusive options |
| ScrollArea | Layout | A styled scrollable container with thin scrollbars and optional fade indicators. |
| Select | Forms | Dropdown for choosing from a list of options. Use when there are more than 4-5 choices that would clutter the UI. |
| Separator | Layout | Visual divider between content sections. Use to create clear visual boundaries and improve content organization. |
| Sidebar | Navigation | Responsive navigation sidebar with collapsible desktop mode and mobile drawer behavior. |
| Skeleton | Feedback | Placeholder loading state for content |
| Slider | Forms | Range input control for selecting a numeric value within a defined range. Supports labels, value display, and custom step intervals. |
| Stack | Layout | Flexible layout component for arranging children in rows or columns with consistent spacing. Supports responsive direction and gap. |
| Table | Display | Data table with sorting and row selection. Use for displaying structured data that needs to be scanned, compared, or acted upon. |
| Tabs | Navigation | Organize content into switchable panels. Use for related content that benefits from a compact, navigable layout. |
| Text | Display | Typography component for rendering text with consistent styling. Supports various sizes, weights, colors, and semantic elements. |
| Textarea | Forms | Multi-line text input for longer form content |
| Theme | Navigation | Theme management system with provider, toggle, and hook pattern. Supports light, dark, and system modes with localStorage persistence. |
| ThinkingIndicator | Ai | Animated indicator showing AI is processing |
| Toast | Feedback | Brief, non-blocking notification messages |
| Switch | Forms | Binary on/off switch for settings and preferences. Provides immediate visual feedback and is ideal for options that take effect instantly. |
| ToggleGroup | Forms | A group of toggle buttons where only one can be selected at a time. Useful for switching between views, modes, or options. |
| Tooltip | Feedback | Contextual help text that appears on hover or focus. Perfect for explaining icons, truncated text, or providing additional context. |
| VisuallyHidden | Navigation | Hides content visually while keeping it accessible to screen readers. Essential for accessible icon-only buttons and supplementary text. |

## Fragment Snippet Authoring

All fragment and block previews are authored source snippets, not runtime-serialized JSX.

- Add explicit `variant.code` (or block `code`) for every example.
- Keep snippets as full examples: include imports + renderable JSX.
- Use Fragments primitives for layout wrappers (`Box`, `Stack`, `Text`) instead of raw HTML wrappers (`div`, `span`, `p`, headings).
- Do not use inline `style={...}` in snippets or example renders.
- Do not use alias drift tags (`*Root`, `*2`) in snippet code.

## Design Tokens

### Seed-Based Configuration (Recommended)

Configure ~5 seeds and everything derives automatically using the SCSS `@use ... with()` syntax:

```scss
// styles/globals.scss

// Minimal setup — just your brand color
@use '@fragments-sdk/ui/styles' with (
  $fui-brand: #0066ff
);
```

```scss
// Full customization
@use '@fragments-sdk/ui/styles' with (
  $fui-brand: #0066ff,
  $fui-neutral: "ice",
  $fui-density: "compact",
  $fui-radius-style: "rounded",
  $fui-danger: #dc2626,
  $fui-success: #16a34a
);
```

#### Available Seeds

| Seed | Type | Default | Description |
|------|------|---------|-------------|
| `$fui-brand` | Color | `#18181b` | Primary brand color - derives accent, focus rings, etc. |
| `$fui-neutral` | String | `"stone"` | Neutral palette for surfaces, text, borders |
| `$fui-density` | String | `"default"` | Spacing density scale |
| `$fui-radius-style` | String | `"default"` | Corner radius style |
| `$fui-danger` | Color | `#ef4444` | Error/danger semantic color |
| `$fui-success` | Color | `#22c55e` | Success semantic color |
| `$fui-warning` | Color | `#f59e0b` | Warning semantic color |
| `$fui-info` | Color | `#3b82f6` | Info semantic color |

#### Neutral Palettes

| Name | Description |
|------|-------------|
| `stone` | Cool gray neutrals (balanced, professional) — default |
| `ice` | Cool blue-tinted grays (crisp, technical) |
| `earth` | Warm brown-tinted grays (natural, grounded) |
| `sand` | Warm tan-tinted grays (organic, approachable) |
| `fire` | Warm red-tinted grays (bold, energetic) |

#### Density Presets

| Name | Base Unit | Feel |
|------|-----------|------|
| `compact` | 6px | Tighter spacing, smaller elements |
| `default` | 7px | Balanced, current visual appearance |
| `relaxed` | 8px | More spacious layout |

#### Radius Styles

| Name | Feel |
|------|------|
| `sharp` | No rounding (technical, precise) |
| `subtle` | Minimal rounding (modern minimal) |
| `default` | Balanced rounding (current) |
| `rounded` | More prominent (friendly) |
| `pill` | Maximum rounding (playful, soft) |

### Individual Token Overrides (Backward Compatible)

You can still override individual tokens directly:

```scss
@use '@fragments-sdk/ui/tokens' as *;

.custom {
  padding: $fui-space-4;
  border-radius: $fui-radius-md;
  color: var(--fui-text-primary);
}
```

### Breakpoints

```scss
@use '@fragments-sdk/ui/mixins' as *;

.responsive {
  @include breakpoint-md {
    grid-template-columns: repeat(2, 1fr);
  }
  @include breakpoint-lg {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

| Token | Value |
|-------|-------|
| `$fui-breakpoint-sm` | 640px |
| `$fui-breakpoint-md` | 768px |
| `$fui-breakpoint-lg` | 1024px |
| `$fui-breakpoint-xl` | 1280px |

### Migration Guide

**Existing code continues to work.** The seed system is fully backward compatible:

- Existing `@use '@fragments-sdk/ui/tokens'` imports work unchanged
- Individual variable overrides (`$fui-color-accent: #blue`) still work
- CSS variable usage (`var(--fui-color-accent)`) works
- Component APIs remain the same
- Visual appearance is unchanged with default seeds

**To migrate to seeds (optional):**

1. Instead of overriding many individual tokens, set seed values:
   ```scss
   // Before: many individual overrides
   $fui-color-accent: #0066ff;
   $fui-color-accent-hover: #0052cc;
   $fui-bg-secondary: #f1f5f9;
   // ...many more

   // After: just seeds
   @use '@fragments-sdk/ui/styles' with (
     $fui-brand: #0066ff,
     $fui-neutral: "ice"
   );
   ```

2. Dark mode, hover states, and derived colors are computed automatically

## AI Agent Support

This package ships a `fragments.json` file that describes every component's props, usage guidelines, accessibility rules, and code examples. AI agents can access this data through the [`@fragments-sdk/mcp`](https://www.npmjs.com/package/@fragments-sdk/mcp) server.

### Setup with Claude Code

1. Install both packages:

```bash
npm install @fragments-sdk/ui @fragments-sdk/mcp
```

2. Add the MCP server to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "fragments": {
      "command": "npx",
      "args": ["@fragments-sdk/mcp"]
    }
  }
}
```

The MCP server automatically discovers `fragments.json` from the installed `@fragments-sdk/ui` package. No configuration needed.

Or use the CLI to set up everything at once:

```bash
npx @fragments-sdk/cli setup --mcp
```

## Composition Blocks

The library includes composition blocks — named patterns showing how components wire together for common use cases:

- **Login Form** — Email/password authentication form
- **Confirm Dialog** — Destructive action confirmation
- **Card Grid** — Responsive auto-fill card layout
- **Form Layout** — Two-column form with Grid
- **Dashboard Layout** — Featured card with metrics grid
- **Settings Page** — Settings sections with cards and controls

Access blocks via the MCP server's `blocks` tool or `context`.

## License

MIT

<img referrerpolicy="no-referrer-when-downgrade" src="https://static.scarf.sh/a.png?x-pxid=a02beb71-df11-498d-8e1f-39de2e64ce5b" />
