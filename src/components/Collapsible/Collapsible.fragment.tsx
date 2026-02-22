import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Collapsible } from '.';

export default defineFragment({
  component: Collapsible,

  meta: {
    name: 'Collapsible',
    description: 'An interactive component that expands/collapses to show or hide content',
    category: 'layout',
    status: 'stable',
    tags: ['collapsible', 'expandable', 'accordion', 'disclosure', 'toggle'],
  },

  usage: {
    when: [
      'Showing/hiding additional content on demand',
      'Building accordions or expandable sections',
      'Collapsible navigation sections',
      'FAQ sections with expandable answers',
      'Settings panels with grouped options',
    ],
    whenNot: [
      'Single item disclosure (use Accordion instead)',
      'Navigation menus with complex interactions (use Menu)',
      'Modal or overlay content (use Dialog or Popover)',
    ],
    guidelines: [
      'Use clear trigger labels that indicate expandable content',
      'Consider defaultOpen for primary content users often need',
      'Keep trigger text concise but descriptive',
      'Use chevron icons consistently to indicate collapsible state',
    ],
    accessibility: [
      'Trigger must have aria-expanded to indicate state',
      'Content region needs aria-labelledby pointing to trigger',
      'Keyboard: Enter/Space toggles open state',
      'Focus should remain on trigger after toggle',
    ],
  },

  props: {
    defaultOpen: {
      type: 'boolean',
      default: false,
      description: 'Whether the collapsible is initially open (uncontrolled)',
    },
    open: {
      type: 'boolean',
      description: 'Controlled open state',
    },
    onOpenChange: {
      type: 'function',
      description: 'Callback when open state changes - (open: boolean) => void',
    },
    disabled: {
      type: 'boolean',
      default: false,
      description: 'Whether the collapsible is disabled',
    },
    children: {
      type: 'node',
      required: true,
      description: 'Collapsible.Trigger and Collapsible.Content components',
    },
  },

  relations: [
    {
      component: 'Accordion',
      relationship: 'alternative',
      note: 'Use Accordion for multiple exclusive collapsible sections',
    },
    {
      component: 'Sidebar',
      relationship: 'used-by',
      note: 'Sidebar uses Collapsible for section expand/collapse',
    },
    {
      component: 'Menu',
      relationship: 'alternative',
      note: 'Use Menu for dropdown navigation with actions',
    },
  ],

  contract: {
    propsSummary: [
      'defaultOpen: boolean - initial open state (default: false)',
      'open: boolean - controlled open state',
      'onOpenChange: (open: boolean) => void - state change callback',
      'disabled: boolean - prevents interaction',
    ],
    scenarioTags: [
      'disclosure.expandable',
      'navigation.collapsible',
      'content.toggle',
    ],
    a11yRules: [
      'A11Y_EXPANDED_STATE',
      'A11Y_REGION_LABEL',
      'A11Y_KEYBOARD_NAV',
    ],
    bans: [],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic collapsible with trigger and content',
      render: () => (
        <Collapsible>
          <Collapsible.Trigger>Click to expand</Collapsible.Trigger>
          <Collapsible.Content>
            <p>This content is hidden by default and revealed when the trigger is clicked.</p>
          </Collapsible.Content>
        </Collapsible>
      ),
    },
    {
      name: 'Default Open',
      description: 'Collapsible that starts in the expanded state',
      render: () => (
        <Collapsible defaultOpen>
          <Collapsible.Trigger>Section Title</Collapsible.Trigger>
          <Collapsible.Content>
            <p>This content is visible by default. Click the trigger to collapse.</p>
          </Collapsible.Content>
        </Collapsible>
      ),
    },
    {
      name: 'Chevron Start',
      description: 'Collapsible with chevron icon on the left',
      render: () => (
        <Collapsible>
          <Collapsible.Trigger chevronPosition="start">Navigation</Collapsible.Trigger>
          <Collapsible.Content>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>Dashboard</li>
              <li>Settings</li>
              <li>Profile</li>
            </ul>
          </Collapsible.Content>
        </Collapsible>
      ),
    },
    {
      name: 'No Chevron',
      description: 'Collapsible without chevron indicator',
      render: () => (
        <Collapsible>
          <Collapsible.Trigger showChevron={false}>Show more details</Collapsible.Trigger>
          <Collapsible.Content>
            <p>Hidden details that appear when triggered.</p>
          </Collapsible.Content>
        </Collapsible>
      ),
    },
    {
      name: 'Disabled',
      description: 'Collapsible in disabled state',
      render: () => (
        <Collapsible disabled>
          <Collapsible.Trigger>Cannot toggle (disabled)</Collapsible.Trigger>
          <Collapsible.Content>
            <p>This content cannot be shown because the collapsible is disabled.</p>
          </Collapsible.Content>
        </Collapsible>
      ),
    },
    {
      name: 'Multiple Sections',
      description: 'Multiple independent collapsible sections',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Collapsible defaultOpen>
            <Collapsible.Trigger>Getting Started</Collapsible.Trigger>
            <Collapsible.Content>
              <p>Introduction and setup instructions.</p>
            </Collapsible.Content>
          </Collapsible>
          <Collapsible>
            <Collapsible.Trigger>Advanced Usage</Collapsible.Trigger>
            <Collapsible.Content>
              <p>Advanced configuration options.</p>
            </Collapsible.Content>
          </Collapsible>
          <Collapsible>
            <Collapsible.Trigger>API Reference</Collapsible.Trigger>
            <Collapsible.Content>
              <p>Complete API documentation.</p>
            </Collapsible.Content>
          </Collapsible>
        </div>
      ),
    },
  ],
});
