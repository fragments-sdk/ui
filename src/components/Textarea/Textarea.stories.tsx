import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '.';

/**
 * Textarea is the canonical multi-line text input. Use it for comments,
 * descriptions, bios, and message composition — agents should reuse it (with
 * its built-in label, helper text, validation states, and character counter)
 * rather than styling a raw `<textarea>`.
 */
const meta = {
  title: 'Forms/Textarea',
  component: Textarea,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Multi-line text input for longer form content with label, helper text, and validation states. Prefer this over a raw <textarea>.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
      description: 'Resize behavior',
    },
    disabled: { control: 'boolean', description: 'Disabled state' },
    error: { control: 'boolean', description: 'Error state' },
    success: { control: 'boolean', description: 'Show success/validated styling' },
    showCharCount: {
      control: 'boolean',
      description: 'Show character counter when maxLength is set',
    },
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    size: 'md',
    rows: 3,
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Description', placeholder: 'Enter a description...' },
};

export const WithHelperText: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
    helperText: 'Max 500 characters',
    maxLength: 500,
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Comments',
    placeholder: 'Add your comments...',
    error: true,
    helperText: 'This field is required',
  },
};

export const SuccessState: Story = {
  args: {
    label: 'Bio',
    defaultValue: 'A short bio about myself.',
    success: true,
    helperText: 'Looks great!',
  },
};

export const Disabled: Story = {
  args: { label: 'Notes', placeholder: 'Cannot edit...', disabled: true },
};

export const CustomRows: Story = {
  args: {
    label: 'Long Description',
    placeholder: 'Enter detailed information...',
    rows: 6,
  },
};

export const WithCharacterCounter: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
    maxLength: 200,
    showCharCount: true,
  },
};

export const Large: Story = {
  args: { label: 'Large', size: 'lg', placeholder: 'Large textarea' },
};
