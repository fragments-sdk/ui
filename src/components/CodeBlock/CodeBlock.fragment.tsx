import React from 'react';
import { defineSegment } from '@fragments/core';
import { CodeBlock } from './index.js';

export default defineSegment({
  component: CodeBlock,

  meta: {
    name: 'CodeBlock',
    description: 'Syntax-highlighted code display with copy functionality',
    category: 'content',
    status: 'stable',
    tags: ['code', 'syntax', 'highlighting', 'documentation', 'developer'],
  },

  usage: {
    when: [
      'Displaying code examples in documentation',
      'Showing installation commands',
      'Presenting configuration snippets',
      'Teaching programming concepts',
    ],
    whenNot: [
      'User-editable code (use code editor)',
      'Very short inline code (use <code> element)',
      'Non-code content (use Text or Card)',
    ],
    guidelines: [
      'Always specify the correct language for accurate highlighting',
      'Use filename prop to show source file name in header bar',
      'Use title prop for external labels above the code block',
      'Enable line numbers for longer code samples',
      'Use highlightLines to draw attention to key lines',
      'Keep code examples concise and focused',
    ],
    accessibility: [
      'Code is presented in a semantic pre/code structure',
      'Copy button has appropriate aria-label',
      'Keyboard accessible copy functionality',
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
      values: ['tsx', 'typescript', 'javascript', 'bash', 'css', 'scss', 'json', 'html'],
      default: 'tsx',
      description: 'Programming language for syntax highlighting',
    },
    showCopy: {
      type: 'boolean',
      default: true,
      description: 'Whether to show the copy button',
    },
    title: {
      type: 'string',
      description: 'Optional title displayed above the code block (external label)',
    },
    filename: {
      type: 'string',
      description: 'Optional filename shown in header bar inside code block',
    },
    showLineNumbers: {
      type: 'boolean',
      default: false,
      description: 'Whether to display line numbers',
    },
    highlightLines: {
      type: 'array',
      description: 'Lines to highlight (e.g., [1, 3, "5-7"])',
    },
    className: {
      type: 'string',
      description: 'Additional CSS class name',
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
      'language: tsx|typescript|javascript|bash|css|scss|json|html',
      'showCopy: boolean (default: true)',
      'title: string - optional external label',
      'filename: string - optional filename in header bar',
      'showLineNumbers: boolean (default: false)',
      'highlightLines: (number | string)[] - lines to emphasize',
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
      name: 'With Line Numbers',
      description: 'Shows line numbers for reference',
      render: () => (
<CodeBlock code={`const greeting = "Hello";
const name = "World";
console.log(\`\${greeting}, \${name}!\`);`} language="typescript" showLineNumbers />
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
