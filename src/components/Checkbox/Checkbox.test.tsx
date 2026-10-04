import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { CSSProperties } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Field } from "../Field";
import { Checkbox } from "./index";

const checkboxStyles = readFileSync(
  resolve(process.cwd(), "src/components/Checkbox/Checkbox.module.scss"),
  "utf8"
);

describe("Checkbox", () => {
  it("renders a checkbox role", () => {
    render(<Checkbox aria-label="Accept" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("toggles checked state on click", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" defaultChecked={false} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("renders as checked when checked prop is true", () => {
    render(<Checkbox aria-label="Accept" checked onCheckedChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("supports indeterminate state via aria-checked=mixed", () => {
    render(<Checkbox aria-label="Select all" indeterminate />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  });

  it("keeps the hidden input indeterminate state in sync", () => {
    let inputNode: HTMLInputElement | null = null;
    const { rerender } = render(
      <Checkbox
        aria-label="Select all"
        indeterminate
        inputRef={(node) => {
          inputNode = node;
        }}
      />
    );

    expect(inputNode).toHaveProperty("indeterminate", true);

    rerender(
      <Checkbox
        aria-label="Select all"
        indeterminate={false}
        inputRef={(node) => {
          inputNode = node;
        }}
      />
    );

    expect(inputNode).toHaveProperty("indeterminate", false);
  });

  it("renders label text", () => {
    render(<Checkbox label="I agree" />);
    expect(screen.getByText("I agree")).toBeInTheDocument();
  });

  it("names the box by its label and describes it by its helper text", () => {
    render(<Checkbox label="Subscribe" helperText="Get weekly updates" />);
    const checkbox = screen.getByRole("checkbox", { name: "Subscribe" });
    expect(checkbox).toHaveAccessibleDescription("Get weekly updates");
  });

  it("shows the error message with an icon and wires it to the box while invalid", () => {
    const { container, rerender } = render(
      <Checkbox label="Accept the terms" invalid errorMessage="Accept the terms to continue." />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Accept the terms" });
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("data-invalid");
    expect(checkbox).toHaveAccessibleDescription("Accept the terms to continue.");
    expect(container.querySelector("svg[aria-hidden='true']")).not.toBeNull();

    rerender(<Checkbox label="Accept the terms" errorMessage="Accept the terms to continue." />);
    expect(screen.queryByText("Accept the terms to continue.")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toHaveAttribute("aria-invalid");
  });

  it("drops the cut aliases at the type level", () => {
    // @ts-expect-error onChange was cut in v4; use onCheckedChange.
    render(<Checkbox aria-label="Accept" onChange={() => {}} />);
    // @ts-expect-error size was cut in v4; there is one box size.
    render(<Checkbox aria-label="Accept" size="sm" />);
    // @ts-expect-error description was cut in v4; use helperText.
    render(<Checkbox label="Accept" description="Old" />);
    expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
  });

  it("disables the checkbox", () => {
    render(<Checkbox aria-label="Accept" disabled />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-disabled", "true");
  });

  it("does not expose Field focus state when disabled", () => {
    render(
      <Field>
        <Checkbox aria-label="Accept" disabled data-testid="checkbox" />
      </Field>
    );

    const checkbox = screen.getByTestId("checkbox");
    checkbox.focus();

    expect(checkbox).not.toHaveAttribute("data-focused");
  });

  it("sets required attribute", () => {
    render(<Checkbox aria-label="Accept" required />);
    expect(screen.getByRole("checkbox")).toBeRequired();
  });

  it("does not toggle when readOnly", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Checkbox
        aria-label="Accept"
        defaultChecked={false}
        readOnly
        onCheckedChange={handleChange}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("forwards form props to the hidden input", () => {
    let inputNode: HTMLInputElement | null = null;
    const { container } = render(
      <Checkbox
        aria-label="Accept"
        id="terms-checkbox"
        name="terms"
        form="external-form"
        value="yes"
        uncheckedValue="no"
        inputRef={(node) => {
          inputNode = node;
        }}
      />
    );

    const input = container.querySelector('input[type="checkbox"][name="terms"]');
    const uncheckedInput = container.querySelector('input[type="hidden"][name="terms"]');
    expect(input).toBe(inputNode);
    expect(input).toHaveAttribute("id", "terms-checkbox");
    expect(screen.getByRole("checkbox")).not.toHaveAttribute("id", "terms-checkbox");
    expect(input).toHaveAttribute("form", "external-form");
    expect(input).toHaveAttribute("value", "yes");
    expect(uncheckedInput).toHaveAttribute("form", "external-form");
    expect(uncheckedInput).toHaveAttribute("value", "no");
  });

  it("calls onCheckedChange with the new value on click", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept" onCheckedChange={handleChange} />);
    await user.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe(true);
  });

  it("validates exactly once when changed inside a Field", async () => {
    const validate = vi.fn();
    const user = userEvent.setup();
    render(
      <Field validationMode="onChange" validate={validate}>
        <Checkbox aria-label="Accept" />
      </Field>
    );

    await user.click(screen.getByRole("checkbox"));

    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenLastCalledWith(true, expect.anything());
  });

  it("delivers exactly one click to an ancestor per user click", async () => {
    const handleAncestorClick = vi.fn();
    const user = userEvent.setup();
    render(
      <div onClick={handleAncestorClick}>
        <Checkbox label="Accept" />
      </div>
    );

    await user.click(screen.getByRole("checkbox"));
    expect(handleAncestorClick).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText("Accept"));
    expect(handleAncestorClick).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Checkbox label="Accessible checkbox" />);
    await expectNoA11yViolations(container);
  });

  it("paints the box on the band at the checkbox radius with no sheen", () => {
    expect(checkboxStyles).toMatch(
      /\$_radius:\s*var\(--fui-checkbox-radius,\s*min\(4px,\s*calc\(var\(--fui-radius,/
    );
    expect(checkboxStyles).toMatch(/background-color:\s*var\(--fui-field-bg,/);
    expect(checkboxStyles).not.toMatch(/--fui-radius-indicator/);
    expect(checkboxStyles).not.toMatch(/box-shadow/);
    expect(checkboxStyles).not.toMatch(/--fui-color-danger(?!-text)/);
    // The outline card's edge and states come from the choice-card recipe.
    expect(checkboxStyles).toMatch(/\.wrapperOutline\s*\{\s*@include choice-card\.root;/);
  });

  it("allows an application ancestor to override the public control radius", () => {
    render(
      <div data-testid="radius-scope" style={{ "--fui-checkbox-radius": "12px" } as CSSProperties}>
        <Checkbox aria-label="Rounded control" data-testid="rounded-control" />
      </div>
    );

    expect(screen.getByTestId("radius-scope")).toHaveStyle({
      "--fui-checkbox-radius": "12px",
    });
    expect(screen.getByTestId("rounded-control")).not.toHaveStyle({
      "--fui-checkbox-radius": "12px",
    });
  });
});
