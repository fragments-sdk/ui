import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '.';

/**
 * Editor is a rich-text editor with a formatting toolbar, auto-save, and word
 * count. It falls back to a markdown-aware textarea when TipTap is not
 * installed. It is a compound component: compose Editor.Toolbar,
 * Editor.ToolbarGroup, Editor.ToolbarButton, Editor.Content, and
 * Editor.StatusBar for custom layouts.
 */
const meta = {
  title: 'Forms/Editor',
  component: Editor,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Rich text editor with formatting toolbar, auto-save, and word count.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Editor height preset',
    },
    disabled: { control: 'boolean', description: 'Disable the editor' },
    readOnly: { control: 'boolean', description: 'Make the editor read-only' },
    toolbar: { control: 'boolean', description: 'Show default toolbar' },
    statusBar: {
      control: 'boolean',
      description: 'Show word/character counts',
    },
  },
  args: {
    placeholder: 'Start typing your masterpiece here...',
    size: 'md',
    toolbar: true,
    statusBar: true,
  },
} satisfies Meta<typeof Editor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'Start typing your masterpiece here...' },
};

export const Minimal: Story = {
  args: {
    placeholder: 'Quick note...',
    formats: ['bold', 'italic', 'code'],
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue:
      'This content is read-only. You can select and copy text but cannot modify it.',
  },
};

export const WithCharacterLimit: Story = {
  args: {
    placeholder: 'Write a tweet-sized message...',
    maxLength: 280,
    size: 'sm',
    formats: ['bold', 'italic', 'link'],
  },
};

export const CustomToolbar: Story = {
  render: () => (
    <Editor placeholder="Write your blog post...">
      <Editor.Toolbar>
        <Editor.ToolbarGroup aria-label="Basic formatting">
          <Editor.ToolbarButton format="bold" />
          <Editor.ToolbarButton format="italic" />
        </Editor.ToolbarGroup>
        <Editor.Separator />
        <Editor.ToolbarGroup aria-label="Advanced formatting">
          <Editor.ToolbarButton format="link" />
          <Editor.ToolbarButton format="code" />
          <Editor.ToolbarButton format="bulletList" />
        </Editor.ToolbarGroup>
        <Editor.ToolbarGroup aria-label="Status">
          <Editor.StatusIndicator status="saving" />
        </Editor.ToolbarGroup>
      </Editor.Toolbar>
      <Editor.Content />
      <Editor.StatusBar showWordCount showCharCount />
    </Editor>
  ),
};
