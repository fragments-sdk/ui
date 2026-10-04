import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Prompt, type PromptAttachment } from ".";
import { Menu } from "../Menu";

/**
 * The composer: one field on the band with the text area, a toolbar of
 * pickers and attachments, and the send action. While the assistant works,
 * Send becomes Stop and the text stays editable; Enter sends, Shift+Enter
 * breaks the line. Files can be attached, pasted or dropped.
 */
const meta = {
  title: "Ai/Prompt",
  component: Prompt,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "The composer for AI and chat: a field with a toolbar and the send action.",
      },
    },
  },
  argTypes: {
    disabled: { control: "boolean", description: "Nothing can be typed or sent" },
    readOnly: { control: "boolean", description: "The text can be read and selected" },
    invalid: { control: "boolean", description: "The message can't be sent as written" },
    pending: { control: "boolean", description: "Sending: the action shows a spinner" },
    working: { control: "boolean", description: "The assistant is responding" },
    submitOnEnter: { control: "boolean", description: "Enter sends, Shift+Enter breaks the line" },
    placeholder: { control: "text" },
  },
  args: {
    children: null,
  },
  render: (args) => (
    <Prompt {...args} onSubmit={() => {}}>
      <Prompt.Textarea />
      <Prompt.Toolbar>
        <Prompt.Attach />
        <Prompt.Actions>
          <Prompt.Submit />
        </Prompt.Actions>
      </Prompt.Toolbar>
    </Prompt>
  ),
} satisfies Meta<typeof Prompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

const MODELS = [
  { value: "fast", label: "Fast" },
  { value: "thorough", label: "Thorough" },
];

export const WithPicker: Story = {
  render: (args) => (
    <Prompt {...args} onSubmit={() => {}}>
      <Prompt.Textarea />
      <Prompt.Toolbar>
        <Prompt.Attach />
        <Prompt.Picker aria-label="Model" options={MODELS} defaultValue="fast" />
        <Prompt.Actions>
          <Prompt.Info>1.2k tokens</Prompt.Info>
          <Prompt.Submit />
        </Prompt.Actions>
      </Prompt.Toolbar>
    </Prompt>
  ),
};

function Working() {
  const [working, setWorking] = useState(true);
  return (
    <Prompt working={working} onStop={() => setWorking(false)} onSubmit={() => setWorking(true)}>
      <Prompt.Textarea />
      <Prompt.Toolbar>
        <Prompt.Actions>
          <Prompt.Submit />
        </Prompt.Actions>
      </Prompt.Toolbar>
    </Prompt>
  );
}

/** While the assistant responds, Send becomes Stop and the text stays editable. */
export const WhileWorking: Story = {
  render: () => <Working />,
};

export const Sending: Story = {
  args: { pending: true, defaultValue: "Summarise the drift on main." },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    errorMessage: "Messages can be up to 4,000 characters.",
    defaultValue: "A very long message",
  },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Connect a repository to ask" },
};

function WithFiles() {
  const [items, setItems] = useState<PromptAttachment[]>([
    { id: "1", name: "contract.json", size: 2048 },
    { id: "2", name: "drift-report-2026-10-03.csv", size: 81920 },
  ]);
  return (
    <Prompt
      onSubmit={() => {}}
      onFiles={(files) =>
        setItems((current) => [
          ...current,
          ...files.map((file) => ({ id: file.name, name: file.name, size: file.size })),
        ])
      }
    >
      <Prompt.Attachments
        items={items}
        onRemove={(id) => setItems((current) => current.filter((item) => item.id !== id))}
      />
      <Prompt.Textarea />
      <Prompt.Toolbar>
        <Prompt.Attach />
        <Prompt.Actions>
          <Prompt.Submit />
        </Prompt.Actions>
      </Prompt.Toolbar>
    </Prompt>
  );
}

export const WithAttachments: Story = {
  render: () => <WithFiles />,
};

/** A right-click, ArrowDown or long-press on Send opens more ways to send. */
export const WithSendMenu: Story = {
  render: (args) => (
    <Prompt {...args} onSubmit={() => {}}>
      <Prompt.Textarea />
      <Prompt.Toolbar>
        <Prompt.Actions>
          <Prompt.Submit
            menu={
              <>
                <Menu.Item>Send without context</Menu.Item>
                <Menu.Item>Schedule</Menu.Item>
              </>
            }
          />
        </Prompt.Actions>
      </Prompt.Toolbar>
    </Prompt>
  ),
};
