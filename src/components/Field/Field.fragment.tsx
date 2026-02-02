import React from 'react';
import { defineSegment } from '@fragments/core';
import { Field } from './index.js';
import { Input } from '../Input/index.js';
import { Grid } from '../Grid/index.js';

export default defineSegment({
  component: Field,

  meta: {
    name: 'Field',
    description: 'Compositional form field wrapper providing validation, labels, descriptions, and error messages. Use for advanced form needs beyond baked-in Input/Textarea props.',
    category: 'forms',
    status: 'stable',
    tags: ['form', 'field', 'validation', 'label', 'error', 'input', 'accessible'],
    since: '0.4.0',
  },

  usage: {
    when: [
      'You need granular validation with match-based error messages',
      'Custom form controls need accessible labels and descriptions',
      'Server-side errors need to be distributed to specific fields',
      'You need dirty/touched tracking or custom validation logic',
    ],
    whenNot: [
      'Simple inputs with basic label and helper text (use Input with label prop)',
      'Standalone selects or textareas with built-in error display',
    ],
    guidelines: [
      'Always provide a Field.Label for accessibility',
      'Wrap any form control in Field.Control to connect it to the field context',
      'Use match prop on Field.Error for granular native validation messages',
      'Wrap in Form to enable server-side error distribution by field name',
    ],
    accessibility: [
      'Label automatically linked to control via aria-labelledby',
      'Description linked via aria-describedby',
      'Error messages announced to screen readers',
      'Supports data-disabled and data-invalid attributes for styling',
    ],
  },

  props: {
    name: {
      type: 'string',
      description: 'Field name, used for error distribution from Form',
    },
    disabled: {
      type: 'boolean',
      description: 'Disables the field and its control',
    },
    invalid: {
      type: 'boolean',
      description: 'Marks the field as invalid',
    },
    validate: {
      type: 'function',
      description: 'Custom validation function returning error string(s) or null',
    },
    validationMode: {
      type: 'enum',
      description: 'When to trigger validation',
      values: ['onSubmit', 'onBlur', 'onChange'],
    },
    validationDebounceTime: {
      type: 'number',
      description: 'Debounce time in ms for onChange validation',
    },
    className: {
      type: 'string',
      description: 'Additional CSS class',
    },
  },

  relations: [
    { component: 'Input', relationship: 'alternative', note: 'Use Input for simple fields with built-in label/error' },
    { component: 'Form', relationship: 'parent', note: 'Wrap in Form for server-side error distribution' },
    { component: 'Fieldset', relationship: 'sibling', note: 'Use Fieldset to group related fields' },
  ],

  contract: {
    propsSummary: [
      'name: string - field name for error distribution',
      'validate: (value) => string | null - custom validation',
      'validationMode: onSubmit|onBlur|onChange - validation trigger',
      'Field.Control: wraps any form component (Input, Textarea, etc.)',
      'Field.Error match: valueMissing|typeMismatch|customError|... - granular errors',
    ],
    scenarioTags: [
      'form.field',
      'form.validation',
      'form.accessible',
    ],
    a11yRules: ['A11Y_FIELD_LABEL', 'A11Y_FIELD_ERROR', 'A11Y_FIELD_DESCRIPTION'],
  },

  variants: [
    {
      name: 'Single field',
      description: 'A single field with label, control, and description',
      render: () => (
        <Field name="email">
          <Field.Label>Email address</Field.Label>
          <Field.Control>
            <Input type="email" placeholder="jane@example.com" />
          </Field.Control>
          <Field.Description>We will never share your email.</Field.Description>
        </Field>
      ),
    },
    {
      name: 'Two-column layout',
      description: 'Fields arranged in a two-column grid',
      render: () => (
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
        </Grid>
      ),
    },
    {
      name: 'Custom validation',
      description: 'Field with custom validate function',
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
    },
  ],
});
