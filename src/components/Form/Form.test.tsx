import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Field } from "../Field";
import { Form } from "./index";

describe("Form", () => {
  it("renders a form element", () => {
    const { container } = render(<Form>content</Form>);
    expect(container.querySelector("form")).toBeInTheDocument();
  });

  it("calls onFormSubmit when submitted", async () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const user = userEvent.setup();
    render(
      <Form onFormSubmit={handleSubmit} aria-label="Test form">
        <button type="submit">Submit</button>
      </Form>
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders children", () => {
    render(
      <Form aria-label="Test form">
        <span>Child content</span>
      </Form>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("does not submit while a required field is invalid", async () => {
    const handleSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const user = userEvent.setup();
    render(
      <Form onSubmit={handleSubmit} aria-label="Profile form">
        <Field name="email">
          <Field.Label>Email</Field.Label>
          <Field.Control>
            <input required />
          </Field.Control>
          <Field.Error match="valueMissing">Email is required</Field.Error>
        </Field>
        <button type="submit">Save</button>
      </Form>
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
  });

  it("does not block a valid submit on a pending async validator", async () => {
    const handleSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const validate = vi.fn(() => new Promise<null>(() => {}));
    const user = userEvent.setup();
    render(
      <Form onSubmit={handleSubmit} aria-label="Profile form">
        <Field validate={validate}>
          <Field.Label>Display name</Field.Label>
          <Field.Control>
            <input defaultValue="Ada" />
          </Field.Control>
        </Field>
        <button type="submit">Save</button>
      </Form>
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(validate).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders multiple server errors as a semantic list", () => {
    render(
      <Form
        aria-label="Profile form"
        errors={{ username: ["Username is reserved", "Username is too short"] }}
      >
        <Field name="username">
          <Field.Label>Username</Field.Label>
          <Field.Control>
            <input defaultValue="admin" />
          </Field.Control>
          <Field.Error />
        </Field>
      </Form>
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Username is reserved")).toBeInTheDocument();
    expect(screen.getByText("Username is too short")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Form aria-label="Accessible form">
        <label htmlFor="f">Name</label>
        <input id="f" />
      </Form>
    );
    await expectNoA11yViolations(container);
  });
});
