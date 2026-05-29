import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '.';

/**
 * Slider is a range input control for selecting a numeric value within a
 * defined range. It supports a label, value display, a custom step interval,
 * and a value suffix for units.
 */
const meta = {
  title: 'Forms/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Range input control for selecting a numeric value within a defined range.',
      },
    },
  },
  argTypes: {
    showValue: { control: 'boolean', description: 'Display current value' },
    showValueOnDrag: {
      control: 'boolean',
      description: 'Show a floating value bubble while dragging',
    },
    error: { control: 'boolean', description: 'Show error styling' },
    disabled: { control: 'boolean', description: 'Disable the slider' },
  },
  args: { label: 'Volume', defaultValue: 50, min: 0, max: 100, step: 1 },
  render: (args) => (
    <div style={{ width: 300 }}>
      <Slider {...args} />
    </div>
  ),
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Volume', defaultValue: 50 },
};

export const WithValue: Story = {
  args: { label: 'Brightness', defaultValue: 75, showValue: true, valueSuffix: '%' },
};

export const CustomRange: Story = {
  args: {
    label: 'Temperature',
    min: 60,
    max: 80,
    step: 1,
    defaultValue: 72,
    showValue: true,
    valueSuffix: '°F',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Quality',
    defaultValue: 80,
    showValue: true,
    valueSuffix: '%',
    helperText: 'Higher quality increases file size',
  },
};

export const Disabled: Story = {
  args: { label: 'Locked setting', defaultValue: 30, showValue: true, disabled: true },
};
