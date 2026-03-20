# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in `libs/ui/`.

## Commands

```bash
pnpm test                     # Run all component tests (vitest, jsdom)
pnpm vitest run src/components/Button/Button.test.tsx  # Single test file
pnpm run lint                 # ESLint
pnpm run build                # Build fragments.json metadata
pnpm run build:dist           # Vite build + tsc declarations
pnpm run build:publish        # Full build (fragments + dist)
pnpm run check:fragments      # Validate fragments without writing
pnpm run validate             # Validate against CLI schema
```

## Component file structure

Every component is a folder with four files:

```
src/components/Button/
├── index.tsx              # Component source
├── Button.module.scss     # Styles (SCSS modules)
├── Button.test.tsx        # Tests (vitest + axe-core)
└── Button.contract.json   # Auto-generated metadata (never edit)
```

## Compound component pattern

63/67 components use `Object.assign` to attach sub-components:

```tsx
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Body: CardBody,
  Footer: CardFooter,
});
```

The barrel export in `src/index.ts` re-exports both the compound parent and each sub-component individually:

```tsx
export { Card, CardRoot, CardHeader, CardTitle, ... type CardProps }
```

Do NOT break this pattern by splitting into separate exports or removing the `Object.assign`.

## SCSS token system

All styles must use the dual fallback pattern — CSS variable for runtime theming, SCSS variable for build-time:

```scss
// Correct
color: var(--fui-text-primary, $fui-text-primary);
padding: var(--fui-space-2, $fui-space-2);

// Wrong — missing SCSS fallback
color: var(--fui-text-primary);
```

Token prefix is always `fui-`. Do not invent token names — check `src/tokens/_variables.scss` or `_computed.scss`.

**Seeds** (5 root values that derive 120+ tokens):
- `$fui-brand` — primary color
- `$fui-neutral` — palette name (stone/ice/earth/sand/fire)
- `$fui-density` — spacing (compact/default/relaxed)
- `$fui-radius-style` — corners (sharp/subtle/default/rounded/pill)
- `$fui-danger` — danger color

CSS Modules use `localsConvention: 'camelCase'` — SCSS `.my-class` becomes `styles.myClass` in JS.

## Testing

Tests use custom utilities, NOT raw `@testing-library/react`:

```tsx
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
```

- `expectNoA11yViolations(container)` runs axe-core a11y audit
- Use `screen.getByRole()` and a11y assertions (`toHaveAccessibleName`, etc.)
- vitest globals are enabled — no need to import `describe`/`it`/`expect`
- jsdom canvas errors in stderr are harmless (axe-core measuring canvas)

## Optional peer deps

Heavy libraries are optional with lazy `require()` and `eslint-disable`:

| Component | Peer deps |
|-----------|-----------|
| DatePicker | react-day-picker, date-fns |
| Chart | recharts |
| CodeBlock | shiki |
| Markdown | react-markdown, remark-gfm |
| ColorPicker | react-colorful |
| DataTable | @tanstack/react-table |
| Editor | @tiptap/react, @tiptap/starter-kit |

The `eslint-disable` on these `require()` calls is intentional — do not remove.

## Build outputs

- Vite builds CJS + ESM with `preserveModules: true` (tree-shakeable)
- CSS is bundled into a single `ui.css` (no code-splitting)
- Separate entry points for heavy components: `./datepicker`, `./chart`, `./codeblock`, etc.
- `fragments.json` is auto-generated metadata consumed by MCP servers and docs — do not edit manually

## Blocks

`src/blocks/` contains 31 composition patterns (`.block.ts`) defined via `defineBlock()`. These show how multiple components wire together for real use cases (LoginForm, DashboardPage, ChatInterface, etc.).
