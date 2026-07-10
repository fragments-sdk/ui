import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '.';

/**
 * Text is the canonical typography primitive. Every heading, paragraph, label,
 * and inline string in the design system routes through it for consistent size,
 * weight, color, and font — agents should reuse it rather than styling raw
 * `<p>`/`<span>`/`<h1>` elements by hand.
 */
const meta = {
  title: 'Display/Text',
  component: Text,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Typography component for rendering text with consistent styling and semantic elements. Prefer this over raw <p>, <span>, or heading tags.',
      },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'span',
        'label',
        'div',
        'strong',
        'em',
        'small',
        'mark',
        'del',
        'ins',
        'sub',
        'sup',
        'time',
        'address',
        'blockquote',
        'cite',
        'code',
        'abbr',
      ],
      description: 'HTML element to render',
    },
    variant: {
      control: 'select',
      options: ['section-label'],
      description: 'Preset text variant',
    },
    size: {
      control: 'select',
      options: ['2xs', 'xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
      description: 'Font size',
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'Font weight',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'muted'],
      description: 'Text color (muted is an alias for tertiary)',
    },
    font: {
      control: 'select',
      options: ['sans', 'mono'],
      description: 'Font family',
    },
    truncate: { control: 'boolean', description: 'Truncate with ellipsis on overflow' },
  },
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
    size: 'md',
    weight: 'normal',
    color: 'primary',
  },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'The quick brown fox jumps over the lazy dog' },
};

export const Heading: Story = {
  args: { as: 'h1', size: '3xl', weight: 'semibold', children: 'Page title' },
};

export const Paragraph: Story = {
  args: {
    as: 'p',
    size: 'md',
    color: 'secondary',
    children:
      'This is a paragraph of body text that demonstrates the Text component using a semantic paragraph element.',
  },
};

export const SectionLabel: Story = {
  args: { as: 'p', variant: 'section-label', children: 'On This Page' },
};

export const Bold: Story = {
  args: { weight: 'bold', children: 'Bold weight text' },
};

export const Secondary: Story = {
  args: { color: 'secondary', children: 'Secondary color text' },
};

export const Monospace: Story = {
  args: { font: 'mono', size: 'sm', children: 'npm install @usefragments/ui' },
};

export const Truncated: Story = {
  args: {
    truncate: true,
    style: { display: 'block', maxWidth: '200px' },
    children:
      'This is a very long text that will be truncated with an ellipsis when it overflows the container.',
  },
};
