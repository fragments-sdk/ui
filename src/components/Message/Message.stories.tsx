import type { Meta, StoryObj } from "@storybook/react";
import { Copy } from "@phosphor-icons/react";
import { Message } from ".";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { Stack } from "../Stack";

/**
 * One turn of a conversation. The user's words sit in a band bubble at the
 * end; the assistant's reply is flush, rendered as markdown. `status` covers
 * sending, streaming (a still caret at the end), complete and failed (a
 * failure block with "Try again").
 */
const meta = {
  title: "Ai/Message",
  component: Message,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "One turn of an AI conversation: the user's bubble or the assistant's reply.",
      },
    },
  },
  argTypes: {
    from: {
      control: "inline-radio",
      options: ["user", "assistant"],
      description: "Who wrote the message",
    },
    status: {
      control: "select",
      options: ["pending", "streaming", "complete", "error"],
      description: "Where the message stands",
    },
  },
  args: {
    from: "assistant",
    status: "complete",
    children: <Message.Content>How can I help you today?</Message.Content>,
  },
} satisfies Meta<typeof Message>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Assistant: Story = {
  args: {
    children: (
      <Message.Content>
        {
          "Two files use a raw `button`. Replace them with `Button`:\n\n- `src/Save.tsx`\n- `src/Cancel.tsx`"
        }
      </Message.Content>
    ),
  },
};

export const User: Story = {
  args: {
    from: "user",
    timestamp: new Date(),
    children: <Message.Content>Which files break the contract?</Message.Content>,
  },
};

export const Sending: Story = {
  args: {
    from: "user",
    status: "pending",
    children: <Message.Content>Which files break the contract?</Message.Content>,
  },
};

export const Streaming: Story = {
  args: {
    status: "streaming",
    children: <Message.Content>{"Checking the contract for this pull request"}</Message.Content>,
  },
};

export const Failed: Story = {
  args: {
    status: "error",
    onRetry: () => {},
    children: <Message.Content>{"Two files use a raw"}</Message.Content>,
  },
};

export const WithActions: Story = {
  render: (args) => (
    <Message
      {...args}
      actions={
        <IconButton variant="ghost" size="sm" aria-label="Copy reply">
          <Icon icon={Copy} size="sm" />
        </IconButton>
      }
    >
      <Message.Content>{"Every changed file follows the contract."}</Message.Content>
    </Message>
  ),
};

export const WithAvatar: Story = {
  args: {
    from: "user",
    avatar: <Message.Avatar>CM</Message.Avatar>,
    children: <Message.Content>Summarise the drift on main.</Message.Content>,
  },
};

export const Exchange: Story = {
  render: () => (
    <Stack gap="lg">
      <Message from="user" timestamp={new Date(Date.now() - 120000)}>
        <Message.Content>Which files break the contract?</Message.Content>
      </Message>
      <Message from="assistant">
        <Message.Content>
          {"Two files use a raw `button`:\n\n```tsx\n<button onClick={save}>Save</button>\n```"}
        </Message.Content>
      </Message>
    </Stack>
  ),
};
