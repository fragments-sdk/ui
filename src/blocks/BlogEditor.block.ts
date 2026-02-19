import { defineBlock } from '@fragments-sdk/cli/core';

export default defineBlock({
  name: 'Blog Editor',
  description: 'Full blog post editor with formatting toolbar, auto-save, publish button, and word count',
  category: 'content',
  components: ['Editor', 'Button'],
  tags: ['blog', 'editor', 'writing', 'rich-text', 'publishing', 'content'],
  code: `
<Editor
  placeholder="Start typing your masterpiece here..."
  onValueChange={(value) => console.log(value)}
  onAutoSave={(value) => console.log('Auto-saved:', value)}
  autoSaveInterval={5000}
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
      <Button variant="accent" size="sm">Publish</Button>
    </Editor.ToolbarGroup>
  </Editor.Toolbar>
  <Editor.Content />
  <Editor.StatusBar showWordCount showCharCount />
</Editor>
`.trim(),
});
