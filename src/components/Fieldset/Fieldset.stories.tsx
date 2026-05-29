import type { Meta, StoryObj } from '@storybook/react';
import { Fieldset } from '.';
import { Field } from '../Field';
import { Input } from '../Input';
import { Grid } from '../Grid';

/**
 * Fieldset groups related form fields with an accessible legend. It is a
 * compound component: compose Fieldset.Legend and Fieldset.Description inside
 * the root, alongside the grouped Field components.
 */
const meta = {
  title: 'Forms/Fieldset',
  component: Fieldset,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Groups related form fields with an accessible legend.',
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables all fields within the fieldset',
    },
  },
  args: {
    children: (
      <>
        <Fieldset.Legend>Personal Information</Fieldset.Legend>
        <Field name="firstName">
          <Field.Label>First Name</Field.Label>
          <Field.Control>
            <Input placeholder="Jane" />
          </Field.Control>
        </Field>
      </>
    ),
  },
} satisfies Meta<typeof Fieldset>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoColumnLayout: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Personal Information</Fieldset.Legend>
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
          </Field>
        </Grid.Item>
      </Grid>
    </Fieldset>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Fieldset>
      <Fieldset.Legend>Account Details</Fieldset.Legend>
      <Fieldset.Description>
        Choose how others will see you on the platform.
      </Fieldset.Description>
      <Field name="displayName">
        <Field.Label>Display Name</Field.Label>
        <Field.Control>
          <Input placeholder="How others see you" />
        </Field.Control>
      </Field>
    </Fieldset>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Fieldset disabled>
      <Fieldset.Legend>Locked Section</Fieldset.Legend>
      <Grid columns={2} gap="md">
        <Field name="lockedFirst">
          <Field.Label>First Name</Field.Label>
          <Field.Control>
            <Input defaultValue="Jane" />
          </Field.Control>
        </Field>
        <Field name="lockedLast">
          <Field.Label>Last Name</Field.Label>
          <Field.Control>
            <Input defaultValue="Doe" />
          </Field.Control>
        </Field>
      </Grid>
    </Fieldset>
  ),
};
