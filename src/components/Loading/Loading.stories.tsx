import type { Meta, StoryObj } from '@storybook/react';
import { Loading } from '.';

/**
 * Loading indicator for showing progress or waiting states. Offers spinner,
 * dots, and pulse variants plus `Loading.Inline` and `Loading.Screen` helpers.
 */
const meta = {
  title: 'Feedback/Loading',
  component: Loading,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Versatile loading indicator with spinner, dots, and pulse variants.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the loading indicator',
    },
    variant: {
      control: 'select',
      options: ['spinner', 'dots', 'pulse'],
      description: 'Visual style of the loading animation',
    },
    color: {
      control: 'select',
      options: ['accent', 'current', 'muted'],
      description: 'Color variant',
    },
    centered: { control: 'boolean' },
    fill: { control: 'boolean' },
    overlay: { control: 'boolean' },
  },
  args: {
    size: 'md',
    variant: 'spinner',
    color: 'accent',
    label: 'Loading...',
  },
} satisfies Meta<typeof Loading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Spinner: Story = {
  args: { variant: 'spinner' },
};

export const Dots: Story = {
  args: { variant: 'dots' },
};

export const Pulse: Story = {
  args: { variant: 'pulse' },
};

export const Large: Story = {
  args: { variant: 'spinner', size: 'xl' },
};

export const Muted: Story = {
  args: { variant: 'spinner', color: 'muted' },
};
