import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from "../../test/utils";
import { Form } from "../Form";
import { Field } from "./index";

describe("Field", () => {
  it("renders children inside the field root", () => {
    render(
      <Field>
        <Field.Label>Username</Field.Label>
        <Field.Control>
          <input />
        </Field.Control>
      </Field>
    );
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("associates label with control", () => {
    render(
      <Field>
        <Field.Label>Username</Field.Label>
        <Field.Control>
          <input />
        </Field.Control>
      </Field>
    );
    expect(screen.getByRole("textbox")).toHaveAccessibleName("Username");
  });

  it("renders description text", () => {
    render(
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <input />
        </Field.Control>
        <Field.Description>We will never share your email.</Field.Description>
      </Field>
    );
    expect(screen.getByText("We will never share your email.")).toBeInTheDocument();
  });

  it("preserves a control description while adding the Field description", () => {
    render(
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Control aria-describedby="external-description">
          <input />
        </Field.Control>
        <Field.Description>Email is used for account recovery.</Field.Description>
      </Field>
    );

    const description = screen.getByText("Email is used for account recovery.");
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-describedby",
      `external-description ${description.id}`
    );
  });

  it("sets aria-invalid on control when invalid", () => {
    render(
      <Field invalid>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <input />
        </Field.Control>
      </Field>
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("registers the rendered control name and current value for form validation", async () => {
    const validate = vi.fn(() => null);
    const user = userEvent.setup();
    render(
      <Form aria-label="Profile form" onSubmit={(event) => event.preventDefault()}>
        <Field validate={validate}>
          <Field.Label>Email</Field.Label>
          <Field.Control name="email" defaultValue="initial@example.com">
            <input />
          </Field.Control>
        </Field>
        <button type="submit">Save</button>
      </Form>
    );

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "latest@example.com");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(validate).toHaveBeenCalled();
    expect(validate).toHaveBeenLastCalledWith("latest@example.com", {
      email: "latest@example.com",
    });
  });

  it("revalidates valueMissing immediately after a type mismatch is cleared", async () => {
    const user = userEvent.setup();
    render(
      <Field validationMode="onBlur">
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <input type="email" required />
        </Field.Control>
        <Field.Error match="typeMismatch">Enter a valid email</Field.Error>
        <Field.Error match="valueMissing">Email is required</Field.Error>
      </Field>
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "invalid");
    await user.tab();

    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    expect(screen.queryByText("Email is required")).not.toBeInTheDocument();

    await user.click(input);
    await user.clear(input);

    await waitFor(() => {
      expect(screen.queryByText("Enter a valid email")).not.toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });
  });

  it("exposes compound component pattern", () => {
    expect(Field.Label).toBeDefined();
    expect(Field.Control).toBeDefined();
    expect(Field.Description).toBeDefined();
    expect(Field.Error).toBeDefined();
    expect(Field.Validity).toBeDefined();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Field>
        <Field.Label>Accessible field</Field.Label>
        <Field.Control>
          <input />
        </Field.Control>
      </Field>
    );
    await expectNoA11yViolations(container);
  });
});
