import type { Meta, StoryObj } from '@storybook/react';
import { Link } from '.';

/**
 * Styled anchor element for navigation. Supports internal and external links
 * with consistent visual treatment, tones, and underline behaviors.
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
    tone: {
      control: 'select',
      options: ['accent', 'neutral'],
      description: 'Colour: accent link ink, or neutral body text until hovered',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Text-hierarchy colour for a neutral link',
    },
    underline: {
      control: 'select',
      options: ['always', 'hover', 'none', 'dotted'],
      description: 'Underline behavior',
    },
    external: { control: 'boolean' },
    asChild: { control: 'boolean' },
  },
  args: {
    href: '#',
    tone: 'accent',
    underline: 'hover',
    children: 'Learn more about our services',
  },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { href: '#', children: 'Learn more about our services' },
};

export const Neutral: Story = {
  args: { href: '#', tone: 'neutral', children: 'Secondary link' },
};

export const Tertiary: Story = {
  args: { href: '#', tone: 'neutral', color: 'tertiary', children: 'Quiet metadata link' },
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
