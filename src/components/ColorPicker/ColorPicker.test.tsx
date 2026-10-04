import { resolve } from "node:path";
import * as sass from "sass";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from "../../test/utils";
import { ColorPicker } from "./index";

// Mock react-colorful to avoid canvas rendering issues in jsdom
vi.mock("react-colorful", () => ({
  HexColorPicker: ({ color, onChange }: { color: string; onChange: (c: string) => void }) => (
    <div data-testid="hex-picker" data-color={color} onClick={() => onChange("#ff0000")}>
      Mock Picker
    </div>
  ),
}));

function hexField() {
  return screen.getByRole("textbox", { name: /hex value/i });
}

describe("ColorPicker", () => {
  it("renders a labelled group with a swatch and the hex field", () => {
    render(<ColorPicker label="Brand Color" />);
    expect(screen.getByRole("group", { name: "Brand Color" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Brand Color color" })).toBeInTheDocument();
    expect(hexField()).toBeInTheDocument();
  });

  it("paints the swatch with the current value through a private property", () => {
    render(<ColorPicker label="Brand" defaultValue="#3366FF" />);
    const swatch = screen.getByRole("button", { name: "Edit Brand color" });
    expect(swatch.style.getPropertyValue("--_fui-colorpicker-value")).toBe("#3366ff");
    expect(hexField()).toHaveValue("#3366ff");
  });

  it("reports typed hex values through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ColorPicker label="Color" onValueChange={onValueChange} defaultValue="#000000" />);
    await user.clear(hexField());
    await user.type(hexField(), "#FF5500");
    expect(onValueChange).toHaveBeenCalledWith("#ff5500");
  });

  it("expands shorthand on blur", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ColorPicker label="Color" onValueChange={onValueChange} />);
    await user.clear(hexField());
    await user.type(hexField(), "f50");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith("#ff5500");
    expect(hexField()).toHaveValue("#ff5500");
  });

  it("flags a bad hex inline instead of reverting it", async () => {
    const user = userEvent.setup();
    render(<ColorPicker label="Brand" defaultValue="#000000" />);
    await user.clear(hexField());
    await user.type(hexField(), "#zz");
    await user.tab();
    expect(hexField()).toHaveValue("#zz");
    expect(screen.getByText("Enter a hex color like #3366ff")).toBeInTheDocument();
    expect(screen.getByRole("group")).toHaveAttribute("data-invalid");
    expect(screen.getByRole("button", { name: "Edit Brand color" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("picks from the canvas", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ColorPicker label="Brand" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Edit Brand color" }));
    await user.click(await screen.findByTestId("hex-picker"));
    expect(onValueChange).toHaveBeenCalledWith("#ff0000");
  });

  it("closes on Escape and restores focus to the color swatch trigger", async () => {
    const user = userEvent.setup();
    render(<ColorPicker label="Brand color" />);

    const trigger = screen.getByRole("button", { name: /edit brand color color/i });
    await user.click(trigger);
    expect(
      await screen.findByRole("dialog", { name: /brand color color picker/i })
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: /brand color color picker/i })
      ).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });

  it("renders helperText linked to both controls", () => {
    render(<ColorPicker label="Color" helperText="Choose a brand color" />);
    const helper = screen.getByText("Choose a brand color");
    expect(hexField().getAttribute("aria-describedby")).toContain(helper.id);
  });

  it("shows the error message with words while invalid", () => {
    render(<ColorPicker label="Brand" invalid errorMessage="Pick a colour with 3:1 contrast" />);
    const message = screen.getByText("Pick a colour with 3:1 contrast");
    expect(screen.getByLabelText("Edit Brand color")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Edit Brand color").getAttribute("aria-describedby")).toContain(
      message.id
    );
  });

  it("keeps the invalid edge on the wrapper when disabled", () => {
    render(<ColorPicker label="Brand" disabled invalid />);
    const wrapper = screen.getByRole("group");
    expect(wrapper).toHaveAttribute("data-disabled");
    expect(wrapper).toHaveAttribute("data-invalid");
    expect(screen.getByRole("button", { name: "Edit Brand color" })).toBeDisabled();
  });

  it("shows the value read-only", () => {
    render(<ColorPicker label="Brand" readOnly defaultValue="#112233" />);
    expect(hexField()).toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: "Edit Brand color" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getByRole("group")).toHaveAttribute("data-readonly");
  });

  it("cuts the v3 props from the types", () => {
    const cut = () => [
      // @ts-expect-error v4: merged into onValueChange
      <ColorPicker key="a" onChange={() => {}} />,
      // @ts-expect-error v4: helperText only
      <ColorPicker key="b" description="x" />,
      // @ts-expect-error v4: the hex field always shows
      <ColorPicker key="c" showInput={false} />,
      // @ts-expect-error v4: merged into invalid + errorMessage
      <ColorPicker key="d" error />,
      // @ts-expect-error v4: sm | md
      <ColorPicker key="e" size="lg" />,
    ];
    expect(cut).toBeTypeOf("function");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ColorPicker label="Brand Color" helperText="Used for links" />);
    await expectNoA11yViolations(container);
  });
});

describe("ColorPicker hex field styles", () => {
  const css = sass
    .compile(resolve(process.cwd(), "src/components/ColorPicker/ColorPicker.module.scss"), {
      style: "expanded",
    })
    .css.replace(/\s+/g, " ");

  it("sets the hex value in mono on the input itself, above Input's size rules", () => {
    expect(css).toMatch(
      /input\.hexInput, input\.hexInput\[data-size\] \{[^}]*font-family: var\(--fui-font-mono/
    );
  });
});
