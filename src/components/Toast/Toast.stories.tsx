import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from '.';

/**
 * Toast is the canonical transient-notification primitive. Use it for brief,
 * non-blocking feedback after an action (saved, deleted, failed). In an app,
 * wrap the tree in `Toast.Provider` and dispatch via `useToast()`; agents
 * should reuse this rather than hand-rolling a notification component.
 */
const meta = {
  title: 'Feedback/Toast',
  component: Toast,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Brief, non-blocking notification messages. Prefer this (via Toast.Provider + useToast) over a hand-rolled notification system.',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'success', 'danger', 'warning', 'info'],
      description: 'Colour on the shared status ramp',
    },
    title: { control: 'text', description: 'Toast title' },
    description: { control: 'text', description: 'Additional message content' },
    duration: {
      control: 'number',
      description: 'Auto-dismiss duration in ms (0 = no auto-dismiss)',
    },
  },
  args: {
    title: 'Notification',
    description: 'This is a toast message.',
    tone: 'neutral',
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: 'Heads up', description: 'Something just happened.', tone: 'neutral' },
};

export const Success: Story = {
  args: {
    title: 'Success!',
    description: 'Your changes have been saved.',
    tone: 'success',
  },
};

export const Error: Story = {
  args: {
    title: 'Error',
    description: 'Failed to save changes. Please try again.',
    tone: 'danger',
  },
};

export const Warning: Story = {
  args: {
    title: 'Warning',
    description: 'This action cannot be undone.',
    tone: 'warning',
  },
};

export const Info: Story = {
  args: {
    title: 'New Update',
    description: 'Version 2.0 is now available.',
    tone: 'info',
  },
};

export const WithAction: Story = {
  args: {
    title: 'File deleted',
    description: 'The file has been moved to trash.',
    action: {
      label: 'Undo',
      onClick: () => {},
    },
  },
};
