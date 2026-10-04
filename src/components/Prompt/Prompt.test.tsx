import { describe, it, expect, vi } from "vitest";
import { compiledModuleRules } from "../../test/compiled-css";
import { render, screen, userEvent, fireEvent, expectNoA11yViolations } from "../../test/utils";
import { Menu } from "../Menu";
import { Prompt, type PromptProps } from "./index";

const cssText = compiledModuleRules("src/components/Prompt/Prompt.module.scss")
  .map((rule) => rule.cssText)
  .join("\n");

function renderPrompt(props: Partial<PromptProps> = {}) {
  return render(
    <Prompt {...props}>
      <Prompt.Textarea />
      <Prompt.Toolbar>
        <Prompt.Attach />
        <Prompt.Actions>
          <Prompt.Info>12 / 4000</Prompt.Info>
          <Prompt.Submit />
        </Prompt.Actions>
      </Prompt.Toolbar>
    </Prompt>
  );
}

describe("Prompt", () => {
  it('says "Ask, search or chat…" by default', () => {
    renderPrompt();
    expect(screen.getByPlaceholderText("Ask, search or chat…")).toBeInTheDocument();
  });

  it("reports edits through onValueChange and keeps the native onChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(
      <Prompt onValueChange={onValueChange}>
        <Prompt.Textarea onChange={onChange} />
      </Prompt>
    );
    await user.type(screen.getByRole("textbox"), "Hi");
    expect(onValueChange).toHaveBeenLastCalledWith("Hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("lets Enter commit an IME candidate, then sends on the next Enter", () => {
    const onSubmit = vi.fn();
    renderPrompt({ defaultValue: "日本", onSubmit });
    const textarea = screen.getByRole("textbox");
    fireEvent.compositionStart(textarea);
    expect(fireEvent.keyDown(textarea, { key: "Enter", isComposing: true })).toBe(true);
    fireEvent.compositionEnd(textarea);
    expect(fireEvent.keyDown(textarea, { key: "Enter", keyCode: 229 })).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(fireEvent.keyDown(textarea, { key: "Enter", keyCode: 13 })).toBe(false);
    expect(onSubmit).toHaveBeenCalledWith("日本");
  });

  it("disables Send until there is text, then sends", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderPrompt({ onSubmit });
    const send = screen.getByRole("button", { name: "Send" });
    expect(send).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "Hello");
    expect(send).toBeEnabled();
    await user.click(send);
    expect(onSubmit).toHaveBeenCalledWith("Hello");
  });

  it("keeps typing open while working and turns Send into Stop", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    const onSubmit = vi.fn();
    const { container } = renderPrompt({ working: true, onStop, onSubmit, defaultValue: "Next" });
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeEnabled();
    expect(container.firstElementChild).toHaveAttribute("data-working");
    fireEvent.keyDown(textarea, { key: "Enter", keyCode: 13 });
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Stop" }));
    expect(onStop).toHaveBeenCalledOnce();
  });

  it("marks Send pending and swallows presses while a send is in flight", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderPrompt({ pending: true, onSubmit, defaultValue: "Hello" });
    const send = screen.getByRole("button", { name: "Send" });
    expect(send).toHaveAttribute("aria-busy", "true");
    await user.click(send);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables everything when disabled", () => {
    renderPrompt({ disabled: true, defaultValue: "x" });
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("reads but never sends when read-only", () => {
    renderPrompt({ readOnly: true, defaultValue: "Locked" });
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("says why it is invalid in words tied to the text area", () => {
    renderPrompt({ invalid: true, errorMessage: "Too long to send." });
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("Too long to send.");
  });

  it("opens the send menu on the menu gestures, not on a click", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Prompt defaultValue="Hello" onSubmit={onSubmit}>
        <Prompt.Textarea />
        <Prompt.Submit menu={<Menu.Item>Queue</Menu.Item>} />
      </Prompt>
    );
    const send = screen.getByRole("button", { name: "Send" });
    await user.click(send);
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menuitem", { name: "Queue" })).toBeNull();
    fireEvent.contextMenu(send);
    expect(await screen.findByRole("menuitem", { name: "Queue" })).toBeInTheDocument();
  });

  it("picks from a menu and reads the kind of choice before it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Prompt>
        <Prompt.Textarea />
        <Prompt.Picker
          aria-label="Model"
          defaultValue="fast"
          onValueChange={onValueChange}
          options={[
            { value: "fast", label: "Fast" },
            { value: "deep", label: "Deep" },
          ]}
        />
      </Prompt>
    );
    const trigger = screen.getByRole("button", { name: "Model: Fast" });
    await user.click(trigger);
    await user.click(await screen.findByRole("menuitemradio", { name: "Deep" }));
    expect(onValueChange).toHaveBeenCalledWith("deep");
    expect(screen.getByRole("button", { name: "Model: Deep" })).toBeInTheDocument();
  });

  it("draws one field: the band, the field edge, the surface corner, no beam", () => {
    expect(cssText).toContain("--fui-field-bg");
    expect(cssText).toContain("--fui-field-border");
    expect(cssText).toContain("--fui-radius-surface");
    expect(cssText).not.toMatch(/conic-gradient|@property|beam/);
    expect(cssText).toMatch(/:has\([^)]*textarea[^)]*:focus-visible\)[^{]*\{[^}]*outline/);
  });

  describe("files", () => {
    const png = () => new File(["x"], "shot.png", { type: "image/png" });

    it("hands picked files to onFiles", async () => {
      const user = userEvent.setup();
      const onFiles = vi.fn();
      const { container } = render(
        <Prompt onFiles={onFiles} accept="image/*">
          <Prompt.Textarea />
          <Prompt.Attach />
        </Prompt>
      );
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute("accept", "image/*");
      await user.upload(input, png());
      expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "shot.png" })]);
    });

    it("disables attach when the consumer has not opted into files", () => {
      renderPrompt();
      expect(screen.getByRole("button", { name: "Attach files" })).toBeDisabled();
    });

    it("takes files dropped anywhere on the card and says so while dragging", () => {
      const onFiles = vi.fn();
      const { container } = render(
        <Prompt onFiles={onFiles}>
          <Prompt.Textarea />
        </Prompt>
      );
      const card = container.firstChild as HTMLElement;
      const dataTransfer = { types: ["Files"], files: [png()], dropEffect: "" };
      fireEvent.dragEnter(card, { dataTransfer });
      expect(card).toHaveAttribute("data-dragging", "true");
      expect(card).toHaveTextContent("Drop to attach");
      fireEvent.drop(card, { dataTransfer });
      expect(card).not.toHaveAttribute("data-dragging");
      expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "shot.png" })]);
    });

    it("lists attachments and removes them", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(
        <Prompt onFiles={() => {}}>
          <Prompt.Attachments
            items={[{ id: "a", name: "shot.png", size: 2048 }]}
            onRemove={onRemove}
          />
          <Prompt.Textarea />
        </Prompt>
      );
      expect(screen.getByText("2 KB")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Remove shot.png" }));
      expect(onRemove).toHaveBeenCalledWith("a");
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Prompt onFiles={() => {}}>
        <Prompt.Attachments items={[{ id: "a", name: "shot.png" }]} onRemove={() => {}} />
        <Prompt.Textarea />
        <Prompt.Toolbar>
          <Prompt.Attach />
          <Prompt.Actions>
            <Prompt.Info>12 / 4000</Prompt.Info>
            <Prompt.Submit />
          </Prompt.Actions>
        </Prompt.Toolbar>
      </Prompt>
    );
    await expectNoA11yViolations(container);
  });
});
