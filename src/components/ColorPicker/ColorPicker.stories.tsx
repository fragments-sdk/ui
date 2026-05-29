import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker } from '.';

/**
 * Color selection control with a swatch, hex input, and visual picker.
 * Accepts controlled `value` or uncontrolled `defaultValue` hex strings,
 * sizes sm/md/lg, an optional hex input, and an error state.
 */
const meta = {
  title: 'Forms/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Color selection control with hex input and visual picker.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    showInput: { control: 'boolean', description: 'Show the hex input field' },
    error: { control: 'boolean', description: 'Show error styling' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Brand Color',
    defaultValue: '#3b82f6',
    size: 'md',
    showInput: true,
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Brand Color', defaultValue: '#3b82f6' },
};

export const WithHelperText: Story = {
  args: {
    label: 'Primary Color',
    defaultValue: '#10b981',
    helperText: 'This color will be used for buttons and links',
  },
};

export const SwatchOnly: Story = {
  args: { defaultValue: '#ef4444', size: 'sm', showInput: false },
};

export const ErrorState: Story = {
  args: {
    label: 'Brand Color',
    defaultValue: '#000000',
    error: true,
    helperText: 'Please select a valid brand color',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Locked Color',
    defaultValue: '#64748b',
    helperText: 'This color cannot be changed',
    disabled: true,
  },
};
