import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '.';

/**
 * Switch is a binary on/off control for settings and preferences. It supports
 * controlled and uncontrolled checked state, an optional label, helper text,
 * and three sizes.
 */
const meta = {
  title: 'Forms/Switch',
  component: Switch,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component: 'Binary on/off switch for settings and preferences.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    disabled: { control: 'boolean', description: 'Disable the switch' },
    readOnly: { control: 'boolean', description: 'Prevent the user from toggling' },
    required: { control: 'boolean', description: 'Mark the switch as required' },
    defaultChecked: { control: 'boolean', description: 'Default checked state (uncontrolled)' },
  },
  args: { label: 'Enable notifications', size: 'md', defaultChecked: false },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Enable notifications' },
};

export const Checked: Story = {
  args: { label: 'Auto-save', defaultChecked: true },
};

export const WithHelperText: Story = {
  args: {
    label: 'Marketing emails',
    helperText: 'Receive occasional product updates and offers.',
  },
};

export const Small: Story = {
  args: { label: 'Compact mode', size: 'sm', defaultChecked: true },
};

export const Disabled: Story = {
  args: { label: 'Locked setting', disabled: true, defaultChecked: true },
};
