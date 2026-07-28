import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Prompt, type PromptAttachment } from '.';

/**
 * Prompt is a multi-line input with toolbar for AI and chat interfaces.
 * It is a compound component composed from Prompt.Textarea, Prompt.Toolbar,
 * Prompt.Actions, Prompt.Info, and Prompt.Submit.
 */
const meta = {
  title: 'Ai/Prompt',
  component: Prompt,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Multi-line input with toolbar for AI and chat interfaces.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'fixed', 'sticky'],
      description: 'Visual/positioning variant',
    },
    appearance: {
      control: 'inline-radio',
      options: ['panel', 'seamless'],
      description: 'Toolbar as a filled footer, or one continuous writing surface',
    },
    disabled: { control: 'boolean', description: 'Disable the entire prompt' },
    loading: { control: 'boolean', description: 'Show loading state' },
    submitOnEnter: {
      control: 'boolean',
      description: 'Submit on Enter (Shift+Enter for newline)',
    },
    autoResize: { control: 'boolean', description: 'Enable auto-resize based on content' },
    placeholder: { control: 'text', description: 'Placeholder text for the textarea' },
  },
  args: {
    placeholder: 'Ask, Search or Chat...',
    variant: 'default',
    children: (
      <>
        <Prompt.Textarea />
        <Prompt.Toolbar>
          <Prompt.Actions />
          <Prompt.Info>
            <Prompt.Submit />
          </Prompt.Info>
        </Prompt.Toolbar>
      </>
    ),
  },
  render: (args) => (
    <Prompt {...args} onSubmit={(value) => console.log(value)}>
      <Prompt.Textarea />
      <Prompt.Toolbar>
        <Prompt.Actions />
        <Prompt.Info>
          <Prompt.Submit />
        </Prompt.Info>
      </Prompt.Toolbar>
    </Prompt>
  ),
} satisfies Meta<typeof Prompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithActions: Story = {
  render: (args) => (
    <Prompt {...args} onSubmit={(value) => console.log(value)}>
      <Prompt.Textarea />
      <Prompt.Toolbar>
        <Prompt.Actions>
          <Prompt.ActionButton aria-label="Add attachment">+</Prompt.ActionButton>
          <Prompt.ModeButton active>Auto</Prompt.ModeButton>
        </Prompt.Actions>
        <Prompt.Info>
          <Prompt.Usage>52% used</Prompt.Usage>
          <Prompt.Submit />
        </Prompt.Info>
      </Prompt.Toolbar>
    </Prompt>
  ),
};

/**
 * The shape an agent composer wants: no footer, no rule across the card, and
 * everything that scopes the run chosen on the same surface you are writing on.
 * Attach, paste or drop a file — all three arrive through `onFiles`.
 */
export const AgentComposer: Story = {
  args: {
    appearance: 'seamless',
    minRows: 3,
    submitOnEnter: false,
    placeholder: 'What should be true when this is done?',
  },
  render: function AgentComposerStory(args) {
    const [files, setFiles] = useState<PromptAttachment[]>([]);

    return (
      <Prompt
        {...args}
        onSubmit={(value) => console.log(value, files)}
        accept="image/*,text/*"
        onFiles={(added) =>
          setFiles((current) => [
            ...current,
            ...added.map((file) => ({
              id: `${file.name}-${current.length}`,
              name: file.name,
              size: file.size,
              previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            })),
          ])
        }
      >
        <Prompt.Attachments
          items={files}
          onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
        />
        <Prompt.Textarea />
        <Prompt.Toolbar>
          <Prompt.Actions>
            <Prompt.Attach />
            <Prompt.Select
              aria-label="Model"
              defaultValue="claude-opus-4-8"
              options={[
                { value: 'claude-opus-4-8', label: 'Opus 4.8' },
                { value: 'claude-sonnet-5', label: 'Sonnet 5' },
                { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5' },
              ]}
            />
            <Prompt.Select
              aria-label="Working tree"
              defaultValue="worktree"
              options={[
                { value: 'worktree', label: 'New worktree' },
                { value: 'main', label: 'Mainline' },
              ]}
            />
          </Prompt.Actions>
          <Prompt.Info>
            <Prompt.Usage>⌘↩ to send</Prompt.Usage>
            <Prompt.Submit />
          </Prompt.Info>
        </Prompt.Toolbar>
      </Prompt>
    );
  },
};

export const Loading: Story = {
  args: { loading: true, defaultValue: 'Tell me about the weather...' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
