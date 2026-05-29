import type { Meta, StoryObj } from '@storybook/react';
import { Message } from '.';

/**
 * Individual chat message with role-based styling and alignment. Compose with
 * `Message.Content`, `Message.Timestamp`, `Message.Avatar`, and `Message.Actions`.
 */
const meta = {
  title: 'Ai/Message',
  component: Message,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Chat message display with role-based styling for AI conversation UIs.',
      },
    },
  },
  argTypes: {
    role: {
      control: 'select',
      options: ['user', 'assistant', 'system'],
      description: 'Message role determines styling and alignment',
    },
    status: {
      control: 'select',
      options: ['sending', 'streaming', 'complete', 'error'],
      description: 'Message state',
    },
  },
  args: {
    role: 'assistant',
    status: 'complete',
    children: <Message.Content>How can I help you today?</Message.Content>,
  },
} satisfies Meta<typeof Message>;

export default meta;

type Story = StoryObj<typeof meta>;

export const UserMessage: Story = {
  args: {
    role: 'user',
    children: (
      <Message.Content>Hello! Can you help me with a coding question?</Message.Content>
    ),
  },
};

export const AssistantMessage: Story = {
  args: {
    role: 'assistant',
    children: (
      <Message.Content>
        Of course! I&apos;d be happy to help. What would you like to know?
      </Message.Content>
    ),
  },
};

export const SystemMessage: Story = {
  args: {
    role: 'system',
    children: <Message.Content>Conversation started.</Message.Content>,
  },
};

export const Streaming: Story = {
  args: {
    role: 'assistant',
    status: 'streaming',
    children: (
      <Message.Content>I&apos;m currently generating a response for you</Message.Content>
    ),
  },
};

export const ErrorState: Story = {
  args: {
    role: 'user',
    status: 'error',
    children: <Message.Content>This message failed to send.</Message.Content>,
  },
};
