import type { Meta, StoryObj } from '@storybook/react';
import { Link } from '.';

/**
 * Styled anchor element for navigation. Supports internal and external links
 * with consistent visual treatment, variants, and underline behaviors.
 */
const meta = {
  title: 'Navigation/Link',
  component: Link,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component: 'Styled anchor element for internal and external navigation.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'subtle', 'muted'],
      description: 'Visual style variant',
    },
    underline: {
      control: 'select',
      options: ['always', 'hover', 'none'],
      description: 'Underline behavior',
    },
    external: { control: 'boolean' },
    asChild: { control: 'boolean' },
  },
  args: {
    href: '#',
    variant: 'default',
    underline: 'hover',
    children: 'Learn more about our services',
  },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { href: '#', children: 'Learn more about our services' },
};

export const Subtle: Story = {
  args: { href: '#', variant: 'subtle', children: 'Secondary link' },
};

export const Muted: Story = {
  args: { href: '#', variant: 'muted', children: 'Muted link' },
};

export const AlwaysUnderlined: Story = {
  args: { href: '#', underline: 'always', children: 'Always underlined' },
};

export const External: Story = {
  args: {
    href: 'https://example.com',
    external: true,
    children: 'View documentation',
  },
};
