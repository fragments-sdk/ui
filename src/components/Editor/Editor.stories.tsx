import type { Meta, StoryObj } from "@storybook/react";
import { Editor } from ".";
import { Separator } from "../Separator";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Editor is a rich-text editor with a formatting toolbar, auto-save and
 * counts. It falls back to a markdown-aware textarea when TipTap is not
 * installed. Compose Editor.Toolbar, Editor.ToolbarGroup,
 * Editor.ToolbarButton, Editor.Content and Editor.StatusBar for custom
 * layouts; split toolbar groups with a vertical Separator.
 */
const meta = {
  title: "Forms/Editor",
  component: Editor,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Rich text editor with a formatting toolbar, auto-save and counts.",
      },
    },
  },
  argTypes: {
    rows: {
      control: { type: "number", min: 2, max: 30 },
      description: "Writing area height in lines",
    },
    disabled: { control: "boolean", description: "Disable the editor" },
    readOnly: { control: "boolean", description: "Make the editor read-only" },
    invalid: { control: "boolean", description: "Mark the value invalid" },
    toolbar: { control: "boolean", description: "Show default toolbar" },
    statusBar: { control: "boolean", description: "Show the status bar" },
  },
  args: {
    label: "Post",
    placeholder: "Start typing your post",
  },
} satisfies Meta<typeof Editor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Minimal: Story = {
  args: {
    label: "Note",
    placeholder: "Quick note",
    formats: ["bold", "italic", "code"],
    rows: 4,
  },
};

export const WithHeading: Story = {
  args: {
    formats: ["heading", "bold", "italic", "link", "bulletList", "blockquote"],
  },
};

export const WithCharacterLimit: Story = {
  args: {
    label: "Bio",
    placeholder: "Say who you are in a sentence or two",
    maxLength: 280,
    rows: 4,
    formats: ["bold", "italic", "link"],
  },
};

export const Invalid: Story = {
  args: { invalid: true, errorMessage: "Write at least one line" },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "This content is read-only. You can select and copy text but cannot change it.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "Disabled text stays selectable, so it can still be copied.",
  },
};

export const CustomToolbar: Story = {
  render: () => (
    <Editor label="Blog post" placeholder="Write your blog post">
      <Editor.Toolbar>
        <Editor.ToolbarGroup aria-label="Basic formatting">
          <Editor.ToolbarButton format="bold" />
          <Editor.ToolbarButton format="italic" />
        </Editor.ToolbarGroup>
        <Separator orientation="vertical" length="control" />
        <Editor.ToolbarGroup aria-label="Structure">
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
