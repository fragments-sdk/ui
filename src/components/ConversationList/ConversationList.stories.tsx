import type { Meta, StoryObj } from '@storybook/react';
import { ConversationList } from '.';

/**
 * Scrollable message container with auto-scroll and history loading.
 * Holds message children, with autoScroll behavior (true/false/"smart"),
 * an optional empty state, and ConversationList.DateSeparator /
 * ConversationList.TypingIndicator subcomponents.
 */
const meta = {
  title: 'Ai/ConversationList',
  component: ConversationList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Scrollable message container with auto-scroll and history loading.',
      },
    },
  },
  argTypes: {
    loadingHistory: {
      control: 'boolean',
      description: 'Show loading spinner at top while loading history',
    },
  },
  args: {
    autoScroll: 'smart',
    loadingHistory: false,
    children: (
      <>
        <div>Hello!</div>
        <div>Hi there! How can I help you today?</div>
      </>
    ),
  },
} satisfies Meta<typeof ConversationList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => (
    <ConversationList {...args} style={{ height: 280 }}>
      <div>Hello!</div>
      <div>Hi there! How can I help you today?</div>
      <div>Can you explain React hooks?</div>
    </ConversationList>
  ),
};

export const WithDateSeparators: Story = {
  render: (args) => (
    <ConversationList {...args} style={{ height: 280 }}>
      <ConversationList.DateSeparator date={new Date(Date.now() - 86400000)} />
      <div>A message from yesterday</div>
      <ConversationList.DateSeparator date={new Date()} />
      <div>And a message from today!</div>
    </ConversationList>
  ),
};

export const WithTypingIndicator: Story = {
  render: (args) => (
    <ConversationList {...args} style={{ height: 280 }}>
      <div>What is TypeScript?</div>
      <ConversationList.TypingIndicator name="Assistant" />
    </ConversationList>
  ),
};

export const LoadingHistory: Story = {
  args: { loadingHistory: true },
  render: (args) => (
    <ConversationList {...args} style={{ height: 280 }}>
      <div>This is the latest message</div>
    </ConversationList>
  ),
};

export const Empty: Story = {
  render: (args) => (
    <ConversationList
      {...args}
      style={{ height: 280 }}
      emptyState={<div>Start the conversation</div>}
    >
      {null}
    </ConversationList>
  ),
};
