import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Alert } from '.';

export default defineFragment({
  component: Alert,

  meta: {
    name: 'Alert',
    description: 'Contextual feedback messages for user actions or system status. Supports multiple severity levels with optional actions and dismissibility.',
    category: 'feedback',
    status: 'stable',
    tags: ['notification', 'message', 'feedback', 'banner', 'toast'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Communicating the result of a user action (success, error)',
      'Warning about potential issues before they occur',
      'Providing important contextual information inline',
      'System status notifications that require attention',
    ],
    whenNot: [
      'Brief status labels (use Badge instead)',
      'Transient notifications (use Toast/Snackbar)',
      'Form-field-level errors (use Input error prop)',
      'Confirmation before destructive actions (use Dialog)',
    ],
    guidelines: [
      'Match severity to the actual importance: info for context, warning for potential issues, error for failures',
      'Always provide actionable guidance in error alerts',
      'Use Alert.Title for complex messages; skip titles for brief one-liners',
      'Limit to one action per alert to avoid decision paralysis',
      'Use Alert.Close only for non-critical information',
      'Alert.Action and Alert.Close render buttons with type="button" by default (safe inside forms)',
      'Alert.Close composes your onClick handler with built-in dismiss behavior and respects preventDefault()',
      'Alert sub-components forward DOM props (aria-*, data-*, id, handlers) to their rendered elements',
    ],
    accessibility: [
      'Uses role="alert" for screen reader announcement',
      'Error and warning alerts are announced immediately by assistive technology',
      'Alert.Close must have an accessible label',
      'Color alone must not convey meaning - icons and text reinforce severity',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Alert content - use Alert.Icon, Alert.Body, Alert.Title, Alert.Content, Alert.Actions, Alert.Close sub-components',
      required: true,
    },
    severity: {
      type: 'enum',
      description: 'Visual severity level',
      values: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
  },

  relations: [
    { component: 'Badge', relationship: 'alternative', note: 'Use Badge for compact, inline status labels' },
    { component: 'Toast', relationship: 'alternative', note: 'Use Toast for transient notifications that auto-dismiss' },
    { component: 'Dialog', relationship: 'sibling', note: 'Use Dialog for blocking confirmations' },
  ],

  contract: {
    propsSummary: [
      'severity: info|success|warning|error - visual severity',
      'Sub-components: Alert.Icon, Alert.Body, Alert.Title, Alert.Content, Alert.Actions, Alert.Action, Alert.Close',
      'Alert.Action / Alert.Close accept button props and default type="button"',
    ],
    scenarioTags: [
      'feedback.message',
      'feedback.error',
      'feedback.success',
      'feedback.warning',
      'content.notification',
    ],
    a11yRules: ['A11Y_ALERT_ROLE', 'A11Y_ALERT_DISMISS', 'A11Y_ALERT_CONTRAST', 'A11Y_TARGET_SIZE_MIN'],
    validationBans: [
      { pattern: 'severity="error"(?!.*Alert.Content)', reason: 'Error alerts must include helpful message text' },
    ],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Icon', 'Body', 'Title', 'Content', 'Actions', 'Action', 'Close'],
    requiredChildren: ['Body'],
    commonPatterns: [
      '<Alert severity="info"><Alert.Icon /><Alert.Body><Alert.Content>{message}</Alert.Content></Alert.Body></Alert>',
      '<Alert severity="warning"><Alert.Icon /><Alert.Body><Alert.Title>{title}</Alert.Title><Alert.Content>{message}</Alert.Content></Alert.Body></Alert>',
      '<Alert severity="error"><Alert.Icon /><Alert.Body><Alert.Title>{title}</Alert.Title><Alert.Content>{message}</Alert.Content></Alert.Body><Alert.Close /></Alert>',
    ],
  },

  variants: [
    {
      name: 'Info',
      description: 'Informational context for the user',
      code: `import { Alert } from '@/components/Alert';

<Alert severity="info">
  <Alert.Icon />
  <Alert.Body>
    <Alert.Content>
      Your session will expire in 15 minutes. Save your work to avoid losing changes.
    </Alert.Content>
  </Alert.Body>
</Alert>`,
      render: () => (
        <Alert severity="info">
          <Alert.Icon />
          <Alert.Body>
            <Alert.Content>
              Your session will expire in 15 minutes. Save your work to avoid losing changes.
            </Alert.Content>
          </Alert.Body>
        </Alert>
      ),
    },
    {
      name: 'Success',
      description: 'Positive confirmation of completed action',
      code: `import { Alert } from '@/components/Alert';

<Alert severity="success">
  <Alert.Icon />
  <Alert.Body>
    <Alert.Title>Payment processed</Alert.Title>
    <Alert.Content>
      Your order #12345 has been confirmed. You will receive a confirmation email shortly.
    </Alert.Content>
  </Alert.Body>
</Alert>`,
      render: () => (
        <Alert severity="success">
          <Alert.Icon />
          <Alert.Body>
            <Alert.Title>Payment processed</Alert.Title>
            <Alert.Content>
              Your order #12345 has been confirmed. You will receive a confirmation email shortly.
            </Alert.Content>
          </Alert.Body>
        </Alert>
      ),
    },
    {
      name: 'Warning',
      description: 'Caution about potential issues',
      code: `import { Alert } from '@/components/Alert';

<Alert severity="warning">
  <Alert.Icon />
  <Alert.Body>
    <Alert.Title>Storage almost full</Alert.Title>
    <Alert.Content>
      You have used 90% of your storage quota. Consider deleting unused files.
    </Alert.Content>
  </Alert.Body>
</Alert>`,
      render: () => (
        <Alert severity="warning">
          <Alert.Icon />
          <Alert.Body>
            <Alert.Title>Storage almost full</Alert.Title>
            <Alert.Content>
              You have used 90% of your storage quota. Consider deleting unused files.
            </Alert.Content>
          </Alert.Body>
        </Alert>
      ),
    },
    {
      name: 'Error',
      description: 'Error state requiring user attention',
      code: `import { Alert } from '@/components/Alert';

<Alert severity="error">
  <Alert.Icon />
  <Alert.Body>
    <Alert.Title>Upload failed</Alert.Title>
    <Alert.Content>
      The file could not be uploaded. Check your connection and try again.
    </Alert.Content>
  </Alert.Body>
</Alert>`,
      render: () => (
        <Alert severity="error">
          <Alert.Icon />
          <Alert.Body>
            <Alert.Title>Upload failed</Alert.Title>
            <Alert.Content>
              The file could not be uploaded. Check your connection and try again.
            </Alert.Content>
          </Alert.Body>
        </Alert>
      ),
    },
    {
      name: 'With Action',
      description: 'Alert with an actionable button',
      code: `import { Alert } from '@/components/Alert';

<Alert severity="warning">
  <Alert.Icon />
  <Alert.Body>
    <Alert.Title>Update available</Alert.Title>
    <Alert.Content>
      A new version is available with important security fixes.
    </Alert.Content>
    <Alert.Actions>
      <Alert.Action onClick={() => {}}>Update now</Alert.Action>
    </Alert.Actions>
  </Alert.Body>
</Alert>`,
      render: () => (
        <Alert severity="warning">
          <Alert.Icon />
          <Alert.Body>
            <Alert.Title>Update available</Alert.Title>
            <Alert.Content>
              A new version is available with important security fixes.
            </Alert.Content>
            <Alert.Actions>
              <Alert.Action onClick={() => {}}>Update now</Alert.Action>
            </Alert.Actions>
          </Alert.Body>
        </Alert>
      ),
    },
    {
      name: 'Dismissible',
      description: 'Alert that can be closed by the user',
      code: `import { Alert } from '@/components/Alert';

<Alert severity="info">
  <Alert.Icon />
  <Alert.Body>
    <Alert.Content>
      You can customize your notification preferences in Settings.
    </Alert.Content>
  </Alert.Body>
  <Alert.Close />
</Alert>`,
      render: () => (
        <Alert severity="info">
          <Alert.Icon />
          <Alert.Body>
            <Alert.Content>
              You can customize your notification preferences in Settings.
            </Alert.Content>
          </Alert.Body>
          <Alert.Close />
        </Alert>
      ),
    },
  ],
});
