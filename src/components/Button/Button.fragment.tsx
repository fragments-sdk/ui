import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Button } from '.';

export default defineFragment({
  component: Button,

  meta: {
    name: 'Button',
    description: 'Interactive element for user actions and form submissions',
    category: 'forms',
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
      values: ['primary', 'secondary', 'ghost', 'danger', 'outlined', 'outline'],
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
    as: {
      type: 'enum',
      values: ['button', 'a'],
      default: 'button',
      description: 'Render as a native button or anchor element',
    },
    asChild: {
      type: 'boolean',
      default: 'false',
      description: 'Merge button styling onto child element (e.g. Next.js Link)',
    },
    icon: {
      type: 'boolean',
      default: 'false',
      description: 'Render as icon-only button (square aspect ratio)',
    },
    fullWidth: {
      type: 'boolean',
      default: 'false',
      description: 'Make button full width of container',
    },
  },

  relations: [
    {
      component: 'Link',
      relationship: 'alternative',
      note: 'Use Link for navigation without action context',
    },
    {
      component: 'Icon',
      relationship: 'complementary',
      note: 'Use Icon inside Button for icon-leading/trailing or icon-only actions',
    },
    {
      component: 'ButtonGroup',
      relationship: 'parent',
      note: 'Use ButtonGroup for related action sets',
    },
  ],

  contract: {
    propsSummary: [
      'variant: primary|secondary|ghost|danger|outlined|outline (default: primary)',
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
      name: 'Outline',
      description: 'Bordered button with transparent background',
      render: () => <Button variant="outline">View Details</Button>,
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
