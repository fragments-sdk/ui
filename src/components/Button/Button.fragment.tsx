import React from 'react';
import { defineSegment } from '@fragments/core';
import { Button } from './index.js';

export default defineSegment({
  component: Button,

  meta: {
    name: 'Button',
    description: 'Interactive element for user actions and form submissions',
    category: 'inputs',
    status: 'stable',
    tags: ['action', 'button', 'form', 'interactive'],
  },

  usage: {
    when: [
      'Triggering an action (save, submit, delete, etc.)',
      'Form submission',
      'Opening dialogs or menus',
      'Navigation when action context is needed',
    ],
    whenNot: [
      'Simple navigation (use Link)',
      'Toggling state (use Switch or Checkbox)',
      'Selecting from options (use Select or RadioGroup)',
    ],
    guidelines: [
      'Use Primary for the main action in a context',
      'Only one Primary button per section/form',
      'Use Danger variant for destructive actions',
      'Loading state should disable the button',
    ],
    accessibility: [
      'Button text should describe the action',
      'Avoid generic labels like "Click here"',
      'Icon-only buttons need aria-label',
    ],
  },

  props: {
    children: {
      type: 'node',
      required: true,
      description: 'Button label content',
    },
    variant: {
      type: 'enum',
      values: ['primary', 'secondary', 'ghost', 'danger'],
      default: 'primary',
      description: 'Visual style variant',
      constraints: ['Only one primary button per context'],
    },
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: 'Button size',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Whether the button is disabled',
    },
    onClick: {
      type: 'function',
      description: 'Click handler',
    },
    type: {
      type: 'enum',
      values: ['button', 'submit', 'reset'],
      default: 'button',
      description: 'HTML button type attribute',
    },
  },

  relations: [
    {
      component: 'Link',
      relationship: 'alternative',
      note: 'Use Link for navigation without action context',
    },
    {
      component: 'IconButton',
      relationship: 'alternative',
      note: 'Use IconButton for icon-only actions',
    },
    {
      component: 'ButtonGroup',
      relationship: 'parent',
      note: 'Use ButtonGroup for related action sets',
    },
  ],

  contract: {
    propsSummary: [
      'variant: primary|secondary|ghost|danger (default: primary)',
      'size: sm|md|lg (default: md)',
      'disabled: boolean - disables interaction',
      'type: button|submit|reset (default: button)',
      'onClick: () => void - action handler',
    ],
    scenarioTags: [
      'form.submit',
      'action.primary',
      'action.secondary',
      'action.destructive',
    ],
    a11yRules: [
      'A11Y_BTN_LABEL',
      'A11Y_BTN_FOCUS',
    ],
    bans: [
      {
        pattern: '<button.*click here',
        message: 'Use descriptive button text instead of "click here"',
      },
    ],
  },

  variants: [
    {
      name: 'Primary',
      description: 'Default action button for primary actions',
      render: () => <Button variant="primary">Save Changes</Button>,
    },
    {
      name: 'Secondary',
      description: 'Less prominent action button',
      render: () => <Button variant="secondary">Cancel</Button>,
    },
    {
      name: 'Ghost',
      description: 'Minimal visual weight for subtle actions',
      render: () => <Button variant="ghost">Learn More</Button>,
    },
    {
      name: 'Danger',
      description: 'Destructive action requiring attention',
      render: () => <Button variant="danger">Delete Item</Button>,
    },
    {
      name: 'Sizes',
      description: 'Available size options',
      render: () => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      ),
    },
    {
      name: 'Disabled',
      description: 'Non-interactive state',
      render: () => <Button disabled>Cannot Click</Button>,
    },
  ],
});
