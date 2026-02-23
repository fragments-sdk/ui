import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Editor } from '.';
import { Button } from '../Button';

export default defineFragment({
  component: Editor,

  meta: {
    name: 'Editor',
    description: 'Rich text editor with formatting toolbar, auto-save, and word count',
    category: 'forms',
    status: 'stable',
    tags: ['editor', 'rich-text', 'markdown', 'toolbar', 'writing', 'blog', 'content'],
    dependencies: [
      { name: '@tiptap/react', version: '>=2.0.0', reason: 'Rich text editor framework' },
      { name: '@tiptap/starter-kit', version: '>=2.0.0', reason: 'Default extensions (bold, italic, lists, etc.)' },
      { name: '@tiptap/extension-link', version: '>=2.0.0', reason: 'Link support in rich text mode' },
    ],
  },

  usage: {
    when: [
      'Building blog post or article editors',
      'Need rich text editing with formatting controls',
      'Content management with auto-save and word count',
      'Markdown or WYSIWYG editing interfaces',
    ],
    whenNot: [
      'Simple single-line text input (use Input)',
      'Plain multi-line without formatting (use Textarea)',
      'Chat/AI prompt input (use Prompt)',
      'Code editing (use CodeBlock)',
    ],
    guidelines: [
      'Use compound pattern for custom toolbar layouts',
      'Install @tiptap/react, @tiptap/starter-kit, and @tiptap/extension-link for rich text mode',
      'Falls back to a markdown-aware textarea when TipTap is not installed',
      'Use onAutoSave for periodic content persistence',
      'onAutoSave may return a Promise; save status updates after the async save resolves/rejects',
      'Use size prop (sm/md/lg) to control editor height',
      'Use maxLength to show character limit with visual warning states',
      'New formats (headings, blockquote, orderedList, undo, redo) are opt-in via the formats prop',
      'Use toolbarIcons to swap in icons from any icon package without changing toolbar button labels or accessibility behavior',
    ],
    accessibility: [
      'Toolbar has role="toolbar" with aria-label',
      'Format buttons use aria-pressed to indicate active state',
      'Action buttons (undo/redo) omit aria-pressed since they are not toggles',
      'Status indicator uses aria-live="polite" for save status announcements',
      'Keyboard shortcuts match standard text editor conventions (Ctrl+B, Ctrl+I, etc.)',
      'Global shortcuts (e.g., Sidebar Ctrl+B) automatically yield when focus is inside the Editor',
      'Focus ring appears on the editor container when any child element is focused',
    ],
  },

  props: {
    value: {
      type: 'string',
      description: 'Controlled editor value',
    },
    defaultValue: {
      type: 'string',
      description: 'Default value for uncontrolled usage',
    },
    onValueChange: {
      type: 'function',
      description: 'Called when content changes',
    },
    placeholder: {
      type: 'string',
      default: '"Start typing..."',
      description: 'Placeholder text shown when empty',
    },
    disabled: {
      type: 'boolean',
      default: 'false',
      description: 'Disable the editor',
    },
    readOnly: {
      type: 'boolean',
      default: 'false',
      description: 'Make the editor read-only',
    },
    formats: {
      type: 'array',
      default: '["bold", "italic", "strikethrough", "link", "code", "bulletList"]',
      description: 'Which format buttons to show in the toolbar',
    },
    toolbar: {
      type: 'boolean',
      default: 'true',
      description: 'Show default toolbar',
    },
    statusBar: {
      type: 'boolean',
      default: 'true',
      description: 'Show default status bar with word/character counts',
    },
    onAutoSave: {
      type: 'function',
      description: 'Auto-save callback, called at autoSaveInterval (may be async)',
    },
    autoSaveInterval: {
      type: 'number',
      default: '30000',
      description: 'Auto-save interval in milliseconds',
    },
    size: {
      type: 'string',
      default: '"md"',
      description: 'Editor size preset: "sm" (120px), "md" (200px), or "lg" (400px)',
    },
    maxLength: {
      type: 'number',
      description: 'Maximum character count. Shows counter in status bar with warning (90%) and error (over limit) states',
    },
    toolbarIcons: {
      type: 'object',
      description: 'Optional toolbar icon overrides keyed by format/action (e.g. bold, italic, undo). Values can be React nodes or render functions.',
    },
  },

  relations: [
    {
      component: 'Prompt',
      relationship: 'sibling',
      note: 'Prompt is for AI/chat input; Editor is for long-form content editing',
    },
    {
      component: 'Textarea',
      relationship: 'alternative',
      note: 'Use Textarea for simple multi-line input without formatting toolbar',
    },
    {
      component: 'Input',
      relationship: 'alternative',
      note: 'Use Input for single-line text input',
    },
  ],

  contract: {
    propsSummary: [
      'value: string - controlled editor value',
      'onValueChange: (value: string) => void - change callback',
      'placeholder: string - hint text (default: "Start typing...")',
      'disabled: boolean - disables interaction',
      'readOnly: boolean - prevents editing',
      'formats: EditorFormat[] - toolbar buttons (default: all 6)',
      'toolbar: boolean - show default toolbar (default: true)',
      'statusBar: boolean - show word/char counts (default: true)',
      'onAutoSave: (value: string) => void | Promise<void> - auto-save handler',
      'size: "sm" | "md" | "lg" - editor height preset (default: "md")',
      'maxLength: number - character limit with visual indicator',
      'toolbarIcons: Partial<Record<EditorFormat, ReactNode | (state) => ReactNode>> - custom toolbar icons',
    ],
    scenarioTags: [
      'form.editor',
      'form.richtext',
      'ui.blog-editor',
      'ui.content-editor',
    ],
    a11yRules: [
      'A11Y_TOOLBAR_ROLE',
      'A11Y_BUTTON_LABEL',
      'A11Y_LIVE_REGION',
    ],
    bans: [],
  },

  variants: [
    {
      name: 'Default',
      description: 'Editor with default toolbar and status bar',
      render: () => (
        <Editor placeholder="Start typing your masterpiece here..." />
      ),
    },
    {
      name: 'With Auto-Save and Publish',
      description: 'Full compound usage with custom toolbar, auto-save indicator, and publish button',
      render: () => (
        <Editor
          placeholder="Start typing your masterpiece here..."
          onValueChange={(v) => console.log(v)}
        >
          <Editor.Toolbar>
            <Editor.ToolbarGroup aria-label="Text formatting">
              <Editor.ToolbarButton format="bold" />
              <Editor.ToolbarButton format="italic" />
              <Editor.ToolbarButton format="strikethrough" />
              <Editor.ToolbarButton format="link" />
              <Editor.ToolbarButton format="code" />
              <Editor.ToolbarButton format="bulletList" />
            </Editor.ToolbarGroup>
            <Editor.ToolbarGroup aria-label="Actions">
              <Editor.StatusIndicator status="saved" />
              <Button variant="accent" size="sm">
                Publish
              </Button>
            </Editor.ToolbarGroup>
          </Editor.Toolbar>
          <Editor.Content />
          <Editor.StatusBar showWordCount showCharCount />
        </Editor>
      ),
    },
    {
      name: 'Minimal',
      description: 'Editor with subset of formats',
      render: () => (
        <Editor
          placeholder="Quick note..."
          formats={['bold', 'italic', 'code']}
        />
      ),
    },
    {
      name: 'Disabled',
      description: 'Non-interactive editor with content',
      render: () => (
        <Editor
          defaultValue="This content cannot be edited."
          disabled
        />
      ),
    },
    {
      name: 'Read Only',
      description: 'Visible content, non-editable',
      render: () => (
        <Editor
          defaultValue="This content is read-only. You can select and copy text but cannot modify it."
          readOnly
        />
      ),
    },
    {
      name: 'Custom Toolbar',
      description: 'Compound usage with custom toolbar layout and separator',
      render: () => (
        <Editor
          placeholder="Write your blog post..."
          onValueChange={(v) => console.log(v)}
        >
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
    },
    {
      name: 'Full Formatting',
      description: 'All format options including headings, blockquote, ordered list, undo/redo',
      render: () => (
        <Editor
          placeholder="Write an article..."
          size="lg"
        >
          <Editor.Toolbar>
            <Editor.ToolbarGroup aria-label="History">
              <Editor.ToolbarButton format="undo" />
              <Editor.ToolbarButton format="redo" />
            </Editor.ToolbarGroup>
            <Editor.Separator />
            <Editor.ToolbarGroup aria-label="Headings">
              <Editor.ToolbarButton format="heading1" />
              <Editor.ToolbarButton format="heading2" />
              <Editor.ToolbarButton format="heading3" />
            </Editor.ToolbarGroup>
            <Editor.Separator />
            <Editor.ToolbarGroup aria-label="Text formatting">
              <Editor.ToolbarButton format="bold" />
              <Editor.ToolbarButton format="italic" />
              <Editor.ToolbarButton format="strikethrough" />
              <Editor.ToolbarButton format="code" />
            </Editor.ToolbarGroup>
            <Editor.Separator />
            <Editor.ToolbarGroup aria-label="Block formatting">
              <Editor.ToolbarButton format="bulletList" />
              <Editor.ToolbarButton format="orderedList" />
              <Editor.ToolbarButton format="blockquote" />
              <Editor.ToolbarButton format="link" />
            </Editor.ToolbarGroup>
          </Editor.Toolbar>
          <Editor.Content />
          <Editor.StatusBar showWordCount showCharCount />
        </Editor>
      ),
    },
    {
      name: 'With Character Limit',
      description: 'Editor with maxLength showing character count indicator with warning and error states',
      render: () => (
        <Editor
          placeholder="Write a tweet-sized message..."
          maxLength={280}
          size="sm"
          formats={['bold', 'italic', 'link']}
        />
      ),
    },
    {
      name: 'Small Size',
      description: 'Compact editor with sm size preset (120px min-height)',
      render: () => (
        <Editor
          placeholder="Quick note..."
          size="sm"
          formats={['bold', 'italic', 'code']}
        />
      ),
    },
  ],
});
