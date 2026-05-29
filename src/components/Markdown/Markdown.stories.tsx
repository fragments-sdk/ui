import type { Meta, StoryObj } from '@storybook/react';
import { Markdown } from '.';

/**
 * Renders markdown strings as styled prose via react-markdown and remark-gfm.
 * Supports headings, lists, tables, code blocks, blockquotes, and task lists.
 */
const meta = {
  title: 'Display/Markdown',
  component: Markdown,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Renders a markdown string as styled prose.',
      },
    },
  },
  args: {
    content: [
      '# Hello World',
      '',
      'This is a paragraph with **bold text** and *italic text*.',
      '',
      'Here is some `inline code` within a sentence.',
      '',
      '- First item',
      '- Second item',
      '- Third item',
      '',
      '> A blockquote for emphasis.',
    ].join('\n'),
  },
} satisfies Meta<typeof Markdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Table: Story = {
  args: {
    content: [
      '## Data Overview',
      '',
      '| Feature    | Status    | Priority |',
      '|------------|-----------|----------|',
      '| Markdown   | Done      | High     |',
      '| Tables     | Done      | Medium   |',
      '| Task Lists | Planned   | Low      |',
      '',
      'Notes:',
      '- [x] Support GFM tables',
      '- [x] Support task lists',
      '- [ ] Syntax highlighting',
    ].join('\n'),
  },
};

export const CodeBlock: Story = {
  args: {
    content: [
      '## Code Example',
      '',
      'Here is a JavaScript function:',
      '',
      '```js',
      'function greet(name) {',
      '  return `Hello, ${name}!`;',
      '}',
      '```',
    ].join('\n'),
  },
};
