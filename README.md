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

Access SCSS variables and mixins for custom styling:

```scss
@use '@fragments-sdk/ui/tokens' as *;

.custom {
  padding: $fui-spacing-4;
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

## Composition Recipes

The library includes composition recipes — named patterns showing how components wire together for common use cases:

- **Login Form** — Email/password authentication form
- **Confirm Dialog** — Destructive action confirmation
- **Card Grid** — Responsive auto-fill card layout
- **Form Layout** — Two-column form with Grid
- **Dashboard Layout** — Featured card with metrics grid
- **Settings Page** — Settings sections with cards and controls

Access recipes via the MCP server's `fragments_recipe` tool or `fragments_context`.

## License

MIT
