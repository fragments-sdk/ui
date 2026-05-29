import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '.';
import { Field } from '../Field';
import { Input } from '../Input';
import { Grid } from '../Grid';
import { Button } from '../Button';

/**
 * Form is a wrapper that handles server-side error distribution to Field
 * components by field name. It pairs with Field and Fieldset for complete form
 * validation, and renders a semantic form element.
 */
const meta = {
  title: 'Forms/Form',
  component: Form,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Form wrapper that distributes server-side errors to Field components.',
      },
    },
  },
  argTypes: {
    validationMode: {
      control: 'select',
      options: ['onSubmit', 'onBlur', 'onChange'],
      description: 'When field validation should run',
    },
  },
  args: {
    children: (
      <Grid columns={1} gap="md">
        <Field name="email">
          <Field.Label>Email</Field.Label>
          <Field.Control>
            <Input type="email" placeholder="jane@example.com" />
          </Field.Control>
        </Field>
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </Grid>
    ),
  },
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignUp: Story = {
  render: () => (
    <Form onSubmit={(e) => e.preventDefault()}>
      <Grid columns={2} gap="md">
        <Field name="firstName">
          <Field.Label>First Name</Field.Label>
          <Field.Control>
            <Input placeholder="Jane" />
          </Field.Control>
        </Field>
        <Field name="lastName">
          <Field.Label>Last Name</Field.Label>
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
            <Field.Error match="typeMismatch">
              Enter a valid email address
            </Field.Error>
          </Field>
        </Grid.Item>
        <Grid.Item colSpan="full">
          <Button type="submit" variant="primary">
            Create Account
          </Button>
        </Grid.Item>
      </Grid>
    </Form>
  ),
};

export const WithServerErrors: Story = {
  render: () => (
    <Form
      errors={{
        username: 'Username is already taken',
        email: 'Email is already registered',
      }}
    >
      <Grid columns={2} gap="md">
        <Field name="username">
          <Field.Label>Username</Field.Label>
          <Field.Control>
            <Input defaultValue="janedoe" />
          </Field.Control>
          <Field.Error match="customError" />
        </Field>
        <Field name="email">
          <Field.Label>Email</Field.Label>
          <Field.Control>
            <Input type="email" defaultValue="jane@example.com" />
          </Field.Control>
          <Field.Error match="customError" />
        </Field>
        <Grid.Item colSpan="full">
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </Grid.Item>
      </Grid>
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
          <Field.Error match="typeMismatch">
            Enter a valid email address
          </Field.Error>
        </Field>
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </Grid>
    </Form>
  ),
};
