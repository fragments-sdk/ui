import type { Meta, StoryObj } from "@storybook/react";
import { CodeBlock } from ".";

/**
 * Syntax-highlighted code on the band: mono 12 (11 at `size="sm"`), a visible
 * copy action that says "Copied" or "Couldn't copy", line numbers, marked
 * lines, a diff view and one fold. Colours follow the theme through one
 * css-variables highlighter theme.
 */
const meta = {
  title: "Display/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Syntax-highlighted code display with copy functionality.",
      },
    },
  },
  argTypes: {
    language: {
      control: "select",
      options: [
        "tsx",
        "typescript",
        "ts",
        "javascript",
        "js",
        "jsx",
        "bash",
        "shell",
        "css",
        "scss",
        "sass",
        "json",
        "html",
        "xml",
        "markdown",
        "md",
        "yaml",
        "yml",
        "python",
        "py",
        "ruby",
        "go",
        "rust",
        "java",
        "kotlin",
        "swift",
        "c",
        "cpp",
        "csharp",
        "php",
        "sql",
        "graphql",
        "diff",
        "plaintext",
        "text",
      ],
      description: "Programming language for syntax highlighting",
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md"],
      description: "Code type step",
    },
    showCopy: { control: "boolean" },
    showLineNumbers: { control: "boolean" },
    wordWrap: { control: "boolean" },
    collapsible: { control: "boolean" },
    defaultCollapsed: { control: "boolean" },
  },
  args: {
    code: "import { Button } from '@usefragments/ui';\n\nfunction App() {\n  return <Button>Click me</Button>;\n}",
    language: "tsx",
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: {
    title: "app.tsx",
    code: "import { Button, Card } from '@usefragments/ui';\n\nfunction App() {\n  return <Button>Get Started</Button>;\n}",
  },
};

export const WithLineNumbers: Story = {
  args: {
    showLineNumbers: true,
    language: "typescript",
    code: 'const greeting = "Hello";\nconst name = "World";\nconsole.log(`${greeting}, ${name}!`);',
  },
};

export const DiffView: Story = {
  args: {
    language: "tsx",
    showLineNumbers: true,
    removedLines: [2],
    addedLines: [3],
    code: "function Counter() {\n  const inc = () => setCount(c => c + 1);\n  const inc = useCallback(() => setCount(c => c + 1), []);\n  return <button onClick={inc}>Count</button>;\n}",
  },
};

export const Bash: Story = {
  args: {
    language: "bash",
    code: "npm install @usefragments/ui",
  },
};

export const Collapsible: Story = {
  args: {
    language: "tsx",
    showLineNumbers: true,
    collapsible: true,
    defaultCollapsed: true,
    collapsedLines: 4,
    code: "export function UserProfile({ userId }: { userId: string }) {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  if (loading) return <Loading />;\n  if (error) return <div>Error</div>;\n  return <h1>{user.name}</h1>;\n}",
  },
};

export const HighlightedLines: Story = {
  args: {
    language: "typescript",
    showLineNumbers: true,
    highlightLines: [2],
    code: 'const status = await check();\nif (status === "blocked") notify(owner);\nreturn status;',
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    language: "bash",
    title: "Run in CI",
    code: "npx @usefragments/cli check --ci",
  },
};

export const Tabbed: Story = {
  render: () => (
    <CodeBlock.Tabbed
      tabs={[
        { label: "pnpm", language: "bash", code: "pnpm add @usefragments/ui" },
        { label: "npm", language: "bash", code: "npm install @usefragments/ui" },
      ]}
    />
  ),
};
