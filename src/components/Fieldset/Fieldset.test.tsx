import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Field } from "../Field";
import { Form } from "../Form";
import { Fieldset } from "./index";

describe("Fieldset", () => {
  it("renders a fieldset element", () => {
    render(
      <Fieldset>
        <Fieldset.Legend>Personal Info</Fieldset.Legend>
        <input aria-label="Name" />
      </Fieldset>
    );
    // Base UI renders a fieldset element
    const fieldset = screen.getByRole("group");
    expect(fieldset).toBeInTheDocument();
  });

  it("renders a legend", () => {
    render(
      <Fieldset>
        <Fieldset.Legend>Contact Details</Fieldset.Legend>
      </Fieldset>
    );
    expect(screen.getByText("Contact Details")).toBeInTheDocument();
  });

  it("passes disabled prop to fieldset element", () => {
    const { container } = render(
      <Fieldset disabled>
        <Fieldset.Legend>Settings</Fieldset.Legend>
        <input aria-label="Option" />
      </Fieldset>
    );
    const fieldset = container.querySelector("fieldset");
    expect(fieldset).toBeInTheDocument();
    expect(fieldset).toBeDisabled();
    expect(fieldset).toHaveAttribute("disabled");
    expect(fieldset).toHaveAttribute("data-disabled", "");
  });

  it("omits disabled descendants from form data and validation", async () => {
    const validate = vi.fn(() => "Should not run");
    const handleSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const user = userEvent.setup();
    render(
      <Form onSubmit={handleSubmit} aria-label="Profile form" data-testid="form">
        <Fieldset disabled>
          <Fieldset.Legend>Profile</Fieldset.Legend>
          <Field name="email" validate={validate}>
            <Field.Label>Email</Field.Label>
            <Field.Control>
              <input name="email" defaultValue="ada@example.com" />
            </Field.Control>
          </Field>
        </Fieldset>
        <button type="submit">Save</button>
      </Form>
    );

    const form = screen.getByTestId("form") as HTMLFormElement;
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(new FormData(form).has("email")).toBe(false);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(validate).not.toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Fieldset>
        <Fieldset.Legend>Accessible fieldset</Fieldset.Legend>
        <input aria-label="Field" />
      </Fieldset>
    );
    await expectNoA11yViolations(container);
  });

  it("forwards DOM props to Fieldset.Legend", () => {
    render(
      <Fieldset>
        <Fieldset.Legend data-testid="legend" id="legend-id" aria-live="polite">
          Accessible legend
        </Fieldset.Legend>
      </Fieldset>
    );

    const legend = screen.getByTestId("legend");
    expect(legend).toHaveAttribute("id", "legend-id");
    expect(legend).toHaveAttribute("aria-live", "polite");
  });
});
