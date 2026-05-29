import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup } from '.';

/**
 * RadioGroup lets users select one option from a set of mutually exclusive
 * choices. It is a compound component: each option is a RadioGroup.Item with
 * a value and label.
 */
const meta = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Single selection from a list of mutually exclusive options.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    variant: {
      control: 'select',
      options: ['default', 'card'],
      description: 'Visual variant',
    },
    disabled: { control: 'boolean', description: 'Disable all options' },
  },
  args: {
    label: 'Select an option',
    defaultValue: 'option1',
    size: 'md',
    orientation: 'vertical',
    children: (
      <>
        <RadioGroup.Item value="option1" label="Option 1" />
        <RadioGroup.Item value="option2" label="Option 2" />
        <RadioGroup.Item value="option3" label="Option 3" />
      </>
    ),
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="option1" label="Option 1" />
      <RadioGroup.Item value="option2" label="Option 2" />
      <RadioGroup.Item value="option3" label="Option 3" />
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: { label: 'Shipping method', defaultValue: 'standard' },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="standard" label="Standard" helperText="5-7 business days" />
      <RadioGroup.Item value="express" label="Express" helperText="2-3 business days" />
      <RadioGroup.Item value="overnight" label="Overnight" helperText="Next business day" />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  args: { label: 'Size', defaultValue: 'medium', orientation: 'horizontal' },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="small" label="S" />
      <RadioGroup.Item value="medium" label="M" />
      <RadioGroup.Item value="large" label="L" />
      <RadioGroup.Item value="xlarge" label="XL" />
    </RadioGroup>
  ),
};

export const WithError: Story = {
  args: { label: 'Required selection', defaultValue: undefined, error: 'Please select an option' },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="a" label="Option A" />
      <RadioGroup.Item value="b" label="Option B" />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  args: { label: 'Locked selection', defaultValue: 'locked', disabled: true },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="locked" label="This is locked" />
      <RadioGroup.Item value="other" label="Cannot select" />
    </RadioGroup>
  ),
};
