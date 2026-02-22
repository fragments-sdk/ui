import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Tabs } from '.';

export default defineFragment({
  component: Tabs,

  meta: {
    name: 'Tabs',
    description: 'Organize content into switchable panels. Use for related content that benefits from a compact, navigable layout.',
    category: 'navigation',
    status: 'stable',
    tags: ['tabs', 'navigation', 'panels', 'content-switcher'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Organizing related content into sections',
      'Reducing page scrolling by grouping content',
      'Settings pages with multiple categories',
      'Dashboard views with different data perspectives',
    ],
    whenNot: [
      'Primary navigation (use sidebar or header nav)',
      'Sequential steps (use Stepper or wizard)',
      'Comparing content side-by-side',
      'Very long lists of options (use Select or Menu)',
    ],
    guidelines: [
      'Keep tab labels short (1-2 words)',
      'Order tabs by usage frequency or logical sequence',
      'Avoid more than 5-6 tabs; consider sub-navigation for more',
      'Tab content should be roughly equivalent in scope',
      'Use pills variant for contained sections, underline for page-level tabs',
    ],
    accessibility: [
      'Keyboard navigation with arrow keys',
      'Tab panels are properly labeled',
      'Focus management follows WAI-ARIA tabs pattern',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Tab list and panels (use Tabs.List, Tabs.Tab, Tabs.Panel)',
      required: true,
    },
    defaultValue: {
      type: 'string',
      description: 'Initially active tab (uncontrolled)',
    },
    value: {
      type: 'string',
      description: 'Controlled active tab value',
    },
    onValueChange: {
      type: 'function',
      description: 'Called when active tab changes',
    },
    orientation: {
      type: 'enum',
      description: 'Tab list orientation',
      values: ['horizontal', 'vertical'],
      default: 'horizontal',
    },
    variant: {
      type: 'enum',
      description: 'Default visual style for Tabs.List (can be overridden on Tabs.List)',
      values: ['underline', 'pills'],
      default: 'underline',
    },
  },

  relations: [
    { component: 'Select', relationship: 'alternative', note: 'Use Select for many options in compact space' },
    { component: 'Menu', relationship: 'alternative', note: 'Use Menu for action-based navigation' },
  ],

  contract: {
    propsSummary: [
      'value: string - controlled active tab',
      'defaultValue: string - initial active tab',
      'onValueChange: (value) => void - tab change handler',
      'variant: underline|pills - default style for Tabs.List',
      'Tabs.List variant?: underline|pills - optional per-list override',
    ],
    scenarioTags: [
      'navigation.tabs',
      'layout.panels',
      'content.sections',
    ],
    a11yRules: ['A11Y_TABS_KEYBOARD', 'A11Y_TABS_LABELS'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['List', 'Tab', 'Panel'],
    requiredChildren: ['List', 'Panel'],
    commonPatterns: [
      '<Tabs defaultValue="tab1"><Tabs.List><Tabs.Tab value="tab1">{label1}</Tabs.Tab><Tabs.Tab value="tab2">{label2}</Tabs.Tab></Tabs.List><Tabs.Panel value="tab1">{content1}</Tabs.Panel><Tabs.Panel value="tab2">{content2}</Tabs.Panel></Tabs>',
    ],
  },

  variants: [
    {
      name: 'Underline',
      description: 'Default underline style tabs',
      render: () => (
        <Tabs defaultValue="overview" variant="underline">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="analytics">Analytics</Tabs.Tab>
            <Tabs.Tab value="settings">Settings</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="overview">
            <p>Overview content goes here.</p>
          </Tabs.Panel>
          <Tabs.Panel value="analytics">
            <p>Analytics content goes here.</p>
          </Tabs.Panel>
          <Tabs.Panel value="settings">
            <p>Settings content goes here.</p>
          </Tabs.Panel>
        </Tabs>
      ),
    },
    {
      name: 'Pills',
      description: 'Pill-style tabs for contained sections',
      render: () => (
        <Tabs defaultValue="all" variant="pills">
          <Tabs.List>
            <Tabs.Tab value="all">All</Tabs.Tab>
            <Tabs.Tab value="active">Active</Tabs.Tab>
            <Tabs.Tab value="archived">Archived</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="all">
            <p>Showing all items.</p>
          </Tabs.Panel>
          <Tabs.Panel value="active">
            <p>Showing active items only.</p>
          </Tabs.Panel>
          <Tabs.Panel value="archived">
            <p>Showing archived items.</p>
          </Tabs.Panel>
        </Tabs>
      ),
    },
    {
      name: 'With Disabled',
      description: 'Tabs with a disabled option',
      render: () => (
        <Tabs defaultValue="general" variant="underline">
          <Tabs.List>
            <Tabs.Tab value="general">General</Tabs.Tab>
            <Tabs.Tab value="security">Security</Tabs.Tab>
            <Tabs.Tab value="billing" disabled>Billing</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="general">
            <p>General settings panel.</p>
          </Tabs.Panel>
          <Tabs.Panel value="security">
            <p>Security settings panel.</p>
          </Tabs.Panel>
        </Tabs>
      ),
    },
    {
      name: 'List Variant Override',
      description: 'Tabs sets a default variant, and Tabs.List can override it per list',
      render: () => (
        <Tabs defaultValue="overview" variant="pills">
          <Tabs.List variant="underline">
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="activity">Activity</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="overview">
            <p>Root sets pills, but this list overrides to underline.</p>
          </Tabs.Panel>
          <Tabs.Panel value="activity">
            <p>Per-list variant override example.</p>
          </Tabs.Panel>
        </Tabs>
      ),
    },
  ],
});
