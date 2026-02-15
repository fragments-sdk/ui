import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Listbox } from '.';

export default defineFragment({
  component: Listbox,

  meta: {
    name: 'Listbox',
    description: 'Controlled listbox for search results, autocomplete dropdowns, and command menus. Provides Menu-like styling without requiring a trigger.',
    category: 'forms',
    status: 'stable',
    tags: ['listbox', 'search', 'autocomplete', 'combobox', 'command', 'dropdown'],
    since: '0.3.0',
  },

  usage: {
    when: [
      'Search result dropdowns',
      'Autocomplete suggestions',
      'Command palette results',
      'Keyboard-navigable option lists',
    ],
    whenNot: [
      'Static lists without selection (use List)',
      'Action menus with trigger button (use Menu)',
      'Form field selection (use Select)',
      'Navigation menus (use Sidebar or Tabs)',
    ],
    guidelines: [
      'Control open/close state externally based on input focus or query',
      'Implement keyboard navigation (arrow keys, enter, escape) in parent',
      'Use Listbox.Empty for no results state',
      'Group related items with Listbox.Group when appropriate',
    ],
    accessibility: [
      'Uses listbox and option ARIA roles',
      'aria-selected indicates current selection',
      'aria-disabled for non-interactive items',
      'Connect to input with aria-controls for full combobox pattern',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Listbox.Item, Listbox.Group, or Listbox.Empty components',
      required: true,
    },
  },

  relations: [
    { component: 'Input', relationship: 'sibling', note: 'Pair with Input for search/autocomplete patterns' },
    { component: 'Menu', relationship: 'alternative', note: 'Use Menu when you need a trigger button' },
    { component: 'Select', relationship: 'alternative', note: 'Use Select for form field selection' },
    { component: 'List', relationship: 'alternative', note: 'Use List for static, non-interactive lists' },
  ],

  contract: {
    propsSummary: [
      'children: ReactNode - Listbox.Item components (required)',
      'aria-label: string - accessible label',
      'Listbox.Item selected: boolean - highlight state',
      'Listbox.Item disabled: boolean - non-interactive',
    ],
    subComponents: [
      {
        name: 'Listbox.Item',
        props: [
          'children: ReactNode - item content',
          'selected: boolean - highlight/selected state',
          'disabled: boolean - non-interactive',
          'onClick: () => void - click handler',
          'onMouseEnter: () => void - hover handler',
        ],
      },
      {
        name: 'Listbox.Group',
        props: [
          'children: ReactNode - grouped items',
          'label: string - group heading',
        ],
      },
      {
        name: 'Listbox.Empty',
        props: [
          'children: ReactNode - empty state message',
        ],
      },
    ],
    scenarioTags: [
      'form.search',
      'form.autocomplete',
      'action.command',
      'display.results',
    ],
    a11yRules: ['A11Y_LISTBOX_ROLE', 'A11Y_OPTION_ROLE'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Item', 'Group', 'Empty'],
    requiredChildren: ['Item'],
    commonPatterns: [
      '<Listbox aria-label="Search results">{results.map(item => <Listbox.Item key={item.id} selected={item.id === selectedId} onClick={() => onSelect(item)}>{item.label}</Listbox.Item>)}</Listbox>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic listbox with selectable items',
      render: () => (
        <Listbox aria-label="Options">
          <Listbox.Item selected>First option</Listbox.Item>
          <Listbox.Item>Second option</Listbox.Item>
          <Listbox.Item>Third option</Listbox.Item>
        </Listbox>
      ),
    },
    {
      name: 'Search Results',
      description: 'Typical search results pattern with label and metadata',
      render: () => (
        <Listbox aria-label="Search results">
          <Listbox.Item selected>
            <span style={{ fontWeight: 500 }}>Button</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--fui-text-tertiary)' }}>Components</span>
          </Listbox.Item>
          <Listbox.Item>
            <span style={{ fontWeight: 500 }}>Badge</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--fui-text-tertiary)' }}>Components</span>
          </Listbox.Item>
          <Listbox.Item>
            <span style={{ fontWeight: 500 }}>Box</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--fui-text-tertiary)' }}>Layout</span>
          </Listbox.Item>
        </Listbox>
      ),
    },
    {
      name: 'With Groups',
      description: 'Grouped items with labels',
      render: () => (
        <Listbox aria-label="Commands">
          <Listbox.Group label="Recent">
            <Listbox.Item selected>Open file...</Listbox.Item>
            <Listbox.Item>Save as...</Listbox.Item>
          </Listbox.Group>
          <Listbox.Group label="Actions">
            <Listbox.Item>Copy</Listbox.Item>
            <Listbox.Item>Paste</Listbox.Item>
            <Listbox.Item disabled>Cut</Listbox.Item>
          </Listbox.Group>
        </Listbox>
      ),
    },
    {
      name: 'Empty State',
      description: 'No results found message',
      render: () => (
        <Listbox aria-label="Search results">
          <Listbox.Empty>No results found</Listbox.Empty>
        </Listbox>
      ),
    },
    {
      name: 'With Disabled Items',
      description: 'Mix of enabled and disabled items',
      render: () => (
        <Listbox aria-label="Options">
          <Listbox.Item>Available option</Listbox.Item>
          <Listbox.Item disabled>Disabled option</Listbox.Item>
          <Listbox.Item>Another option</Listbox.Item>
        </Listbox>
      ),
    },
  ],
});
