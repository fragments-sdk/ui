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

Import the global styles in your app entry point:

```tsx
import '@fragments-sdk/ui/styles';
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
| Alert | Feedback | Contextual feedback messages with severity levels |
| Avatar | Display | User or entity profile images with fallbacks |
| Badge | Display | Status indicators and labels |
| Button | Actions | Primary interaction element with variants |
| Card | Layout | Content container with optional sections |
| Checkbox | Forms | Binary selection control |
| CircularProgress | Feedback | Circular loading/progress indicator |
| Dialog | Overlay | Modal dialogs with compound API |
| EmptyState | Feedback | Placeholder for empty content areas |
| Grid | Layout | Responsive grid layout with breakpoint support |
| Input | Forms | Text input with label, error, and helper text |
| Menu | Overlay | Dropdown action menus |
| Popover | Overlay | Floating content panels |
| Progress | Feedback | Linear progress bar |
| RadioGroup | Forms | Single-select from a group of options |
| Select | Forms | Dropdown selection control |
| Separator | Layout | Visual divider between content |
| Skeleton | Feedback | Loading placeholder that preserves layout |
| Table | Data | Data table with sorting and selection |
| Tabs | Navigation | Tabbed content panels |
| Textarea | Forms | Multi-line text input |
| Toast | Feedback | Transient notifications |
| Toggle | Forms | On/off switch control |
| Tooltip | Overlay | Contextual information on hover |

## Design Tokens

### Seed-Based Configuration (Recommended)

Configure ~5-10 seeds and everything derives automatically. Set seed variables in your SCSS before importing:

```scss
// styles/globals.scss

// Minimal setup - just your brand color
$fui-brand: #0066ff;
@use '@fragments-sdk/ui/globals';
```

```scss
// Full customization
$fui-brand: #0066ff;             // Primary brand color
$fui-neutral: "steel";           // Palette: "steel" | "sand" | "smoke" | "ash" | "silver"
$fui-density: "compact";         // Spacing: "compact" | "default" | "relaxed"
$fui-radius-style: "rounded";    // Corners: "sharp" | "subtle" | "default" | "rounded" | "pill"

// Optional semantic color overrides
$fui-danger: #dc2626;
$fui-success: #16a34a;

@use '@fragments-sdk/ui/globals';
```

#### Available Seeds

| Seed | Type | Default | Description |
|------|------|---------|-------------|
| `$fui-brand` | Color | `#18181b` | Primary brand color - derives accent, focus rings, etc. |
| `$fui-neutral` | String | `"ash"` | Neutral palette for surfaces, text, borders |
| `$fui-density` | String | `"default"` | Spacing density scale |
| `$fui-radius-style` | String | `"default"` | Corner radius style |
| `$fui-danger` | Color | `#ef4444` | Error/danger semantic color |
| `$fui-success` | Color | `#22c55e` | Success semantic color |
| `$fui-warning` | Color | `#f59e0b` | Warning semantic color |
| `$fui-info` | Color | `#3b82f6` | Info semantic color |

#### Neutral Palettes

| Name | Description |
|------|-------------|
| `steel` | Cool blue-tinted grays (professional, tech) |
| `sand` | Warm brown-tinted grays (organic, approachable) |
| `smoke` | Pure true grays (minimal, neutral) |
| `ash` | Muted cool neutrals (subtle, balanced) - default |
| `silver` | Bright clean grays (light, modern) |

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
@use '@fragments-sdk/ui/tokens' as *;

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

- Existing `@use '@fragments/ui/tokens'` imports work unchanged
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
   $fui-brand: #0066ff;
   $fui-neutral: "steel";
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

## Composition Blocks

The library includes composition blocks — named patterns showing how components wire together for common use cases:

- **Login Form** — Email/password authentication form
- **Confirm Dialog** — Destructive action confirmation
- **Card Grid** — Responsive auto-fill card layout
- **Form Layout** — Two-column form with Grid
- **Dashboard Layout** — Featured card with metrics grid
- **Settings Page** — Settings sections with cards and controls

Access blocks via the MCP server's `fragments_blocks` tool or `fragments_context`.

## License

MIT
