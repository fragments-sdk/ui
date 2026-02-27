import React, { useState } from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Switch } from '.';

// Stateful wrapper for interactive demos
function StatefulSwitch(props: React.ComponentProps<typeof Switch>) {
  const [checked, setChecked] = useState(props.checked ?? false);
  return <Switch {...props} checked={checked} onChange={setChecked} />;
}

export default defineFragment({
  component: Switch,

  meta: {
    name: 'Switch',
    description: 'Binary on/off switch for settings and preferences. Provides immediate visual feedback and is ideal for options that take effect instantly.',
    category: 'forms',
    status: 'stable',
    tags: ['switch', 'toggle', 'boolean', 'settings', 'preference'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Binary settings that take effect immediately (e.g., dark mode, notifications)',
      'Enabling/disabling features in a settings panel',
      'Options where the result is immediately visible',
      'Mobile-friendly boolean inputs',
    ],
    whenNot: [
      'Multiple options in a group (use checkbox group)',
      'Selection requires form submission to take effect (use checkbox)',
      'Yes/No questions in forms (use radio buttons)',
      'Complex multi-state options (use select or radio)',
    ],
    guidelines: [
      'Switch should always have a visible label explaining what it controls',
      'The "on" state should be the positive/enabling action',
      'Changes should take effect immediately - no save button needed',
      'Include helperText for switches whose effect isn\'t obvious from the label',
      'Group related switches visually in settings panels',
    ],
    accessibility: [
      'Uses role="switch" with aria-checked for proper semantics',
      'Must have an accessible label (visible or aria-label)',
      'Focus indicator must be clearly visible',
      'State change must be announced by screen readers',
    ],
  },

  props: {
    checked: {
      type: 'boolean',
      description: 'Whether the switch is in the on state',
      default: 'false',
    },
    onChange: {
      type: 'function',
      description: 'Callback with new checked state: (checked: boolean) => void',
    },
    onCheckedChange: {
      type: 'function',
      description: 'Alias for onChange (Radix convention): (checked: boolean) => void',
    },
    label: {
      type: 'string',
      description: 'Visible label text',
    },
    helperText: {
      type: 'string',
      description: 'Helper text shown below the label (preferred)',
    },
    description: {
      type: 'string',
      description: 'Deprecated alias for helperText',
    },
    disabled: {
      type: 'boolean',
      description: 'Whether the switch is non-interactive',
      default: 'false',
    },
    size: {
      type: 'enum',
      description: 'Switch track size',
      values: ['sm', 'md'],
      default: 'md',
    },
  },

  relations: [
    { component: 'Input', relationship: 'sibling', note: 'Input handles text/number entry; Switch handles boolean state' },
    { component: 'Checkbox', relationship: 'alternative', note: 'Use Checkbox when change requires form submission' },
  ],

  contract: {
    propsSummary: [
      'checked: boolean - on/off state',
      'onChange: (checked) => void - state change handler (or onCheckedChange)',
      'label: string - visible label text',
      'helperText: string - helper text below label (preferred)',
      'description: string - deprecated alias for helperText',
      'disabled: boolean - non-interactive state',
      'size: sm|md - switch size',
    ],
    scenarioTags: [
      'form.boolean',
      'settings.switch',
      'settings.preference',
      'form.switch',
    ],
    a11yRules: ['A11Y_SWITCH_ROLE', 'A11Y_SWITCH_LABEL', 'A11Y_SWITCH_FOCUS', 'A11Y_TARGET_SIZE_MIN'],
  },

  variants: [
    {
      name: 'Default Off',
      description: 'Switch in the off state',
      render: () => <StatefulSwitch label="Email notifications" />,
      args: { label: 'Email notifications' },
    },
    {
      name: 'Checked',
      description: 'Switch in the on state',
      render: () => <StatefulSwitch checked label="Dark mode" />,
      args: { checked: true, label: 'Dark mode' },
    },
    {
      name: 'With Helper Text',
      description: 'Switch with explanatory helper text',
      render: () => (
        <StatefulSwitch
          checked
          label="Auto-save"
          helperText="Automatically save changes as you type"
        />
      ),
      args: { checked: true, label: 'Auto-save', helperText: 'Automatically save changes as you type' },
    },
    {
      name: 'Small Size',
      description: 'Compact switch for dense settings panels',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatefulSwitch size="sm" checked label="Show line numbers" />
          <StatefulSwitch size="sm" label="Word wrap" />
          <StatefulSwitch size="sm" checked label="Minimap" />
        </div>
      ),
    },
    {
      name: 'Disabled States',
      description: 'Non-interactive switches showing both states',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Switch disabled label="Premium feature (upgrade required)" />
          <Switch disabled checked label="System managed (read-only)" />
        </div>
      ),
    },
    {
      name: 'Settings Panel',
      description: 'Multiple switches in a realistic settings layout',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px' }}>
          <StatefulSwitch
            checked
            label="Push notifications"
            helperText="Receive push notifications on your device"
          />
          <StatefulSwitch
            checked
            label="Email digest"
            helperText="Weekly summary of your activity"
          />
          <StatefulSwitch
            label="Marketing emails"
            helperText="Product updates and promotional offers"
          />
        </div>
      ),
    },
  ],
});
