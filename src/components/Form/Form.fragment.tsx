import React from 'react';
import { defineSegment } from '@fragments/core';
import { Form } from './index.js';
import { Field } from '../Field/index.js';
import { Fieldset } from '../Fieldset/index.js';
import { Input } from '../Input/index.js';
import { Textarea } from '../Textarea/index.js';
import { Select } from '../Select/index.js';
import { Checkbox } from '../Checkbox/index.js';
import { RadioGroup } from '../RadioGroup/index.js';
import { Toggle } from '../Toggle/index.js';
import { Button } from '../Button/index.js';
import { Grid } from '../Grid/index.js';

export default defineSegment({
  component: Form,

  meta: {
    name: 'Form',
    description: 'Form wrapper that handles server-side error distribution to Field components. Pairs with Field for complete form validation.',
    category: 'forms',
    status: 'stable',
    tags: ['form', 'validation', 'errors', 'submit', 'server'],
    since: '0.4.0',
  },

  usage: {
    when: [
      'Building forms that need server-side error handling',
      'Distributing validation errors to specific fields by name',
      'Combining client and server validation in one form',
    ],
    whenNot: [
      'Simple forms with only client-side validation (use native form or Field alone)',
      'Non-form layouts (use Grid or Card)',
    ],
    guidelines: [
      'Pass errors as Record<string, string | string[]> keyed by field name',
      'Use onClearErrors to clear errors when fields are modified',
      'Use onFormSubmit for form submission handling',
      'Field components with matching name prop display errors automatically',
      'Use Grid inside Form or Fieldset for multi-column layouts',
    ],
    accessibility: [
      'Renders semantic form element',
      'Error messages linked to fields via aria-describedby',
    ],
  },

  props: {
    errors: {
      type: 'object',
      description: 'Server-side errors keyed by field name',
    },
    onFormSubmit: {
      type: 'function',
      description: 'Form submission handler',
    },
    onClearErrors: {
      type: 'function',
      description: 'Called with field name when errors should be cleared',
    },
    className: {
      type: 'string',
      description: 'Additional CSS class',
    },
  },

  relations: [
    { component: 'Field', relationship: 'sibling', note: 'Contains Field components for error distribution' },
    { component: 'Fieldset', relationship: 'sibling', note: 'Use Fieldset to group fields within a Form' },
    { component: 'Button', relationship: 'sibling', note: 'Use Button type="submit" for form submission' },
  ],

  contract: {
    propsSummary: [
      'errors: Record<string, string | string[]> - server errors by field name',
      'onFormSubmit: (event) => void - submission handler',
      'onClearErrors: (name) => void - clear errors callback',
    ],
    scenarioTags: ['form.submit', 'form.validation', 'form.server'],
    a11yRules: ['A11Y_FORM_LABEL'],
  },

  variants: [
    {
      name: 'Sign up',
      description: 'Registration form with two-column name fields',
      render: () => (
        <Form onFormSubmit={(e) => { e.preventDefault(); }}>
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
                <Field.Error match="typeMismatch">Enter a valid email address</Field.Error>
              </Field>
            </Grid.Item>
            <Grid.Item colSpan="full">
              <Field name="password">
                <Field.Label>Password</Field.Label>
                <Field.Control>
                  <Input type="password" placeholder="At least 8 characters" />
                </Field.Control>
                <Field.Description>Must be at least 8 characters</Field.Description>
              </Field>
            </Grid.Item>
            <Grid.Item colSpan="full">
              <Field name="terms">
                <Field.Control>
                  <Checkbox label="I agree to the terms and conditions" />
                </Field.Control>
              </Field>
            </Grid.Item>
            <Grid.Item colSpan="full">
              <Button type="submit" variant="primary">Create Account</Button>
            </Grid.Item>
          </Grid>
        </Form>
      ),
    },
    {
      name: 'Profile settings',
      description: 'Multi-section form with Fieldsets, toggles, and radio group',
      render: () => (
        <Form onFormSubmit={(e) => { e.preventDefault(); }}>
          <Fieldset>
            <Fieldset.Legend>Profile</Fieldset.Legend>
            <Grid columns={2} gap="md">
              <Field name="displayName">
                <Field.Label>Display Name</Field.Label>
                <Field.Control>
                  <Input placeholder="How others see you" />
                </Field.Control>
              </Field>
              <Field name="timezone">
                <Field.Label>Timezone</Field.Label>
                <Field.Control>
                  <Select placeholder="Select timezone">
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="utc">UTC</Select.Item>
                      <Select.Item value="est">Eastern (EST)</Select.Item>
                      <Select.Item value="pst">Pacific (PST)</Select.Item>
                      <Select.Item value="gmt">GMT</Select.Item>
                    </Select.Content>
                  </Select>
                </Field.Control>
              </Field>
              <Grid.Item colSpan="full">
                <Field name="bio">
                  <Field.Label>Bio</Field.Label>
                  <Field.Control>
                    <Textarea placeholder="Tell us about yourself" rows={3} maxLength={280} />
                  </Field.Control>
                  <Field.Description>Max 280 characters</Field.Description>
                </Field>
              </Grid.Item>
            </Grid>
          </Fieldset>
          <Fieldset>
            <Fieldset.Legend>Notifications</Fieldset.Legend>
            <Field name="emailNotifs">
              <Field.Control>
                <Toggle label="Email notifications" />
              </Field.Control>
            </Field>
            <Field name="marketingEmails">
              <Field.Control>
                <Toggle label="Marketing emails" />
              </Field.Control>
            </Field>
            <Field name="frequency">
              <Field.Label>Digest frequency</Field.Label>
              <Field.Control>
                <RadioGroup name="frequency" orientation="vertical">
                  <RadioGroup.Item value="daily" label="Daily" />
                  <RadioGroup.Item value="weekly" label="Weekly" />
                  <RadioGroup.Item value="monthly" label="Monthly" />
                </RadioGroup>
              </Field.Control>
            </Field>
          </Fieldset>
          <Button type="submit" variant="primary">Save Changes</Button>
        </Form>
      ),
    },
    {
      name: 'Contact form',
      description: 'Contact form with select, textarea, and checkbox',
      render: () => (
        <Form onFormSubmit={(e) => { e.preventDefault(); }}>
          <Grid columns={2} gap="md">
            <Field name="name">
              <Field.Label>Name</Field.Label>
              <Field.Control>
                <Input placeholder="Your name" />
              </Field.Control>
            </Field>
            <Field name="email">
              <Field.Label>Email</Field.Label>
              <Field.Control>
                <Input type="email" placeholder="you@example.com" />
              </Field.Control>
            </Field>
            <Grid.Item colSpan="full">
              <Field name="subject">
                <Field.Label>Subject</Field.Label>
                <Field.Control>
                  <Select placeholder="What is this about?">
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="general">General Inquiry</Select.Item>
                      <Select.Item value="support">Technical Support</Select.Item>
                      <Select.Item value="billing">Billing</Select.Item>
                      <Select.Item value="feedback">Feedback</Select.Item>
                    </Select.Content>
                  </Select>
                </Field.Control>
              </Field>
            </Grid.Item>
            <Grid.Item colSpan="full">
              <Field name="message">
                <Field.Label>Message</Field.Label>
                <Field.Control>
                  <Textarea placeholder="How can we help?" rows={5} />
                </Field.Control>
              </Field>
            </Grid.Item>
            <Grid.Item colSpan="full">
              <Field name="copy">
                <Field.Control>
                  <Checkbox label="Send me a copy" />
                </Field.Control>
              </Field>
            </Grid.Item>
            <Grid.Item colSpan="full">
              <Button type="submit" variant="primary">Send Message</Button>
            </Grid.Item>
          </Grid>
        </Form>
      ),
    },
    {
      name: 'With server errors',
      description: 'Form displaying server-side validation errors',
      render: () => (
        <Form errors={{ username: 'Username is already taken', email: 'Email is already registered' }}>
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
              <Button type="submit" variant="primary">Submit</Button>
            </Grid.Item>
          </Grid>
        </Form>
      ),
    },
  ],
});
