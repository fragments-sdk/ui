import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '.';

/**
 * Stack is a flexbox layout primitive for arranging children in rows or
 * columns with consistent spacing. Direction and gap accept tokens, numbers,
 * or responsive objects.
 */
const meta = {
  title: 'Layout/Stack',
  component: Stack,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component: 'Flexbox layout component for arranging children in rows or columns.',
      },
    },
  },
  argTypes: {
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
      description: 'Cross-axis alignment',
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between'],
      description: 'Main-axis alignment',
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'nav', 'article', 'aside', 'header', 'footer', 'main', 'ul', 'ol'],
      description: 'HTML element to render',
    },
    wrap: { control: 'boolean', description: 'Allow items to wrap' },
  },
  args: {
    direction: 'column',
    gap: 'md',
    children: (
      <>
        <div style={{ padding: 8, background: 'var(--fui-bg-secondary)' }}>Item 1</div>
        <div style={{ padding: 8, background: 'var(--fui-bg-secondary)' }}>Item 2</div>
        <div style={{ padding: 8, background: 'var(--fui-bg-secondary)' }}>Item 3</div>
      </>
    ),
  },
} satisfies Meta<typeof Stack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: { direction: 'column', gap: 'sm' },
};

export const Horizontal: Story = {
  args: { direction: 'row', gap: 'sm' },
};

export const NumericGap: Story = {
  args: { direction: 'row', gap: 4 },
};

export const WithSeparator: Story = {
  args: { direction: 'column', gap: 'md', separator: true },
};

export const SemanticElement: Story = {
  args: { as: 'nav', direction: 'row', gap: 'md' },
};
