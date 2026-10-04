import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Form } from ".";
import { Field } from "../Field";
import { Input } from "../Input";
import { Grid } from "../Grid";
import { Button } from "../Button";

/**
 * Form stacks its Fields with right-aligned actions, routes server errors to
 * the Field with the matching name, and locks every control while `pending`.
 * It renders a semantic form element.
 */
const meta = {
  title: "Forms/Form",
  component: Form,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Form wrapper that distributes server-side errors to Field components.",
      },
    },
  },
  argTypes: {
    validationMode: {
      control: "select",
      options: ["onSubmit", "onBlur", "onChange"],
      description: "When field validation should run",
    },
    pending: {
      control: "boolean",
      description: "A submit is in flight: aria-busy and every control locked",
    },
  },
} satisfies Meta<typeof Form>;

export default meta;

// Typed from the component, not the meta: every story renders its own
// children, and JSX stays out of component-level args (Storybook docs).
type Story = StoryObj<typeof Form>;

export const SignUp: Story = {
  render: () => (
    <Form onSubmit={(e) => e.preventDefault()}>
      <Grid columns={2} gap="md">
        <Field name="firstName">
          <Field.Label>First name</Field.Label>
          <Field.Control>
            <Input placeholder="Jane" />
          </Field.Control>
        </Field>
        <Field name="lastName">
          <Field.Label>Last name</Field.Label>
          <Field.Control>
            <Input placeholder="Doe" />
          </Field.Control>
        </Field>
        <Grid.Item colSpan="full">
          <Field name="email">
            <Field.Label>Email</Field.Label>
            <Field.Control>
              <Input type="email" placeholder="jane@example.com" />
            </Field.Control>
            <Field.Error match="typeMismatch">Enter a valid email address</Field.Error>
          </Field>
        </Grid.Item>
      </Grid>
      <Form.Actions>
        <Button type="submit" variant="solid">
          Create account
        </Button>
      </Form.Actions>
    </Form>
  ),
};

export const WithServerErrors: Story = {
  render: () => (
    <Form
      errors={{
        username: "Username is already taken",
        email: "Email is already registered",
      }}
    >
      <Grid columns={2} gap="md">
        <Field name="username">
          <Field.Label>Username</Field.Label>
          <Field.Control>
            <Input defaultValue="janedoe" />
          </Field.Control>
          <Field.Error />
        </Field>
        <Field name="email">
          <Field.Label>Email</Field.Label>
          <Field.Control>
            <Input type="email" defaultValue="jane@example.com" />
          </Field.Control>
          <Field.Error />
        </Field>
      </Grid>
      <Form.Actions>
        <Button type="submit" variant="solid">
          Submit
        </Button>
      </Form.Actions>
    </Form>
  ),
};

export const ValidateOnBlur: Story = {
  render: () => (
    <Form validationMode="onBlur" onSubmit={(e) => e.preventDefault()}>
      <Grid columns={1} gap="md">
        <Field name="email">
          <Field.Label>Email</Field.Label>
          <Field.Control>
            <Input type="email" placeholder="you@example.com" />
          </Field.Control>
          <Field.Error match="typeMismatch">Enter a valid email address</Field.Error>
        </Field>
      </Grid>
      <Form.Actions>
        <Button type="submit" variant="solid">
          Submit
        </Button>
      </Form.Actions>
    </Form>
  ),
};

export const Pending: Story = {
  render: () => {
    function Demo() {
      const [pending, setPending] = React.useState(false);
      return (
        <Form
          pending={pending}
          onSubmit={(event) => {
            event.preventDefault();
            setPending(true);
            window.setTimeout(() => setPending(false), 2000);
          }}
        >
          <Field name="name">
            <Field.Label>Display name</Field.Label>
            <Input defaultValue="Jane Doe" />
          </Field>
          <Field name="email">
            <Field.Label>Email</Field.Label>
            <Input type="email" defaultValue="jane@example.com" />
          </Field>
          <Form.Actions>
            <Button type="submit" variant="solid" pending={pending}>
              Save
            </Button>
          </Form.Actions>
        </Form>
      );
    }
    return <Demo />;
  },
};
