import type { Meta, StoryObj } from '@storybook/react';
import { Field } from '.';
import { Input } from '../Input';

/**
 * Field is a compositional form-field wrapper providing validation, labels,
 * descriptions, and error messages. It is a compound component: compose
 * Field.Label, Field.Control, Field.Description, and Field.Error inside the
 * root. Field.Control connects any form control to the field context.
 */
const meta = {
  title: 'Forms/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Form field wrapper providing labels, descriptions, validation, and error messages.',
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the field and its control',
    },
    invalid: { control: 'boolean', description: 'Marks the field as invalid' },
    validationMode: {
      control: 'select',
      options: ['onSubmit', 'onBlur', 'onChange'],
      description: 'When to trigger validation',
    },
  },
  args: {
    name: 'email',
    children: (
      <>
        <Field.Label>Email address</Field.Label>
        <Field.Control>
          <Input type="email" placeholder="jane@example.com" />
        </Field.Control>
        <Field.Description>We will never share your email.</Field.Description>
      </>
    ),
  },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field name="email">
      <Field.Label>Email address</Field.Label>
      <Field.Control>
        <Input type="email" placeholder="jane@example.com" />
      </Field.Control>
      <Field.Description>We will never share your email.</Field.Description>
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field name="email" invalid>
      <Field.Label>Email</Field.Label>
      <Field.Control>
        <Input type="email" defaultValue="not-an-email" />
      </Field.Control>
      <Field.Error match="typeMismatch">Enter a valid email address</Field.Error>
    </Field>
  ),
};

export const CustomValidation: Story = {
  render: () => (
    <Field
      name="age"
      validate={(value) => {
        const num = Number(value);
        if (isNaN(num) || num < 18) return 'Must be 18 or older';
        return null;
      }}
      validationMode="onChange"
      validationDebounceTime={500}
    >
      <Field.Label>Age</Field.Label>
      <Field.Control>
        <Input type="number" placeholder="18" />
      </Field.Control>
      <Field.Description>You must be at least 18 years old.</Field.Description>
      <Field.Error match="customError" />
    </Field>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Field name="username" disabled>
      <Field.Label>Username</Field.Label>
      <Field.Control>
        <Input defaultValue="janedoe" />
      </Field.Control>
      <Field.Description>This field cannot be edited.</Field.Description>
    </Field>
  ),
};
