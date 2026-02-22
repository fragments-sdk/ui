import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Toast, ToastProvider, useToast } from '.';

// Demo component that triggers toasts
function ToastDemo() {
  const { success, error, warning, info } = useToast();

  return (
    <div style={{ display: 'flex', gap: 'var(--fui-space-1)', flexWrap: 'wrap' }}>
      <button
        onClick={() => success({ title: 'Success!', description: 'Your changes have been saved.', id: 'save-success' })}
        style={{ padding: 'var(--fui-space-1) var(--fui-space-2)', borderRadius: 'var(--fui-radius-md)', border: '1px solid var(--fui-color-success)', background: 'var(--fui-color-success-bg)', color: 'var(--fui-color-success)', cursor: 'pointer' }}
      >
        Success Toast
      </button>
      <button
        onClick={() => error('Error', 'Something went wrong. Please try again.')}
        style={{ padding: 'var(--fui-space-1) var(--fui-space-2)', borderRadius: 'var(--fui-radius-md)', border: '1px solid var(--fui-color-danger)', background: 'var(--fui-color-danger-bg)', color: 'var(--fui-color-danger)', cursor: 'pointer' }}
      >
        Error Toast
      </button>
      <button
        onClick={() => warning('Warning', 'This action cannot be undone.')}
        style={{ padding: 'var(--fui-space-1) var(--fui-space-2)', borderRadius: 'var(--fui-radius-md)', border: '1px solid var(--fui-color-warning)', background: 'var(--fui-color-warning-bg)', color: 'var(--fui-color-warning)', cursor: 'pointer' }}
      >
        Warning Toast
      </button>
      <button
        onClick={() => info('Info', 'New features are available.')}
        style={{ padding: 'var(--fui-space-1) var(--fui-space-2)', borderRadius: 'var(--fui-radius-md)', border: '1px solid var(--fui-color-info)', background: 'var(--fui-color-info-bg)', color: 'var(--fui-color-info)', cursor: 'pointer' }}
      >
        Info Toast
      </button>
    </div>
  );
}

// Wrapped demo with provider
function ToastDemoWrapper() {
  return (
    <ToastProvider position="bottom-right" duration={5000}>
      <ToastDemo />
    </ToastProvider>
  );
}

export default defineFragment({
  component: Toast,

  meta: {
    name: 'Toast',
    description: 'Brief, non-blocking notification messages',
    category: 'feedback',
    status: 'stable',
    tags: ['notification', 'alert', 'message', 'feedback'],
  },

  usage: {
    when: [
      'Providing feedback after an action',
      'Showing success/error status of operations',
      'Non-critical information that doesn\'t require action',
      'Temporary messages that auto-dismiss',
    ],
    whenNot: [
      'Critical errors requiring user action (use Dialog)',
      'Persistent information (use Alert)',
      'Inline validation (use form error states)',
      'System-wide announcements (use Banner)',
    ],
    guidelines: [
      'Keep messages brief and actionable',
      'Use appropriate variant for the message type',
      'Auto-dismiss after reasonable duration (3-5s)',
      'Allow manual dismissal for longer messages',
      'Limit number of simultaneous toasts',
      'useToast() variant helpers accept either (title, description?) or an options object for action/duration/id',
    ],
    accessibility: [
      'Use role="alert" for important messages',
      'Ensure sufficient display time for reading',
      'Don\'t rely solely on color for meaning',
      'Provide dismiss button with accessible label',
    ],
  },

  props: {
    title: {
      type: 'string',
      description: 'Toast title',
    },
    description: {
      type: 'string',
      description: 'Additional message content',
    },
    variant: {
      type: 'enum',
      values: ['default', 'success', 'error', 'warning', 'info'],
      default: 'default',
      description: 'Visual variant indicating message type',
    },
    duration: {
      type: 'number',
      default: 5000,
      description: 'Auto-dismiss duration in ms (0 = no auto-dismiss)',
    },
    action: {
      type: 'object',
      description: 'Optional action button { label, onClick }',
    },
    onDismiss: {
      type: 'function',
      description: 'Callback when toast should be dismissed',
    },
    onPause: {
      type: 'function',
      description: 'Callback when auto-dismiss timer should pause',
    },
    onResume: {
      type: 'function',
      description: 'Callback when auto-dismiss timer should resume',
    },
  },

  relations: [
    {
      component: 'Alert',
      relationship: 'alternative',
      note: 'Use Alert for persistent inline messages',
    },
    {
      component: 'Dialog',
      relationship: 'alternative',
      note: 'Use Dialog for messages requiring user action',
    },
  ],

  contract: {
    propsSummary: [
      'title: string - toast title',
      'description: string - additional message',
      'variant: default|success|error|warning|info',
      'duration: number - ms before auto-dismiss',
      'action: { label, onClick } - optional action',
      'ToastInput (useToast): optional id for deterministic creation/replacement flows',
      'useToast().success/error/warning/info: (title, description?) or ({ title, description, action, duration, id })',
    ],
    scenarioTags: [
      'feedback.success',
      'feedback.error',
      'feedback.notification',
    ],
    a11yRules: [
      'A11Y_ALERT_ROLE',
      'A11Y_TARGET_SIZE_MIN',
    ],
    bans: [],
  },

  variants: [
    {
      name: 'Default',
      description: 'Interactive toast demo - click buttons to trigger toasts (includes helper object syntax example)',
      render: () => <ToastDemoWrapper />,
    },
    {
      name: 'Success',
      description: 'Success message variant',
      render: () => (
        <Toast
          title="Success!"
          description="Your changes have been saved."
          variant="success"
        />
      ),
    },
    {
      name: 'Error',
      description: 'Error message variant',
      render: () => (
        <Toast
          title="Error"
          description="Failed to save changes. Please try again."
          variant="error"
        />
      ),
    },
    {
      name: 'Warning',
      description: 'Warning message variant',
      render: () => (
        <Toast
          title="Warning"
          description="This action cannot be undone."
          variant="warning"
        />
      ),
    },
    {
      name: 'Info',
      description: 'Informational message variant',
      render: () => (
        <Toast
          title="New Update"
          description="Version 2.0 is now available."
          variant="info"
        />
      ),
    },
    {
      name: 'With Action',
      description: 'Toast with an action button',
      render: () => (
        <Toast
          title="File deleted"
          description="The file has been moved to trash."
          action={{
            label: 'Undo',
            onClick: () => console.log('Undo clicked'),
          }}
        />
      ),
    },
  ],
});
