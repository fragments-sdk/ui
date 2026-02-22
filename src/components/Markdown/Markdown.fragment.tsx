import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Markdown } from '.';

const defaultContent = `# Hello World

This is a paragraph with **bold text** and *italic text*.

Here is some \`inline code\` within a sentence.

- First item
- Second item
- Third item

> A blockquote for emphasis.
`;

const gfmTableContent = `## Data Overview

| Feature    | Status    | Priority |
|------------|-----------|----------|
| Markdown   | Done      | High     |
| Tables     | Done      | Medium   |
| Task Lists | Planned   | Low      |

Notes:
- [x] Support GFM tables
- [x] Support task lists
- [ ] Syntax highlighting
`;

const codeBlockContent = `## Code Example

Here is a JavaScript function:

\`\`\`js
function greet(name) {
  return \\\`Hello, \\\${name}!\\\`;
}

console.log(greet('World'));
\`\`\`

And some inline code: \`const x = 42;\`
`;

const mixedContent = `# Project Update

## Summary

The project is progressing well. Here are the **key highlights**:

1. Completed the *design system* components
2. Added markdown rendering support
3. Integrated with the documentation site

### Performance Metrics

| Metric       | Before | After  |
|-------------|--------|--------|
| Bundle Size | 142kb  | 98kb   |
| Load Time   | 1.2s   | 0.8s   |
| Lighthouse  | 72     | 95     |

> These improvements were achieved through tree-shaking and code splitting.

### Next Steps

- [ ] Add syntax highlighting
- [ ] Support custom themes
- [x] GFM table support

---

For more details, see the [documentation](#).
`;

export default defineFragment({
  component: Markdown,

  meta: {
    name: 'Markdown',
    description: 'Renders markdown strings as styled prose using react-markdown and remark-gfm. Supports headings, lists, tables, code blocks, blockquotes, and more.',
    category: 'display',
    status: 'stable',
    tags: ['markdown', 'prose', 'content', 'text', 'ai', 'chat'],
    since: '0.7.0',
    dependencies: [
      { name: 'react-markdown', version: '>=9.0.0', reason: 'Markdown parsing and rendering' },
      { name: 'remark-gfm', version: '>=4.0.0', reason: 'GitHub Flavored Markdown support (optional)' },
    ],
  },

  usage: {
    when: [
      'Rendering AI/LLM response content',
      'Displaying user-authored markdown text',
      'Showing documentation or readme content',
      'Rich text display without a WYSIWYG editor',
    ],
    whenNot: [
      'Plain text without formatting (use Text)',
      'Editing markdown (use a markdown editor component)',
      'Rendering trusted HTML directly (use dangerouslySetInnerHTML)',
    ],
    guidelines: [
      'Install react-markdown and remark-gfm as peer dependencies',
      'Use the components prop to override default element rendering',
      'Content is sanitized by react-markdown by default',
      'Falls back to plain text paragraphs if react-markdown is not installed',
      'Standard div props (id, style, aria-*, data-*) are forwarded to the Markdown wrapper',
    ],
    accessibility: [
      'Rendered HTML follows semantic structure (headings, lists, tables)',
      'Links are rendered as proper anchor elements',
      'Images include alt text from markdown syntax',
      'Tables use proper th/td structure for screen readers',
    ],
  },

  props: {
    content: {
      type: 'string',
      description: 'Markdown string to render',
      required: true,
    },
    components: {
      type: 'object',
      description: 'Override map for markdown element components (e.g., { h1: MyHeading }). Accepts custom renderer component signatures used by react-markdown',
    },
    className: {
      type: 'string',
      description: 'Additional CSS class name',
    },
  },

  relations: [
    { component: 'Text', relationship: 'alternative', note: 'Use Text for plain, non-markdown text' },
    { component: 'CodeBlock', relationship: 'complementary', note: 'CodeBlock can be used via components prop for syntax highlighting' },
    { component: 'Message', relationship: 'parent', note: 'Message wraps Markdown when markdown prop is true' },
  ],

  contract: {
    propsSummary: [
      'content: string - Markdown string to render',
      'components: object - Override map for element components (react-markdown renderer components)',
      'className: string - Additional CSS class',
      'Forwards standard HTML div attributes to the wrapper element',
    ],
    scenarioTags: [
      'content.markdown',
      'content.prose',
      'ai.response',
    ],
    a11yRules: ['A11Y_SEMANTIC_HTML'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic markdown with headings, paragraphs, inline code, lists, and blockquote',
      code: `<Markdown content={\`# Hello World

This is a paragraph with **bold text** and *italic text*.

Here is some \\\`inline code\\\` within a sentence.

- First item
- Second item
- Third item

> A blockquote for emphasis.
\`} />`,
      render: () => <Markdown content={defaultContent} />,
    },
    {
      name: 'GFM Table',
      description: 'GitHub Flavored Markdown with tables and task lists',
      code: `<Markdown content={\`## Data Overview

| Feature    | Status    | Priority |
|------------|-----------|----------|
| Markdown   | Done      | High     |
| Tables     | Done      | Medium   |
| Task Lists | Planned   | Low      |

Notes:
- [x] Support GFM tables
- [x] Support task lists
- [ ] Syntax highlighting
\`} />`,
      render: () => <Markdown content={gfmTableContent} />,
    },
    {
      name: 'Code Block',
      description: 'Markdown with fenced code blocks and inline code',
      code: '<Markdown content={`## Code Example\\n\\nHere is a JavaScript function:\\n\\n```js\\nfunction greet(name) {\\n  return \\`Hello, ${name}!\\`;\\n}\\n```\\n\\nAnd some inline code: \\`const x = 42;\\``} />',
      render: () => <Markdown content={codeBlockContent} />,
    },
    {
      name: 'Mixed Content',
      description: 'Complex markdown mixing headings, lists, tables, blockquotes, and task lists',
      code: `<Markdown content={\`# Project Update

## Summary

The project is progressing well. Here are the **key highlights**:

1. Completed the *design system* components
2. Added markdown rendering support
3. Integrated with the documentation site

### Performance Metrics

| Metric      | Before | After |
|-------------|--------|-------|
| Bundle Size | 142kb  | 98kb  |
| Load Time   | 1.2s   | 0.8s  |
| Lighthouse  | 72     | 95    |

> These improvements were achieved through tree-shaking and code splitting.

### Next Steps

- [ ] Add syntax highlighting
- [ ] Support custom themes
- [x] GFM table support
\`} />`,
      render: () => <Markdown content={mixedContent} />,
    },
  ],
});
