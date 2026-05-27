import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Checkbox } from "./index";

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

  it("has no accessibility violations", async () => {
    const { container } = render(<Checkbox label="Accessible checkbox" />);
    await expectNoA11yViolations(container);
  });
});
