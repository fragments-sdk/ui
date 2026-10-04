import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Field } from "../Field";
import { Switch } from "./index";

const switchStyles = readFileSync(
  resolve(process.cwd(), "src/components/Switch/Switch.module.scss"),
  "utf8"
);

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
    render(<Switch aria-label="Dark mode" checked onCheckedChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("paints the Glass track and thumb: no border, no sheen, instant travel", () => {
    expect(switchStyles).toMatch(/\.thumb\s*\{[\s\S]*inset-block-start:\s*50%;/);
    expect(switchStyles).toMatch(/\.thumb\s*\{[\s\S]*transform:\s*translateY\(-50%\);/);
    expect(switchStyles).toMatch(
      /\.track\[data-checked\]\s*>\s*&\s*\{\s*transform:\s*translate\(#\{\$_travel\}, -50%\);/
    );
    expect(switchStyles).toMatch(/\$_off:\s*var\(--fui-field-border,/);
    expect(switchStyles).toMatch(/box-shadow:\s*var\(--fui-shadow-sm,/);
    // A pill with a round thumb of the accent's ink, as the desktop app draws it.
    expect(switchStyles).toMatch(/\$_radius:\s*radius\.pill\(\$_block\);/);
    expect(switchStyles).toMatch(/\.thumb\s*\{[^}]*color:\s*var\(--fui-color-on-accent,/);
    expect(switchStyles).not.toMatch(/light-dark\(|inset 0|--fui-radius-full|border:\s/);
    // The thumb moves instantly: only the track's colour transitions.
    expect(switchStyles).not.toMatch(/transition[^;]*transform/);
  });

  it("renders label text", () => {
    render(<Switch label="Dark mode" />);
    expect(screen.getByText("Dark mode")).toBeInTheDocument();
  });

  it("keeps the label and helper outside the switch element", () => {
    render(<Switch label="Notifications" helperText="Enable push alerts" />);
    const toggle = screen.getByRole("switch", { name: "Notifications" });
    expect(toggle).not.toHaveTextContent("Notifications");
    expect(toggle.closest("label")).toHaveTextContent("NotificationsEnable push alerts");
  });

  it("shows the error message with an icon and wires it to the switch while invalid", () => {
    const { container } = render(
      <Switch label="Share findings" invalid errorMessage="Sharing is off for this plan." />
    );
    const toggle = screen.getByRole("switch", { name: "Share findings" });
    expect(toggle).toHaveAttribute("aria-invalid", "true");
    expect(toggle).toHaveAccessibleDescription("Sharing is off for this plan.");
    expect(container.querySelector("svg[aria-hidden='true']")).not.toBeNull();
  });

  it("drops the cut aliases at the type level", () => {
    // @ts-expect-error onChange was cut in v4; use onCheckedChange.
    render(<Switch aria-label="Dark mode" onChange={() => {}} />);
    // @ts-expect-error size was cut in v4; there is one size.
    render(<Switch aria-label="Dark mode" size="sm" />);
    // @ts-expect-error description was cut in v4; use helperText.
    render(<Switch label="Dark mode" description="Old" />);
    expect(screen.getAllByRole("switch")).toHaveLength(3);
  });

  it("associates helper text via aria-describedby", () => {
    render(<Switch label="Notifications" helperText="Enable push alerts" />);
    expect(screen.getByRole("switch")).toHaveAccessibleDescription("Enable push alerts");
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

  it("calls onCheckedChange with the new value when toggled", async () => {
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

  it("delivers exactly one click to an ancestor per user click", async () => {
    const handleAncestorClick = vi.fn();
    const user = userEvent.setup();
    render(
      <div onClick={handleAncestorClick}>
        <Switch label="Notifications" />
      </div>
    );

    await user.click(screen.getByRole("switch"));
    expect(handleAncestorClick).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText("Notifications"));
    expect(handleAncestorClick).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Switch aria-label="Accessible switch" />);
    await expectNoA11yViolations(container);
  });
});
