import type { Meta, StoryObj } from '@storybook/react';
import { VisuallyHidden } from '.';

/**
 * VisuallyHidden is the canonical screen-reader-only primitive. It hides content
 * visually while keeping it in the accessibility tree — essential for labeling
 * icon-only buttons and adding supplementary context. Agents should reuse it
 * rather than hand-rolling `sr-only` CSS.
 */
const meta = {
  title: 'Navigation/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Hides content visually while keeping it accessible to screen readers. Prefer this over hand-rolled sr-only CSS for icon labels and supplementary text.',
      },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['span', 'div'],
      description: 'HTML element to render',
    },
  },
  args: {
    children: 'Search',
    as: 'span',
  },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Search' },
};

export const IconButtonLabel: Story = {
  render: () => (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        border: '1px solid var(--fui-border-default)',
        borderRadius: '8px',
        background: 'var(--fui-color-surface-primary)',
        cursor: 'pointer',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <VisuallyHidden>Search</VisuallyHidden>
    </button>
  ),
};

export const SupplementaryText: Story = {
  render: () => (
    <a href="#" style={{ color: 'var(--fui-color-accent)' }}>
      Read more
      <VisuallyHidden> about our accessibility features</VisuallyHidden>
    </a>
  ),
};

export const AsDiv: Story = {
  args: { as: 'div', children: 'Skip to main content' },
};
