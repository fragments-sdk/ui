import type { Meta, StoryObj } from '@storybook/react';
import { Prompt } from '.';

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

export const Loading: Story = {
  args: { loading: true, defaultValue: 'Tell me about the weather...' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
