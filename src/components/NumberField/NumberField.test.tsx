import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Field } from "../Field";
import { NumberField } from "./index";

describe("NumberField", () => {
  it("renders a number field input", () => {
    render(<NumberField aria-label="Width" defaultValue={12} />);
    const input = screen.getByRole("textbox", { name: "Width" });
    expect(input).toHaveValue("12");
    expect(input).toHaveAttribute("inputmode", "numeric");
  });

  it("takes its label and description from Field, and is described by its unit", () => {
    render(
      <Field>
        <Field.Label>Width</Field.Label>
        <NumberField unit="px" defaultValue={12} />
        <Field.Description>The content box.</Field.Description>
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "Width" });
    expect(input).toHaveAccessibleDescription(/px/);
    expect(input).toHaveAccessibleDescription(/The content box\./);
  });

  it("steps by 1 on the arrow keys and by 10 with Shift", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<NumberField aria-label="Width" defaultValue={12} onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("13");
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(input).toHaveValue("23");
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveValue("22");
    expect(onValueChange).toHaveBeenLastCalledWith(22);
  });

  it("holds the value inside min and max", async () => {
    const user = userEvent.setup();
    render(<NumberField aria-label="Opacity" defaultValue={95} min={0} max={100} />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(input).toHaveValue("100");
  });

  it("renders the scrub label as a drag handle hidden from assistive tech", () => {
    const { container } = render(<NumberField aria-label="Width" scrub="W" defaultValue={1} />);
    const scrub = container.querySelector(".scrub");
    expect(scrub).toHaveTextContent("W");
    expect(scrub?.querySelector('[aria-hidden="true"]')).toHaveTextContent("W");
  });

  it("sets aria-invalid when invalid", () => {
    render(<NumberField aria-label="Width" invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("sets the size on the shell, the 24 step included", () => {
    const { container } = render(<NumberField aria-label="Width" size="xs" />);
    expect(container.querySelector(".shell")).toHaveAttribute("data-size", "xs");
  });

  it("disables and makes read-only the input", () => {
    const { rerender } = render(<NumberField aria-label="Width" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("group")).toHaveAttribute("aria-disabled", "true");
    rerender(<NumberField aria-label="Width" readOnly />);
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Field>
        <Field.Label>Width</Field.Label>
        <NumberField unit="px" scrub="W" defaultValue={12} />
      </Field>
    );
    await expectNoA11yViolations(container);
  });
});
