import React, { useState } from 'react';
import { defineSegment } from '@fragments/core';
import { Toggle } from './index.js';

// Stateful wrapper for interactive demos
function StatefulToggle(props: React.ComponentProps<typeof Toggle>) {
  const [checked, setChecked] = useState(props.checked ?? false);
  return <Toggle {...props} checked={checked} onChange={setChecked} />;
}

export default defineSegment({
  component: Toggle,

  meta: {
    name: 'Toggle',
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
      'Toggle should always have a visible label explaining what it controls',
      'The "on" state should be the positive/enabling action',
      'Changes should take effect immediately - no save button needed',
      'Include a description for toggles whose effect isn\'t obvious from the label',
      'Group related toggles visually in settings panels',
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
      description: 'Whether the toggle is in the on state',
      default: 'false',
    },
    onChange: {
      type: 'function',
      description: 'Callback with new checked state: (checked: boolean) => void',
    },
    label: {
      type: 'string',
      description: 'Visible label text',
    },
    description: {
      type: 'string',
      description: 'Helper text shown below the label',
    },
    disabled: {
      type: 'boolean',
      description: 'Whether the toggle is non-interactive',
      default: 'false',
    },
    size: {
      type: 'enum',
      description: 'Toggle track size',
      values: ['sm', 'md'],
      default: 'md',
    },
  },

  relations: [
    { component: 'Input', relationship: 'sibling', note: 'Input handles text/number entry; Toggle handles boolean state' },
    { component: 'Checkbox', relationship: 'alternative', note: 'Use Checkbox when change requires form submission' },
  ],

  contract: {
    propsSummary: [
      'checked: boolean - on/off state',
      'onChange: (checked) => void - state change handler',
      'label: string - visible label text',
      'description: string - helper text below label',
      'disabled: boolean - non-interactive state',
      'size: sm|md - toggle size',
    ],
    scenarioTags: [
      'form.boolean',
      'settings.toggle',
      'settings.preference',
      'form.switch',
    ],
    a11yRules: ['A11Y_SWITCH_ROLE', 'A11Y_SWITCH_LABEL', 'A11Y_SWITCH_FOCUS'],
  },

  variants: [
    {
      name: 'Default Off',
      description: 'Toggle in the off state',
      render: () => <StatefulToggle label="Email notifications" />,
      args: { label: 'Email notifications' },
    },
    {
      name: 'Checked',
      description: 'Toggle in the on state',
      render: () => <StatefulToggle checked label="Dark mode" />,
      args: { checked: true, label: 'Dark mode' },
    },
    {
      name: 'With Description',
      description: 'Toggle with explanatory helper text',
      render: () => (
        <StatefulToggle
          checked
          label="Auto-save"
          description="Automatically save changes as you type"
        />
      ),
      args: { checked: true, label: 'Auto-save', description: 'Automatically save changes as you type' },
    },
    {
      name: 'Small Size',
      description: 'Compact toggle for dense settings panels',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatefulToggle size="sm" checked label="Show line numbers" />
          <StatefulToggle size="sm" label="Word wrap" />
          <StatefulToggle size="sm" checked label="Minimap" />
        </div>
      ),
    },
    {
      name: 'Disabled States',
      description: 'Non-interactive toggles showing both states',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Toggle disabled label="Premium feature (upgrade required)" />
          <Toggle disabled checked label="System managed (read-only)" />
        </div>
      ),
    },
    {
      name: 'Settings Panel',
      description: 'Multiple toggles in a realistic settings layout',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px' }}>
          <StatefulToggle
            checked
            label="Push notifications"
            description="Receive push notifications on your device"
          />
          <StatefulToggle
            checked
            label="Email digest"
            description="Weekly summary of your activity"
          />
          <StatefulToggle
            label="Marketing emails"
            description="Product updates and promotional offers"
          />
        </div>
      ),
    },
  ],
});
