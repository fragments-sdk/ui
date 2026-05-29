import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '.';

/**
 * The Button is the canonical action primitive. Every CTA, form submit, and
 * row action in the design system routes through it — agents should reuse it
 * rather than hand-rolling a styled `<button>`.
 */
const meta = {
  title: 'Forms/Button',
  component: Button,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Interactive element for user actions and form submissions. Prefer this over a raw <button>.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'link', 'danger', 'outlined', 'icon'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Button size',
    },
    icon: { control: 'boolean', description: 'Icon-only square layout' },
    fullWidth: { control: 'boolean', description: 'Stretch to container width' },
    disabled: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Save changes',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Save changes' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Cancel' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Dismiss' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Delete' },
};

export const Small: Story = {
  args: { size: 'sm', children: 'Compact' },
};

export const FullWidth: Story = {
  args: { fullWidth: true, children: 'Continue' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Unavailable' },
};
