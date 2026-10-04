import type { Meta, StoryObj } from "@storybook/react";
import { Field } from ".";
import { Button } from "../Button";
import { Form } from "../Form";
import { Input } from "../Input";
import { Select } from "../Select";

/**
 * Field owns one control's label, description and error. Input, Textarea,
 * Select, Combobox and NumberField join it as direct children; Field.Control
 * connects a custom control. Field.Error carries an icon, so the failure never
 * relies on colour alone.
 */
const meta = {
  title: "Forms/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Form field wrapper providing labels, descriptions, validation, and error messages.",
      },
    },
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Disables the field and its control",
    },
    invalid: { control: "boolean", description: "Marks the field as invalid" },
    validationMode: {
      control: "select",
      options: ["onSubmit", "onBlur", "onChange"],
      description: "When to trigger validation",
    },
  },
  args: {
    name: "email",
  },
} satisfies Meta<typeof Field>;

export default meta;

// Typed from the component, not the meta: every story renders its own
// children, and JSX stays out of component-level args (Storybook docs).
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: () => (
    <Field name="email">
      <Field.Label>Email address</Field.Label>
      <Input type="email" placeholder="jane@example.com" />
      <Field.Description>We will never share your email.</Field.Description>
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field name="email" invalid>
      <Field.Label>Email</Field.Label>
      <Input type="email" defaultValue="not-an-email" />
      <Field.Error match>Enter a valid email address.</Field.Error>
    </Field>
  ),
};

export const Required: Story = {
  render: () => (
    <Field name="name">
      <Field.Label>
        Name <Field.Required />
      </Field.Label>
      <Input required />
    </Field>
  ),
};

export const BrowserMessage: Story = {
  render: () => (
    <Form onSubmit={(event) => event.preventDefault()}>
      <Field name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" required />
        <Field.Error />
      </Field>
      <Form.Actions>
        <Button type="submit">Check</Button>
      </Form.Actions>
    </Form>
  ),
};

export const WithSelect: Story = {
  render: () => (
    <Field name="team" invalid>
      <Field.Label>Team</Field.Label>
      <Select placeholder="Choose a team">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="design">Design</Select.Item>
          <Select.Item value="engineering">Engineering</Select.Item>
        </Select.Content>
      </Select>
      <Field.Error match>Choose a team.</Field.Error>
    </Field>
  ),
};

export const CustomValidation: Story = {
  render: () => (
    <Field
      name="age"
      validate={(value) => {
        const num = Number(value);
        if (isNaN(num) || num < 18) return "Must be 18 or older";
        return null;
      }}
      validationMode="onChange"
      validationDebounceTime={500}
    >
      <Field.Label>Age</Field.Label>
      <Input type="number" placeholder="18" />
      <Field.Description>You must be at least 18 years old.</Field.Description>
      <Field.Error match="customError" />
    </Field>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Field name="username" disabled>
      <Field.Label>Username</Field.Label>
      <Input defaultValue="janedoe" />
      <Field.Description>This field cannot be edited.</Field.Description>
    </Field>
  ),
};
