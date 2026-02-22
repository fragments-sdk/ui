import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Fieldset } from '.';
import { Field } from '../Field';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { Select } from '../Select';
import { Checkbox } from '../Checkbox';
import { Grid } from '../Grid';

export default defineFragment({
  component: Fieldset,

  meta: {
    name: 'Fieldset',
    description: 'Groups related form fields with an accessible legend. Use to organize forms into logical sections.',
    category: 'forms',
    status: 'stable',
    tags: ['form', 'fieldset', 'group', 'legend', 'accessible'],
    since: '0.4.0',
  },

  usage: {
    when: [
      'Grouping related fields in a form (e.g., address, personal info)',
      'Disabling a group of fields together',
      'Providing an accessible group label for screen readers',
    ],
    whenNot: [
      'Generic visual grouping (use Card)',
      'Single field wrapping (use Field)',
    ],
    guidelines: [
      'Always include a Fieldset.Legend for accessibility',
      'Use disabled prop to disable all fields within the group',
      'Use Grid inside Fieldset for multi-column layouts',
      'Fieldset.Legend forwards DOM props for ids, aria attributes, and custom data hooks',
    ],
    accessibility: [
      'Renders semantic fieldset element',
      'Legend provides accessible group label',
      'Disabled state propagates to all child fields',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Fieldset content including Fieldset.Legend and form fields',
      required: true,
    },
    disabled: {
      type: 'boolean',
      description: 'Disables all fields within the fieldset',
    },
  },

  relations: [
    { component: 'Field', relationship: 'sibling', note: 'Contains Field components' },
    { component: 'Form', relationship: 'parent', note: 'Used within a Form' },
    { component: 'Card', relationship: 'alternative', note: 'Use Card for non-form visual grouping' },
  ],

  contract: {
    propsSummary: [
      'disabled: boolean - disables all child fields',
      'Fieldset.Legend: accessible group label',
      'Fieldset.Legend forwards DOM props',
    ],
    scenarioTags: ['form.group', 'form.fieldset'],
    a11yRules: ['A11Y_FIELDSET_LEGEND'],
  },

  variants: [
    {
      name: 'Two-column layout',
      description: 'Fieldset with Grid for side-by-side fields',
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
    },
    {
      name: 'Mixed controls',
      description: 'Fieldset with textarea, select, and checkbox',
      render: () => (
        <Fieldset>
          <Fieldset.Legend>Preferences</Fieldset.Legend>
          <Field name="bio">
            <Field.Label>Bio</Field.Label>
            <Field.Control>
              <Textarea placeholder="Tell us about yourself" rows={3} />
            </Field.Control>
            <Field.Description>Brief description for your profile.</Field.Description>
          </Field>
          <Field name="role">
            <Field.Label>Role</Field.Label>
            <Field.Control>
              <Select placeholder="Select a role">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="admin">Admin</Select.Item>
                  <Select.Item value="editor">Editor</Select.Item>
                  <Select.Item value="viewer">Viewer</Select.Item>
                </Select.Content>
              </Select>
            </Field.Control>
          </Field>
          <Field name="newsletter">
            <Field.Control>
              <Checkbox label="Subscribe to newsletter" />
            </Field.Control>
          </Field>
        </Fieldset>
      ),
    },
    {
      name: 'Disabled',
      description: 'Disabled fieldset prevents interaction with all children',
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
          <Field name="lockedCheck">
            <Field.Control>
              <Checkbox label="Cannot toggle" defaultChecked />
            </Field.Control>
          </Field>
        </Fieldset>
      ),
    },
  ],
});
