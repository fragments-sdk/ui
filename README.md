# @usefragments/ui

[![npm](https://img.shields.io/npm/v/@usefragments/ui)](https://www.npmjs.com/package/@usefragments/ui)
[![CI](https://github.com/fragments-sdk/ui/actions/workflows/ci.yml/badge.svg)](https://github.com/fragments-sdk/ui/actions/workflows/ci.yml)

React components built on [Base UI](https://base-ui.com/) headless primitives, themed from a few
seed values.

It covers forms, overlays, navigation, layout, data display (tables and charts) and chat
interfaces (`Prompt`, `Message`, `ConversationList`). Light and dark mode come from the same seeds.
Every style rule sits in a `fui.*` cascade layer, so your own unlayered CSS wins.

Documentation: [usefragments.com](https://usefragments.com)

## Install

```bash
npm install @usefragments/ui
# or: pnpm add @usefragments/ui
```

Requires React 18 or 19 (`react` and `react-dom`).

Upgrading from v3? Read the [v4 migration guide](docs/migration-v4.md).

## Quick start

Import the prebuilt stylesheet once, in your app entry. It holds the default tokens, light and
dark mode, and the styles for every component.

```tsx
import "@usefragments/ui/styles";
```

Then use the components:

```tsx
import { Button, Card, Field, Input } from "@usefragments/ui";

export function InviteCard() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Invite a teammate</Card.Title>
      </Card.Header>
      <Card.Body>
        <Field>
          <Field.Label>Email</Field.Label>
          <Input type="email" />
        </Field>
      </Card.Body>
      <Card.Footer>
        <Button>Send invite</Button>
      </Card.Footer>
    </Card>
  );
}
```

Compound components carry their parts on the root (`Card.Header`, `Field.Label`).

## Theming

### At runtime

Put `Theme` at the root of your app. It sets the colour mode on `<html>`, stores the choice in
`localStorage`, and applies the inputs you pass. Add `ThemeScript` to `<head>` so a reload paints
the stored mode first.

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

- **Inputs:** `brand`, `neutral`, `radius`, `scale`, `font`, `pressScale`, `primaryChrome`, and the
  tone colours `danger`, `success`, `warning` and `info`.
- **Mode:** `mode` or `defaultMode`, each `light`, `dark` or `system`.
- **Scopes:** a `Theme` inside another `Theme` renders one `<div data-fui-theme>`, and everything
  inside it re-derives from its own inputs and mode.

Without React, call `configureTheme` once at startup, or set the inputs as CSS custom properties:

```css
:root {
  --fui-seed-brand: #0066ff;
}
```

### In Sass

The Sass entry takes the seeds at compile time. Import the prebuilt CSS first and your configured
file after it, so your seeds apply.

```scss
// styles/theme.scss
@use "@usefragments/ui/scss" with (
  $fui-brand: #0066ff,
  $fui-radius-style: "rounded"
);
```

```tsx
import "@usefragments/ui/styles";
import "./styles/theme.scss";
```

| Seed                | Default                | Values                                                    |
| ------------------- | ---------------------- | --------------------------------------------------------- |
| `$fui-brand`        | `#3d5ae8`              | Any colour. The accent, focus ring and selection use it.  |
| `$fui-neutral`      | `"paper"`              | `"paper"` (a warm grey) or any colour                     |
| `$fui-radius-style` | `"default"`            | `"sharp"`, `"subtle"`, `"default"`, `"rounded"`, `"pill"` |
| `$fui-danger`       | `#d13d1f`              | Any colour                                                |
| `$fui-success`      | `#2fbf8f`              | Any colour                                                |
| `$fui-warning`      | `#f2a100`              | Any colour                                                |
| `$fui-info`         | `oklch(0.58 0.13 245)` | Any colour                                                |

### Tokens in your own styles

Tokens are CSS custom properties with the `--fui-` prefix. `@usefragments/ui/tokens` gives each
one a Sass twin to use as a fallback, and `@usefragments/ui/mixins` holds breakpoints and other
helpers.

```scss
@use "@usefragments/ui/tokens" as *;
@use "@usefragments/ui/mixins" as *;

.panel {
  background: var(--fui-bg-secondary, $fui-bg-secondary);
  color: var(--fui-text-primary, $fui-text-primary);
  border: 1px solid var(--fui-border, $fui-border);
  border-radius: var(--fui-radius-surface, $fui-radius-surface);

  @include breakpoint-md {
    display: grid;
  }
}
```

`tokens.css` in the package lists the public tokens with their default values.

## Optional peer dependencies

Some components need a library that is listed as an optional peer. Install it only if you use that
component.

| Component          | Install                                                          | Entry point                           |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------- |
| `Chart`            | `recharts`                                                       | `@usefragments/ui/chart`              |
| `CodeBlock`        | `shiki`                                                          | `@usefragments/ui/codeblock`          |
| `ColorPicker`      | `react-colorful`                                                 | `@usefragments/ui/colorpicker`        |
| `DataTable`        | `@tanstack/react-table`                                          | `@usefragments/ui/data-table`         |
| `DataTableVirtual` | `@tanstack/react-virtual`                                        | `@usefragments/ui/data-table-virtual` |
| `DatePicker`       | `react-day-picker`, plus `date-fns` for a `locale`               | `@usefragments/ui/datepicker`         |
| `Editor`           | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link` | `@usefragments/ui/editor`             |
| `Markdown`         | `react-markdown`, `remark-gfm`                                   | `@usefragments/ui/markdown`           |

All of these except `DataTableVirtual` are also exported from `@usefragments/ui` and load their peer
only when they render, so the rest of the library works without it. `DataTableVirtual` imports its
peer directly, so it is only available from its own entry point.

## Next.js and server components

Each component module is a client module (`"use client"`). In an App Router server component you
can render a component, but a compound's parts (`Card.Header`, `Dialog.Trigger`) are undefined
there. Use compound parts inside a client component. `ThemeScript` is a server component and works
in a server layout.

## Files for tools and coding agents

The package ships two files that describe the library without running it:

- **`fragments.json`**, also importable as `@usefragments/ui/fragments.json` and named by the
  `fragments` field in `package.json`. For every component it lists the props, when to use it and
  when not to, its variants with code examples, accessibility rules, and related components. It
  also holds composition examples and the token list.
- **`tokens.css`**, the public tokens at the default seeds as literal values, for tools that read
  CSS without a browser.

## Development

```bash
git clone https://github.com/fragments-sdk/ui.git
cd ui
corepack pnpm install
```

Corepack uses the pnpm version pinned in `package.json`. Run scripts the same way
(`corepack pnpm test`), or run `corepack enable` once and drop the prefix. CI uses Node 24.

| Command                | What it does                                                                 |
| ---------------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`             | Storybook on port 6006                                                       |
| `pnpm build`           | Builds `dist/` and checks measurements, cascade layers and size budgets      |
| `pnpm test`            | Unit tests (Vitest). The packaging tests read `dist/`, so build first.       |
| `pnpm lint`            | ESLint, then the library's own style and copy lint                           |
| `pnpm typecheck`       | TypeScript for the source and the tests                                      |
| `pnpm build-storybook` | Static Storybook build                                                       |
| `pnpm test:states`     | Renders every `*.states.tsx` fixture in three engines and on touch, with axe |
| `pnpm test:geometry`   | Measures component sizes and positions in Storybook against recorded cases   |
| `pnpm test:contrast`   | Measures WCAG contrast of the colour pairs across many brand seeds           |
| `pnpm test:rsc`        | Renders every compound in a Next.js App Router app                           |

The browser lanes use Playwright. Install the engines with
`pnpm exec playwright install chromium webkit firefox`. The [states](states/README.md) and
[contrast](contrast/README.md) lanes have their own READMEs.

## Contributing

Read [CONTRIBUTING.md](.github/CONTRIBUTING.md) before opening a pull request, and follow the
[code of conduct](.github/CODE_OF_CONDUCT.md). Report a vulnerability as described in
[SECURITY.md](.github/SECURITY.md), not in a public issue. Maintainers release with
[RELEASING.md](.github/RELEASING.md).

## License

[MIT](LICENSE)
