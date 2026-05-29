import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '.';

/**
 * Box is the primitive layout container for applying spacing, backgrounds, and
 * borders. It renders any semantic element via the `as` prop and is the
 * building block for custom layouts not covered by Stack or Grid.
 */
const meta = {
  title: 'Layout/Box',
  component: Box,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Primitive layout container for applying spacing, backgrounds, and borders.',
      },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['div', 'section', 'article', 'aside', 'main', 'header', 'footer', 'nav', 'span'],
      description: 'HTML element to render',
    },
    padding: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Padding on all sides',
    },
    paddingX: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Horizontal padding',
    },
    paddingY: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Vertical padding',
    },
    margin: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'auto'],
      description: 'Margin on all sides',
    },
    marginX: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'auto'],
      description: 'Horizontal margin',
    },
    marginY: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'auto'],
      description: 'Vertical margin',
    },
    background: {
      control: 'select',
      options: ['none', 'primary', 'secondary', 'tertiary', 'elevated'],
      description: 'Background color',
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
      description: 'Border radius',
    },
    borderColor: {
      control: 'select',
      options: ['default', 'strong', 'accent', 'danger'],
      description: 'Border color variant',
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Box shadow',
    },
    overflow: {
      control: 'select',
      options: ['hidden', 'auto', 'scroll', 'visible'],
      description: 'Overflow behavior',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'accent', 'inverse'],
      description: 'Text color',
    },
    display: {
      control: 'select',
      options: ['none', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid'],
      description: 'Display type',
    },
    border: { control: 'boolean', description: 'Show border' },
    borderTop: { control: 'boolean', description: 'Show top border only' },
    borderBottom: { control: 'boolean', description: 'Show bottom border only' },
    borderLeft: { control: 'boolean', description: 'Show left border only' },
    borderRight: { control: 'boolean', description: 'Show right border only' },
  },
  args: {
    padding: 'md',
    background: 'secondary',
    rounded: 'md',
    children: 'Content with padding and background',
  },
} satisfies Meta<typeof Box>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    padding: 'md',
    background: 'secondary',
    rounded: 'md',
    children: 'Content with padding and background',
  },
};

export const Bordered: Story = {
  args: { padding: 'lg', border: true, rounded: 'md', children: 'Bordered content area' },
};

export const Elevated: Story = {
  args: {
    padding: 'lg',
    rounded: 'md',
    shadow: 'md',
    background: 'primary',
    children: 'Elevated content with shadow',
  },
};

export const DirectionalPadding: Story = {
  args: {
    paddingX: 'xl',
    paddingY: 'sm',
    background: 'tertiary',
    rounded: 'sm',
    children: 'Wide horizontal padding, short vertical',
  },
};

export const DirectionalBorders: Story = {
  args: {
    padding: 'md',
    borderTop: true,
    borderBottom: true,
    children: 'Top and bottom borders only',
  },
};
