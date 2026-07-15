import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Field } from "../Field";
import { Switch } from "./index";

describe("Switch", () => {
  it("renders a switch role", () => {
    render(<Switch aria-label="Dark mode" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("is unchecked by default", () => {
    render(<Switch aria-label="Dark mode" />);
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("renders as checked when checked prop is true", () => {
    render(<Switch aria-label="Dark mode" checked onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("renders label text", () => {
    render(<Switch label="Dark mode" />);
    expect(screen.getByText("Dark mode")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<Switch label="Notifications" description="Enable push alerts" />);
    expect(screen.getByText("Enable push alerts")).toBeInTheDocument();
  });

  it("renders helperText (preferred API)", () => {
    render(<Switch label="Notifications" helperText="Enable push alerts" />);
    expect(screen.getByText("Enable push alerts")).toBeInTheDocument();
  });

  it("associates helper text via aria-describedby", () => {
    render(<Switch label="Notifications" helperText="Enable push alerts" />);
    expect(screen.getByRole("switch")).toHaveAccessibleDescription("Enable push alerts");
  });

  it("prefers helperText over description when both are provided", () => {
    render(
      <Switch
        label="Notifications"
        helperText="Preferred helper text"
        description="Legacy description text"
      />
    );
    expect(screen.getByText("Preferred helper text")).toBeInTheDocument();
    expect(screen.queryByText("Legacy description text")).not.toBeInTheDocument();
  });

  it("disables the switch", () => {
    render(<Switch aria-label="Dark mode" disabled />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-disabled", "true");
  });

  it("sets required state", () => {
    render(<Switch aria-label="Dark mode" required />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-required", "true");
  });

  it("does not toggle when readOnly", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Switch
        aria-label="Dark mode"
        defaultChecked={false}
        readOnly
        onCheckedChange={handleChange}
      />
    );

    const toggle = screen.getByRole("switch");
    await user.click(toggle);

    expect(toggle).not.toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("forwards form props to the hidden input", () => {
    let inputNode: HTMLInputElement | null = null;
    const { container } = render(
      <Switch
        aria-label="Dark mode"
        id="dark-mode-switch"
        name="darkMode"
        form="external-form"
        value="enabled"
        uncheckedValue="disabled"
        inputRef={(node) => {
          inputNode = node;
        }}
      />
    );

    const input = container.querySelector('input[type="checkbox"][name="darkMode"]');
    const uncheckedInput = container.querySelector('input[type="hidden"][name="darkMode"]');
    expect(input).toBe(inputNode);
    expect(input).toHaveAttribute("id", "dark-mode-switch");
    expect(screen.getByRole("switch")).not.toHaveAttribute("id", "dark-mode-switch");
    expect(input).toHaveAttribute("form", "external-form");
    expect(input).toHaveAttribute("value", "enabled");
    expect(uncheckedInput).toHaveAttribute("form", "external-form");
    expect(uncheckedInput).toHaveAttribute("value", "disabled");
  });

  it("calls onChange with the new value on click", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch aria-label="Dark mode" onChange={handleChange} />);
    await user.click(screen.getByRole("switch"));
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe(true);
  });

  it("calls onCheckedChange alias when toggled", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch aria-label="Dark mode" onCheckedChange={handleChange} />);
    await user.click(screen.getByRole("switch"));
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe(true);
  });

  it("validates exactly once when changed inside a Field", async () => {
    const validate = vi.fn();
    const user = userEvent.setup();
    render(
      <Field validationMode="onChange" validate={validate}>
        <Switch aria-label="Dark mode" />
      </Field>
    );

    await user.click(screen.getByRole("switch"));

    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenLastCalledWith(true, expect.anything());
  });

  it("prefers onCheckedChange over onChange when both provided", async () => {
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch aria-label="Test" onChange={onChange} onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Switch aria-label="Accessible switch" />);
    await expectNoA11yViolations(container);
  });
});
