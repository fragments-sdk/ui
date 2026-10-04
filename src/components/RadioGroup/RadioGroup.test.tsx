import { describe, it, expect, vi } from "vitest";
import { act, render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { RadioGroup } from "./index";

describe("RadioGroup", () => {
  it("renders a radiogroup role", () => {
    render(
      <RadioGroup label="Color">
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("puts the id and ref on the radiogroup and other props on the wrapper", () => {
    const ref = { current: null as HTMLDivElement | null };
    const { container } = render(
      <RadioGroup ref={ref} id="shipping-options" data-testid="shipping" label="Shipping">
        <RadioGroup.Item value="standard" label="Standard" />
      </RadioGroup>
    );

    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("id", "shipping-options");
    expect(ref.current).toBe(group);
    expect(container.firstElementChild).toHaveAttribute("data-testid", "shipping");
  });

  it("renders radio items", () => {
    render(
      <RadioGroup label="Color">
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("shows the error message with an icon and wires it to the group while invalid", () => {
    const { container, rerender } = render(
      <RadioGroup label="Color" invalid errorMessage="Choose a color.">
        <RadioGroup.Item value="red" label="Red" />
      </RadioGroup>
    );

    const group = screen.getByRole("radiogroup", { name: "Color" });
    expect(group).toHaveAttribute("data-invalid", "true");
    expect(group).toHaveAccessibleDescription("Choose a color.");
    expect(container.querySelector("svg[aria-hidden='true']")).not.toBeNull();

    rerender(
      <RadioGroup label="Color" errorMessage="Choose a color.">
        <RadioGroup.Item value="red" label="Red" />
      </RadioGroup>
    );
    expect(screen.queryByText("Choose a color.")).not.toBeInTheDocument();
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("aria-invalid");
  });

  it("carries the group's disabled and read-only states to every item row", () => {
    const { rerender } = render(
      <RadioGroup label="Color" disabled>
        <RadioGroup.Item value="red" label="Red" />
      </RadioGroup>
    );
    expect(screen.getByText("Red").closest("label")).toHaveAttribute("data-disabled", "true");

    rerender(
      <RadioGroup label="Color" readOnly>
        <RadioGroup.Item value="red" label="Red" />
      </RadioGroup>
    );
    const row = screen.getByText("Red").closest("label");
    expect(row).not.toHaveAttribute("data-disabled");
    expect(row).toHaveAttribute("data-readonly", "true");
  });

  it("drops the cut aliases at the type level", () => {
    render(
      // @ts-expect-error onChange was cut in v4; use onValueChange.
      <RadioGroup label="Color" onChange={() => {}}>
        {/* @ts-expect-error description was cut in v4; use helperText. */}
        <RadioGroup.Item value="red" label="Red" description="Old" />
      </RadioGroup>
    );
    render(
      // @ts-expect-error size was cut in v4; there is one size.
      <RadioGroup label="Size" size="sm">
        <RadioGroup.Item value="a" label="A" />
      </RadioGroup>
    );
    expect(screen.getAllByRole("radiogroup")).toHaveLength(2);
  });

  it("renders helperText on radio items (preferred API)", () => {
    render(
      <RadioGroup label="Shipping">
        <RadioGroup.Item value="standard" label="Standard" helperText="5-7 business days" />
      </RadioGroup>
    );
    expect(screen.getByText("5-7 business days")).toBeInTheDocument();
  });

  it("selects a radio on click", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup label="Color">
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    const radios = screen.getAllByRole("radio");
    await user.click(radios[1]);
    expect(radios[1]).toBeChecked();
  });

  it("selects a focused radio when Space is released", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup label="Color">
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );

    const blue = screen.getByRole("radio", { name: "Blue" });
    act(() => {
      blue.focus();
    });

    await user.keyboard("[Space>]");
    expect(blue).not.toBeChecked();

    await user.keyboard("[/Space]");
    expect(blue).toBeChecked();
  });

  it("renders the group label", () => {
    render(
      <RadioGroup label="Choose a color">
        <RadioGroup.Item value="red" label="Red" />
      </RadioGroup>
    );
    expect(screen.getByText("Choose a color")).toBeInTheDocument();
  });

  it("sets defaultValue as the initially selected radio", () => {
    render(
      <RadioGroup label="Color" defaultValue="blue">
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[1]).toBeChecked();
  });

  it("disables all items when disabled prop is set", () => {
    render(
      <RadioGroup label="Color" disabled>
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => expect(radio).toHaveAttribute("aria-disabled", "true"));
  });

  it("exposes required state on the radiogroup, not on each radio", () => {
    render(
      <RadioGroup label="Color" required>
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-required", "true");
    screen
      .getAllByRole("radio")
      .forEach((radio) => expect(radio).not.toHaveAttribute("aria-required"));
  });

  it("exposes readOnly state on the radiogroup, not on each radio", () => {
    render(
      <RadioGroup label="Color" defaultValue="red" readOnly>
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-readonly", "true");
    screen
      .getAllByRole("radio")
      .forEach((radio) => expect(radio).not.toHaveAttribute("aria-readonly"));
  });

  it("does not select another item when readOnly", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RadioGroup label="Color" defaultValue="red" readOnly onValueChange={handleChange}>
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );

    const radios = screen.getAllByRole("radio");
    await user.click(radios[1]);

    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("forwards form props to the hidden inputs", () => {
    let inputNode: HTMLInputElement | null = null;
    const { container } = render(
      <RadioGroup
        label="Color"
        name="color"
        form="external-form"
        inputRef={(node) => {
          inputNode = node;
        }}
      >
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );

    const inputs = Array.from(container.querySelectorAll('input[name="color"]'));
    expect(inputNode).toBeTruthy();
    expect(inputs.length).toBeGreaterThan(0);
    inputs.forEach((input) => {
      expect(input).toHaveAttribute("form", "external-form");
    });
  });

  it("disables individual items", () => {
    render(
      <RadioGroup label="Color">
        <RadioGroup.Item value="red" label="Red" disabled />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-disabled", "true");
    expect(radios[1]).not.toHaveAttribute("aria-disabled", "true");
  });

  it("omits a disabled selected item from native form submission", () => {
    render(
      <form data-testid="form">
        <RadioGroup label="Color" name="color" defaultValue="red">
          <RadioGroup.Item value="red" label="Red" disabled />
          <RadioGroup.Item value="blue" label="Blue" />
        </RadioGroup>
      </form>
    );

    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(screen.getByRole("radio", { name: "Red" })).toBeChecked();
    expect(new FormData(form).get("color")).toBeNull();
  });

  it("calls onValueChange with the selected value", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RadioGroup label="Color" onValueChange={handleChange}>
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    await user.click(screen.getAllByRole("radio")[0]);
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe("red");
  });

  it("puts a trailing value at the end of the row, inside the item's label", () => {
    render(
      <RadioGroup label="Plan" variant="outline">
        <RadioGroup.Item value="pro" label="3 repositories" trailing="$219 a month" />
      </RadioGroup>
    );
    const row = screen.getByText("3 repositories").closest("label");
    expect(row).toHaveAttribute("data-has-trailing", "true");
    expect(row).toHaveTextContent("3 repositories$219 a month");
    expect(screen.getByRole("radio", { name: "3 repositories $219 a month" })).toBeInTheDocument();
  });

  it("delivers exactly one click to an ancestor per user click", async () => {
    const handleAncestorClick = vi.fn();
    const user = userEvent.setup();
    render(
      <div onClick={handleAncestorClick}>
        <RadioGroup label="Color">
          <RadioGroup.Item value="red" label="Red" />
          <RadioGroup.Item value="blue" label="Blue" />
        </RadioGroup>
      </div>
    );

    await user.click(screen.getByRole("radio", { name: "Red" }));
    expect(handleAncestorClick).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText("Blue"));
    expect(handleAncestorClick).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("radio", { name: "Blue" })).toBeChecked();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <RadioGroup label="Accessible group">
        <RadioGroup.Item value="a" label="Option A" />
        <RadioGroup.Item value="b" label="Option B" />
      </RadioGroup>
    );
    await expectNoA11yViolations(container);
  });

  // The old `error` prop shipped once rendering only the message: no invalid edge
  // and no aria-invalid, so the control looked and read as valid. Assert the
  // rendered pair, not the source text — a source check cannot tell whether
  // the attribute is present but the selector never matches.
  it("marks the control invalid both visually and programmatically", () => {
    const { container } = render(
      <RadioGroup label="Color" invalid errorMessage="Pick one">
        <RadioGroup.Item value="red" label="Red" />
      </RadioGroup>
    );

    expect(container.querySelector("[data-invalid]")).not.toBeNull();
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
  });
});
