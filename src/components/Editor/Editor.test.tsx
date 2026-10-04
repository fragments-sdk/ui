import { resolve } from "node:path";
import * as sass from "sass";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, expectNoA11yViolations, act, userEvent } from "../../test/utils";
import { Editor, type EditorFormat } from "./index";
import { Button } from "../Button";

// TipTap resolves through a lazy import(); preloading it pins these tests to
// one deterministic mode from the first render.
beforeAll(async () => {
  await Editor.preload();
});

function renderEditor(
  props: {
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    defaultValue?: string;
    onValueChange?: (v: string) => void;
    formats?: EditorFormat[];
  } = {}
) {
  return render(
    <Editor
      label="Post"
      placeholder={props.placeholder ?? "Start typing your post"}
      onValueChange={props.onValueChange}
      disabled={props.disabled}
      readOnly={props.readOnly}
      defaultValue={props.defaultValue}
      formats={props.formats}
    >
      <Editor.Toolbar>
        <Editor.ToolbarGroup aria-label="Text formatting">
          {(props.formats ?? ["bold", "italic", "code"]).map((f) => (
            <Editor.ToolbarButton key={f} format={f} />
          ))}
        </Editor.ToolbarGroup>
        <Editor.ToolbarGroup aria-label="Actions">
          <Editor.StatusIndicator status="saved" />
          <Button variant="solid" size="sm">
            Publish
          </Button>
        </Editor.ToolbarGroup>
      </Editor.Toolbar>
      <Editor.Content />
      <Editor.StatusBar showWordCount showCharCount />
    </Editor>
  );
}

/**
 * Find the editor content area. TipTap renders a contenteditable div,
 * the fallback renders a textarea. Both are accessible as textbox role.
 */
function getEditorInput() {
  const textarea = document.querySelector("textarea");
  if (textarea) return textarea;
  const contenteditable = document.querySelector("[contenteditable]");
  if (contenteditable) return contenteditable as HTMLElement;
  throw new Error("Could not find editor content area");
}

function field() {
  return document.querySelector<HTMLElement>(".editor")!;
}

describe("Editor", () => {
  it("renders the content area with its placeholder", () => {
    renderEditor({ placeholder: "Write here" });
    const wrapper = document.querySelector('[data-placeholder="Write here"]');
    const textarea = document.querySelector('textarea[placeholder="Write here"]');
    expect(wrapper || textarea).toBeTruthy();
  });

  it("names the text box with the label, never the placeholder", () => {
    renderEditor({ placeholder: "Write here" });
    const input = getEditorInput();
    expect(input).toHaveAccessibleName("Post");
  });

  it("wires invalid and the error message to the text box", () => {
    render(<Editor label="Post" invalid errorMessage="Write at least one line" />);
    const input = getEditorInput();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Write at least one line");
    expect(field()).toHaveAttribute("data-invalid");
  });

  it("renders toolbar with format buttons", () => {
    renderEditor({ formats: ["bold", "italic", "code"] });
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /code/i })).toBeInTheDocument();
  });

  it("renders one heading button for the one heading step", () => {
    render(<Editor label="Post" formats={["heading"]} />);
    expect(screen.getByRole("button", { name: "Heading" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("renders toolbar with proper ARIA role", () => {
    renderEditor();
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });

  it("gives the toolbar one tab stop and moves with arrow keys", async () => {
    const user = userEvent.setup();
    renderEditor({ formats: ["bold", "italic", "code"] });
    const bold = screen.getByRole("button", { name: /bold/i });
    const italic = screen.getByRole("button", { name: /italic/i });
    const code = screen.getByRole("button", { name: /code/i });
    expect(bold).toHaveAttribute("tabindex", "0");
    expect(italic).toHaveAttribute("tabindex", "-1");

    bold.focus();
    await user.keyboard("{ArrowRight}");
    expect(italic).toHaveFocus();
    expect(italic).toHaveAttribute("tabindex", "0");
    expect(bold).toHaveAttribute("tabindex", "-1");

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    // Wraps from the first button to the last enabled one (Publish).
    expect(screen.getByRole("button", { name: /publish/i })).toHaveFocus();

    await user.keyboard("{Home}{ArrowRight}{ArrowRight}");
    expect(code).toHaveFocus();
  });

  it("renders toolbar groups with role=group", () => {
    renderEditor();
    const groups = screen.getAllByRole("group");
    expect(groups[0]).toHaveAttribute("aria-label", "Text formatting");
    expect(groups[1]).toHaveAttribute("aria-label", "Actions");
  });

  it("speaks the save status in sentence case", () => {
    renderEditor();
    const indicator = screen.getByRole("status");
    expect(indicator).toHaveTextContent("Saved");
    expect(indicator).toHaveAttribute("aria-live", "polite");
  });

  it("says what failed when a save fails", () => {
    render(
      <Editor label="Post">
        <Editor.Content />
        <Editor.StatusIndicator status="error" />
      </Editor>
    );
    expect(screen.getByRole("status")).toHaveTextContent("Couldn’t save");
  });

  it("counts words and characters in lowercase", () => {
    renderEditor({ defaultValue: "Hello world" });
    expect(screen.getByText("2 words")).toBeInTheDocument();
    expect(screen.getByText("11 characters")).toBeInTheDocument();
  });

  it("uses the singular for a count of 1", () => {
    renderEditor({ defaultValue: "Hello" });
    expect(screen.getByText("1 word")).toBeInTheDocument();
  });

  it("says how many characters are over the limit", () => {
    render(<Editor label="Bio" defaultValue="Hello world" maxLength={5} />);
    expect(screen.getByText("11 / 5, 6 over")).toBeInTheDocument();
  });

  it("toolbar buttons have aria-pressed attribute", () => {
    renderEditor({ formats: ["bold"] });
    expect(screen.getByRole("button", { name: /bold/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("disables toolbar buttons when editor is disabled", () => {
    renderEditor({ disabled: true, formats: ["bold", "italic"] });
    expect(screen.getByRole("button", { name: /bold/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /italic/i })).toBeDisabled();
  });

  it("marks the field disabled and keeps the text selectable", () => {
    renderEditor({ disabled: true, defaultValue: "Keep me" });
    expect(field()).toHaveAttribute("data-disabled");
    const input = getEditorInput();
    if (input instanceof HTMLTextAreaElement) {
      expect(input).not.toBeDisabled();
      expect(input).toHaveAttribute("readonly");
      expect(input).toHaveAttribute("aria-disabled", "true");
    } else {
      expect(input).toHaveAttribute("contenteditable", "false");
      expect(input).toHaveAttribute("aria-disabled", "true");
    }
  });

  it("hides the toolbar when read-only", () => {
    renderEditor({ readOnly: true, formats: ["bold"] });
    expect(field()).toHaveAttribute("data-readonly");
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });

  it("renders the default toolbar without a status bar when nothing needs one", () => {
    render(<Editor label="Notes" placeholder="Auto layout" formats={["bold", "italic"]} />);
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.queryByText("0 words")).not.toBeInTheDocument();
  });

  it("shows the status bar by default once there is a limit", () => {
    render(<Editor label="Bio" maxLength={280} />);
    expect(screen.getByText("0 / 280")).toBeInTheDocument();
  });

  it("sizes the writing area in rows", () => {
    const { container } = render(<Editor label="Notes" rows={4} />);
    expect(
      (container.firstElementChild as HTMLElement).style.getPropertyValue("--_fui-editor-rows")
    ).toBe("4");
  });

  it("supports async onAutoSave callbacks and updates status after resolution", async () => {
    vi.useFakeTimers();
    let resolveSave: (() => void) | undefined;
    const onAutoSave = vi.fn(
      (_value: string) =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        })
    );

    render(
      <Editor label="Post" defaultValue="Hello world" onAutoSave={onAutoSave} autoSaveInterval={25}>
        <Editor.Content />
        <Editor.StatusIndicator />
      </Editor>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(25);
    });
    expect(onAutoSave).toHaveBeenCalledTimes(1);
    expect(String((onAutoSave.mock.calls[0] as unknown[])[0])).toContain("Hello world");
    expect(screen.getByText("Saving…")).toBeInTheDocument();

    await act(async () => {
      resolveSave?.();
      await Promise.resolve();
    });
    expect(screen.getByText("Saved")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("cuts size, toolbarIcons, the three heading levels and Editor.Separator", () => {
    const cut = () => [
      // @ts-expect-error v4: size merged into rows
      <Editor key="a" size="lg" />,
      // @ts-expect-error v4: icons come from Icon
      <Editor key="b" toolbarIcons={{}} />,
      // @ts-expect-error v4: heading1/2/3 merged into heading
      <Editor key="c" formats={["heading1"]} />,
    ];
    expect(cut).toBeTypeOf("function");
    expect((Editor as unknown as Record<string, unknown>).Separator).toBeUndefined();
    expect(Editor.Root).toBe(Editor);
  });

  it("has no accessibility violations", async () => {
    const { container } = renderEditor();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await expectNoA11yViolations(container);
  });
});

describe("Editor disabled styles", () => {
  const css = sass
    .compile(resolve(process.cwd(), "src/components/Editor/Editor.module.scss"), {
      style: "expanded",
    })
    .css.replace(/\s+/g, " ");

  it("shows the not-allowed cursor on a disabled field, as every disabled field does", () => {
    expect(css).toMatch(/\[data-disabled\] \{[^}]*cursor: not-allowed;/);
    expect(css).toMatch(/\.contentTextarea\[aria-disabled=true\] \{ cursor: not-allowed; \}/);
    expect(css).not.toMatch(/cursor: default/);
  });
});
