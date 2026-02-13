import React from 'react';
import { defineFragment } from '@fragments/core';
import { CodeBlock } from '.';

export default defineFragment({
  component: CodeBlock,

  meta: {
    name: 'CodeBlock',
    description: 'Syntax-highlighted code display with copy functionality, theming, diff view, and collapsible sections',
    category: 'display',
    status: 'stable',
    tags: ['code', 'syntax', 'highlighting', 'documentation', 'developer', 'diff'],
    dependencies: [
      { name: 'shiki', version: '>=1.0.0', reason: 'Syntax highlighting engine' },
    ],
  },

  usage: {
    when: [
      'Displaying code examples in documentation',
      'Showing installation commands',
      'Presenting configuration snippets',
      'Teaching programming concepts',
      'Showing code diffs or changes',
      'Displaying long code files with collapse functionality',
    ],
    whenNot: [
      'User-editable code (use code editor)',
      'Very short inline code (use <code> element)',
      'Non-code content (use Text or Card)',
    ],
    guidelines: [
      'Always specify the correct language for accurate highlighting',
      'Use filename prop to show source file name in header bar',
      'Use copyPlacement="auto" to render copy in overlay mode when no filename is provided',
      'Use title prop for external labels above the code block',
      'Enable line numbers for longer code samples',
      'Use highlightLines to draw attention to key lines',
      'Use addedLines/removedLines for diff highlighting',
      'Set maxHeight for very long code blocks to prevent layout issues',
      'Use collapsible for code samples that users may want to skim',
      'Choose a theme that matches your documentation style',
      'Keep code examples concise and focused',
    ],
    accessibility: [
      'Code is presented in a semantic pre/code structure',
      'Copy button has appropriate aria-label',
      'Keyboard accessible copy functionality',
      'Collapse button has aria-expanded state',
    ],
  },

  props: {
    code: {
      type: 'string',
      required: true,
      description: 'The code string to display',
    },
    language: {
      type: 'enum',
      values: [
        'tsx', 'typescript', 'javascript', 'jsx', 'bash', 'shell',
        'css', 'scss', 'sass', 'json', 'html', 'xml', 'markdown', 'md',
        'yaml', 'yml', 'python', 'py', 'ruby', 'go', 'rust', 'java',
        'kotlin', 'swift', 'c', 'cpp', 'csharp', 'php', 'sql', 'graphql',
        'diff', 'plaintext',
      ],
      default: 'tsx',
      description: 'Programming language for syntax highlighting',
    },
    theme: {
      type: 'enum',
      values: [
        'synthwave-84', 'github-dark', 'github-light', 'one-dark-pro',
        'dracula', 'nord', 'monokai', 'vitesse-dark', 'vitesse-light',
        'min-dark', 'min-light',
      ],
      default: 'one-dark-pro',
      description: 'Syntax highlighting theme',
    },
    showCopy: {
      type: 'boolean',
      default: true,
      description: 'Whether to show the copy button',
    },
    copyPlacement: {
      type: 'enum',
      values: ['auto', 'header', 'overlay'],
      default: 'auto',
      description: 'Where to place the copy button when not using persistentCopy',
    },
    title: {
      type: 'string',
      description: 'Optional title displayed above the code block (external label)',
    },
    filename: {
      type: 'string',
      description: 'Optional filename shown in header bar inside code block',
    },
    caption: {
      type: 'string',
      description: 'Optional caption displayed below the code block',
    },
    showLineNumbers: {
      type: 'boolean',
      default: false,
      description: 'Whether to display line numbers',
    },
    startLineNumber: {
      type: 'number',
      default: 1,
      description: 'Starting line number (useful for code excerpts)',
    },
    highlightLines: {
      type: 'array',
      description: 'Lines to highlight (e.g., [1, 3, "5-7"])',
    },
    addedLines: {
      type: 'array',
      description: 'Lines marked as added in diff view (e.g., [2, "4-6"])',
    },
    removedLines: {
      type: 'array',
      description: 'Lines marked as removed in diff view (e.g., [1, 3])',
    },
    wordWrap: {
      type: 'boolean',
      default: false,
      description: 'Enable word wrapping for long lines',
    },
    maxHeight: {
      type: 'number',
      description: 'Maximum height in pixels (enables scrolling)',
    },
    collapsible: {
      type: 'boolean',
      default: false,
      description: 'Allow collapsing/expanding the code block',
    },
    defaultCollapsed: {
      type: 'boolean',
      default: false,
      description: 'Initial collapsed state (only applies when collapsible is true)',
    },
    collapsedLines: {
      type: 'number',
      default: 5,
      description: 'Number of lines to show when collapsed',
    },
    compact: {
      type: 'boolean',
      default: false,
      description: 'Compact mode with reduced padding',
    },
    persistentCopy: {
      type: 'boolean',
      default: false,
      description: 'Show a persistent copy button that is always visible',
    },
  },

  relations: [
    {
      component: 'Card',
      relationship: 'parent',
      note: 'Can be wrapped in Card for additional context',
    },
    {
      component: 'Tabs',
      relationship: 'child',
      note: 'Use in Tabs for showing code in multiple languages',
    },
  ],

  contract: {
    propsSummary: [
      'code: string - required code content',
      'language: tsx|typescript|javascript|jsx|bash|shell|css|scss|sass|json|html|xml|markdown|md|yaml|yml|python|py|ruby|go|rust|java|kotlin|swift|c|cpp|csharp|php|sql|graphql|diff|plaintext',
      'theme: synthwave-84|github-dark|github-light|one-dark-pro|dracula|nord|monokai|vitesse-dark|vitesse-light|min-dark|min-light (default: one-dark-pro)',
      'showCopy: boolean (default: true)',
      'copyPlacement: auto|header|overlay (default: auto)',
      'title: string - optional external label',
      'filename: string - optional filename in header bar',
      'caption: string - optional footer caption',
      'showLineNumbers: boolean (default: false)',
      'startLineNumber: number (default: 1)',
      'highlightLines: (number | string)[] - lines to emphasize',
      'addedLines: (number | string)[] - diff added lines',
      'removedLines: (number | string)[] - diff removed lines',
      'wordWrap: boolean (default: false)',
      'maxHeight: number - max height with scrolling',
      'collapsible: boolean (default: false)',
      'defaultCollapsed: boolean (default: false)',
      'collapsedLines: number (default: 5)',
    ],
    scenarioTags: [
      'documentation.code',
      'content.technical',
      'developer.tools',
    ],
    a11yRules: [
      'A11Y_CODE_SEMANTIC',
      'A11Y_BTN_LABEL',
    ],
    bans: [],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic code block with syntax highlighting',
      render: () => (
<CodeBlock code={`import { Button } from '@fragments-sdk/ui';

function App() {
  return <Button>Click me</Button>;
}`} language="tsx" />
      ),
    },
    {
      name: 'With Filename',
      description: 'Code block with filename in header bar',
      render: () => (
<CodeBlock filename="app.tsx" code={`import { Button, Card } from '@fragments-sdk/ui';

function App() {
  return (
    <Card>
      <Card.Header>Welcome</Card.Header>
      <Card.Content>
        <Button>Get Started</Button>
      </Card.Content>
    </Card>
  );
}`} language="tsx" />
      ),
    },
    {
      name: 'With Title',
      description: 'Code block with external title label',
      render: () => (
<CodeBlock title="Installation" code="npm install @fragments-sdk/ui" language="bash" />
      ),
    },
    {
      name: 'With Caption',
      description: 'Code block with footer caption',
      render: () => (
<CodeBlock
  code={`const API_URL = process.env.NEXT_PUBLIC_API_URL;`}
  language="typescript"
  caption="Environment variables must be prefixed with NEXT_PUBLIC_ to be available in the browser."
/>
      ),
    },
    {
      name: 'With Line Numbers',
      description: 'Shows line numbers for reference',
      render: () => (
<CodeBlock code={`const greeting = "Hello";
const name = "World";
console.log(\`\${greeting}, \${name}!\`);`} language="typescript" showLineNumbers />
      ),
    },
    {
      name: 'Custom Start Line',
      description: 'Shows code excerpt starting from a specific line number',
      render: () => (
<CodeBlock
  code={`  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`}
  language="tsx"
  showLineNumbers
  startLineNumber={15}
  caption="Lines 15-20 from Counter.tsx"
/>
      ),
    },
    {
      name: 'With Highlighted Lines',
      description: 'Emphasizes specific lines of code',
      render: () => (
<CodeBlock code={`import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`} language="tsx" showLineNumbers highlightLines={[4, '7-9']} />
      ),
    },
    {
      name: 'Diff View',
      description: 'Shows added and removed lines in a diff-like format',
      render: () => (
<CodeBlock
  code={`import { useState } from 'react';
import { useCallback } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(c => c + 1);
  const increment = useCallback(() => setCount(c => c + 1), []);

  return <button onClick={increment}>Count: {count}</button>;
}`}
  language="tsx"
  showLineNumbers
  removedLines={[6]}
  addedLines={[2, 7]}
/>
      ),
    },
    {
      name: 'GitHub Dark Theme',
      description: 'Using the GitHub Dark theme',
      render: () => (
<CodeBlock
  code={`async function fetchUser(id: string) {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`}
  language="typescript"
  theme="github-dark"
/>
      ),
    },
    {
      name: 'GitHub Light Theme',
      description: 'Using the GitHub Light theme for light backgrounds',
      render: () => (
<CodeBlock
  code={`def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`}
  language="python"
  theme="github-light"
/>
      ),
    },
    {
      name: 'Dracula Theme',
      description: 'Using the popular Dracula theme',
      render: () => (
<CodeBlock
  code={`fn main() {
    println!("Hello, Rust!");
}`}
  language="rust"
  theme="dracula"
/>
      ),
    },
    {
      name: 'Word Wrap',
      description: 'Long lines wrap instead of scrolling horizontally',
      render: () => (
<CodeBlock
  code={`const longString = "This is a very long string that would normally cause horizontal scrolling, but with word wrap enabled it will break to the next line instead.";`}
  language="typescript"
  wordWrap
/>
      ),
    },
    {
      name: 'Max Height with Scroll',
      description: 'Constrains height with scrollable content',
      render: () => (
<CodeBlock
  code={`// This code block has a maximum height
function processItems(items: string[]) {
  const results = [];
  for (const item of items) {
    if (item.startsWith('_')) {
      continue;
    }
    const processed = item.trim().toLowerCase();
    if (processed.length > 0) {
      results.push(processed);
    }
  }
  return results;
}

export default processItems;`}
  language="typescript"
  maxHeight={150}
  showLineNumbers
/>
      ),
    },
    {
      name: 'Collapsible',
      description: 'Long code that can be expanded/collapsed',
      render: () => (
<CodeBlock
  code={`import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(\`/api/users/\${userId}\`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}`}
  language="tsx"
  showLineNumbers
  collapsible
  defaultCollapsed
  collapsedLines={8}
/>
      ),
    },
    {
      name: 'JSON',
      description: 'Configuration file example',
      render: () => (
<CodeBlock title="package.json" code={`{
  "name": "my-app",
  "dependencies": {
    "@fragments-sdk/ui": "^0.3.0"
  }
}`} language="json" />
      ),
    },
    {
      name: 'Without Copy Button',
      description: 'Minimal display without copy functionality',
      render: () => (
<CodeBlock code="const simple = true;" language="typescript" showCopy={false} />
      ),
    },
  ],
});
