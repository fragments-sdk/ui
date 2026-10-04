import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ConversationList } from ".";
import { EmptyState } from "../EmptyState";
import { Message } from "../Message";
import { ThinkingIndicator } from "../ThinkingIndicator";

/**
 * The conversation log. It follows new content while the reader is at the
 * end, holds their place when they scroll up, counts what arrives meanwhile
 * ("3 new messages" under the log), keeps the place when earlier messages
 * load, and marks day breaks and events with `ConversationList.Event`.
 */
const meta = {
  title: "Ai/ConversationList",
  component: ConversationList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "The conversation log: follows new content, holds the reader's place.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", blockSize: 420 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    autoScroll: {
      control: "inline-radio",
      options: ["smart", false],
      description: "Follow new content while the reader is at the end",
    },
    history: {
      control: "inline-radio",
      options: ["idle", "loading", "error"],
      description: "Where earlier messages stand",
    },
  },
  args: {
    autoScroll: "smart",
    history: "idle",
    children: (
      <>
        <ConversationList.Event date={new Date()} />
        <Message from="user">
          <Message.Content>Which files break the contract?</Message.Content>
        </Message>
        <Message from="assistant">
          <Message.Content>{"Two files use a raw `button`."}</Message.Content>
        </Message>
      </>
    ),
  },
} satisfies Meta<typeof ConversationList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithEvent: Story = {
  args: {
    children: (
      <>
        <Message from="user">
          <Message.Content>Check main.</Message.Content>
        </Message>
        <ConversationList.Event>Switched to the larger model</ConversationList.Event>
        <Message from="assistant">
          <Message.Content>{"Main follows the contract."}</Message.Content>
        </Message>
      </>
    ),
  },
};

// The indicator is a compound with a `.Root` part, so it renders here rather
// than in args, which must stay acyclic.
export const Thinking: Story = {
  render: (args) => (
    <ConversationList {...args}>
      <Message from="user">
        <Message.Content>Summarise the drift on main.</Message.Content>
      </Message>
      <ThinkingIndicator label="Reading the contract…" showElapsed />
    </ConversationList>
  ),
};

export const LoadingHistory: Story = {
  args: { history: "loading" },
};

export const HistoryFailed: Story = {
  args: { history: "error", onRetryHistory: () => {} },
};

export const Empty: Story = {
  args: {
    children: null,
    emptyState: (
      <EmptyState>
        <EmptyState.Title>Ask about your design system</EmptyState.Title>
      </EmptyState>
    ),
  },
};

function Live() {
  const [count, setCount] = React.useState(6);
  React.useEffect(() => {
    const timer = window.setInterval(() => setCount((n) => n + 1), 1500);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <ConversationList>
      {Array.from({ length: count }, (_, i) => (
        <Message key={i} from={i % 2 ? "assistant" : "user"}>
          <Message.Content>{`Message ${i + 1}`}</Message.Content>
        </Message>
      ))}
    </ConversationList>
  );
}

/** Scroll up while messages arrive: the place holds and the count grows. */
export const Arriving: Story = {
  render: () => <Live />,
};
