import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from '.';

/**
 * Syntax-highlighted code display with copy, theming, diff view, line
 * numbers, and collapsible sections. The required `code` prop holds the
 * content; `language` and `theme` control highlighting.
 */
const meta = {
  title: 'Display/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Syntax-highlighted code display with copy functionality.',
      },
    },
  },
  argTypes: {
    language: {
      control: 'select',
      options: [
        'tsx',
        'typescript',
        'ts',
        'javascript',
        'js',
        'jsx',
        'bash',
        'shell',
        'css',
        'scss',
        'sass',
        'json',
        'html',
        'xml',
        'markdown',
        'md',
        'yaml',
        'yml',
        'python',
        'py',
        'ruby',
        'go',
        'rust',
        'java',
        'kotlin',
        'swift',
        'c',
        'cpp',
        'csharp',
        'php',
        'sql',
        'graphql',
        'diff',
        'plaintext',
        'text',
      ],
      description: 'Programming language for syntax highlighting',
    },
    theme: {
      control: 'select',
      options: [
        'synthwave-84',
        'github-dark',
        'github-light',
        'one-dark-pro',
        'dracula',
        'nord',
        'monokai',
        'vitesse-dark',
        'vitesse-light',
        'min-dark',
        'min-light',
      ],
      description: 'Syntax highlighting theme',
    },
    copyPlacement: {
      control: 'select',
      options: ['auto', 'header', 'overlay'],
      description: 'Where to place the copy button',
    },
    showCopy: { control: 'boolean' },
    showLineNumbers: { control: 'boolean' },
    wordWrap: { control: 'boolean' },
    collapsible: { control: 'boolean' },
    defaultCollapsed: { control: 'boolean' },
    compact: { control: 'boolean' },
    persistentCopy: { control: 'boolean' },
  },
  args: {
    code: "import { Button } from '@fragments-sdk/ui';\n\nfunction App() {\n  return <Button>Click me</Button>;\n}",
    language: 'tsx',
    theme: 'one-dark-pro',
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFilename: Story = {
  args: {
    filename: 'app.tsx',
    code: "import { Button, Card } from '@fragments-sdk/ui';\n\nfunction App() {\n  return <Button>Get Started</Button>;\n}",
  },
};

export const WithLineNumbers: Story = {
  args: {
    showLineNumbers: true,
    language: 'typescript',
    code: 'const greeting = "Hello";\nconst name = "World";\nconsole.log(`${greeting}, ${name}!`);',
  },
};

export const DiffView: Story = {
  args: {
    language: 'tsx',
    showLineNumbers: true,
    removedLines: [2],
    addedLines: [3],
    code: 'function Counter() {\n  const inc = () => setCount(c => c + 1);\n  const inc = useCallback(() => setCount(c => c + 1), []);\n  return <button onClick={inc}>Count</button>;\n}',
  },
};

export const Bash: Story = {
  args: {
    language: 'bash',
    title: 'Installation',
    code: 'npm install @fragments-sdk/ui',
  },
};

export const Collapsible: Story = {
  args: {
    language: 'tsx',
    showLineNumbers: true,
    collapsible: true,
    defaultCollapsed: true,
    collapsedLines: 4,
    code: 'export function UserProfile({ userId }: { userId: string }) {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  if (loading) return <div>Loading...</div>;\n  if (error) return <div>Error</div>;\n  return <h1>{user.name}</h1>;\n}',
  },
};
