import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Field } from "../Field";
import { Form } from "./index";

const formStyles = readFileSync(
  resolve(process.cwd(), "src/components/Form/Form.module.scss"),
  "utf8"
);
const overlayRecipe = readFileSync(resolve(process.cwd(), "src/recipes/_overlay.scss"), "utf8");

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

  it("provides the shared right-aligned action slot used by forms and modal footers", () => {
    render(
      <Form aria-label="Action form">
        <Form.Actions data-testid="form-actions">
          <button type="button">Cancel</button>
          <button type="submit">Save</button>
        </Form.Actions>
      </Form>
    );

    expect(screen.getByTestId("form-actions")).toHaveClass("actions");
    expect(formStyles).toMatch(/\.actions\s*\{[\s\S]*justify-content:\s*flex-end;/);
    expect(overlayRecipe).toMatch(/@mixin footer\s*\{[\s\S]*justify-content:\s*flex-end;/);
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
