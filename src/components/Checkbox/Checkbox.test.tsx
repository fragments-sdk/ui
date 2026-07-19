import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Field } from "../Field";
import { Checkbox } from "./index";

const checkboxStyles = readFileSync(
  resolve(process.cwd(), "src/components/Checkbox/Checkbox.module.scss"),
  "utf8"
);
const componentProperties = readFileSync(
  resolve(process.cwd(), "src/tokens/_component-properties.scss"),
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

  it("renders description text", () => {
    render(<Checkbox label="Subscribe" description="Get weekly updates" />);
    expect(screen.getByText("Get weekly updates")).toBeInTheDocument();
  });

  it("renders helperText (preferred API)", () => {
    render(<Checkbox label="Subscribe" helperText="Get weekly updates" />);
    expect(screen.getByText("Get weekly updates")).toBeInTheDocument();
  });

  it("prefers helperText over description when both are provided", () => {
    render(
      <Checkbox
        label="Subscribe"
        helperText="Preferred helper text"
        description="Legacy description text"
      />
    );
    expect(screen.getByText("Preferred helper text")).toBeInTheDocument();
    expect(screen.queryByText("Legacy description text")).not.toBeInTheDocument();
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

  it("has no accessibility violations", async () => {
    const { container } = render(<Checkbox label="Accessible checkbox" />);
    await expectNoA11yViolations(container);
  });

  it("uses the published component-owned radius for control anatomy", () => {
    const radiusUses = checkboxStyles.match(
      /border-radius:\s*var\(--fui-checkbox-radius,\s*\$fui-checkbox-radius\);/g
    );

    expect(componentProperties).toContain("--fui-checkbox-radius: 0.25rem;");
    expect(checkboxStyles).not.toMatch(/\.checkbox\s*\{[\s\S]*?--fui-checkbox-radius\s*:/);
    expect(radiusUses).toHaveLength(2);
    expect(checkboxStyles).toContain("border-radius: var(--fui-radius-md, $fui-radius-md);");
  });

  it("allows an application ancestor to override the public control radius", () => {
    render(
      <div data-testid="radius-scope" style={{ "--fui-checkbox-radius": "0.75rem" }}>
        <Checkbox aria-label="Rounded control" data-testid="rounded-control" />
      </div>
    );

    expect(screen.getByTestId("radius-scope")).toHaveStyle({
      "--fui-checkbox-radius": "0.75rem",
    });
    expect(screen.getByTestId("rounded-control")).not.toHaveStyle({
      "--fui-checkbox-radius": "0.75rem",
    });
    expect(checkboxStyles).toContain(
      "border-radius: var(--fui-checkbox-radius, $fui-checkbox-radius);"
    );
  });
});
