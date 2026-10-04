/**
 * State fixtures for Editor, rendered by `pnpm run test:states`.
 *
 * @family:theme-reach
 * @na:loading TipTap resolves before first paint in the harness; the markdown textarea stands in until it does.
 */
import { Editor } from ".";
import { Separator } from "../Separator";

export function populated() {
  return (
    <Editor
      label="Post"
      defaultValue="Ship notes for the week: the contract page now shows every canonical component."
      formats={["heading", "bold", "italic", "link", "bulletList"]}
      rows={4}
    />
  );
}

export function empty() {
  return <Editor label="Post" placeholder="Start typing your post" rows={4} />;
}

export function error() {
  return (
    <Editor
      label="Post"
      invalid
      errorMessage="Write at least one line"
      rows={4}
      formats={["bold", "italic"]}
    />
  );
}

export function errorSave() {
  return (
    <Editor label="Draft" defaultValue="This draft could not be saved." rows={3}>
      <Editor.Content />
      <Editor.StatusBar showWordCount showCharCount>
        <Editor.StatusIndicator status="error" />
      </Editor.StatusBar>
    </Editor>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 280 }}>
      <Editor
        label="Bio"
        defaultValue="A sentence that runs well past the limit so the counter has to say how many characters are over it."
        maxLength={60}
        rows={3}
        formats={["bold", "italic", "strikethrough", "link", "code", "bulletList", "orderedList"]}
      />
    </div>
  );
}

export function lifecycleCustomToolbar() {
  return (
    <Editor label="Blog post" placeholder="Write your blog post" rows={3}>
      <Editor.Toolbar>
        <Editor.ToolbarGroup aria-label="Basic formatting">
          <Editor.ToolbarButton format="bold" />
          <Editor.ToolbarButton format="italic" />
        </Editor.ToolbarGroup>
        <Separator orientation="vertical" length="control" />
        <Editor.ToolbarGroup aria-label="Structure">
          <Editor.ToolbarButton format="link" />
          <Editor.ToolbarButton format="bulletList" />
        </Editor.ToolbarGroup>
        <Editor.ToolbarGroup aria-label="Status">
          <Editor.StatusIndicator status="saving" />
        </Editor.ToolbarGroup>
      </Editor.Toolbar>
      <Editor.Content />
    </Editor>
  );
}

export function lifecycleReadOnly() {
  return (
    <Editor
      label="Post"
      defaultValue="Read-only text: no toolbar, a dashed edge, still selectable."
      readOnly
      rows={3}
    />
  );
}

export function lifecycleDisabled() {
  return (
    <Editor
      label="Post"
      defaultValue="Disabled text stays selectable, so it can still be copied."
      disabled
      rows={3}
    />
  );
}
