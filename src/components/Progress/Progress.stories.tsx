import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '.';

/**
 * Progress is a visual indicator of task completion or loading state.
 * Determinate values render a filled bar; a null value renders an
 * indeterminate animation. Includes a Circular subcomponent.
 */
const meta = {
  title: 'Feedback/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Visual indicator of task completion or loading state in linear and circular variants.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the progress bar',
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger'],
      description: 'Color variant',
    },
    showValue: { control: 'boolean', description: 'Show percentage value' },
  },
  args: { value: 60, size: 'md', variant: 'default', label: 'Uploading', showValue: true },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 60, label: 'Uploading', showValue: true },
};

export const Success: Story = {
  args: { value: 100, variant: 'success', label: 'Complete', showValue: true },
};

export const Danger: Story = {
  args: { value: 95, variant: 'danger', label: 'Storage critical', showValue: true },
};

export const Large: Story = {
  args: { value: 40, size: 'lg', label: 'Processing', showValue: true },
};

export const Indeterminate: Story = {
  args: { value: null, label: 'Loading', showValue: false },
};

export const Circular: Story = {
  args: { value: 75, showValue: true },
  render: (args) => <Progress.Circular {...args} variant="success" />,
};
