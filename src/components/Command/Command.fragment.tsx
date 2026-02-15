import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Command } from '.';
import { Dialog } from '../Dialog';
import { Button } from '../Button';

export default defineFragment({
  component: Command,

  meta: {
    name: 'Command',
    description: 'A searchable command palette for quick actions. Combines an input with a filterable, keyboard-navigable list of actions.',
    category: 'navigation',
    status: 'stable',
    tags: ['command', 'palette', 'search', 'spotlight', 'quick-actions', 'cmdk'],
    since: '0.8.2',
  },

  usage: {
    when: [
      'Quick-access command palettes (Ctrl+K)',
      'Searchable action menus',
      'Inline command lists with filtering',
      'Application-wide search interfaces',
    ],
    whenNot: [
      'Simple dropdown menus (use Menu)',
      'Form field selection (use Select or Combobox)',
      'Static navigation (use Sidebar or Tabs)',
      'Search with complex result types (build custom)',
    ],
    guidelines: [
      'Compose inside Dialog for modal command palette usage',
      'Use Command.Group to organize items by category',
      'Provide Command.Empty for no-results feedback',
      'Use keywords prop for items that should match on aliases',
      'Keep item labels short and action-oriented',
    ],
    accessibility: [
      'Uses combobox + listbox ARIA pattern',
      'Keyboard navigation with ArrowUp/ArrowDown, Enter to select',
      'Home/End jump to first/last item',
      'aria-activedescendant tracks focused item',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Command.Input, Command.List, and other sub-components',
      required: true,
    },
    search: {
      type: 'string',
      description: 'Controlled search value',
    },
    defaultSearch: {
      type: 'string',
      description: 'Default search value (uncontrolled)',
      default: "''",
    },
    onSearchChange: {
      type: 'function',
      description: 'Called when search input changes',
    },
    filter: {
      type: 'function',
      description: 'Custom filter function. Return 0 to hide, >0 to show.',
    },
    loop: {
      type: 'boolean',
      description: 'Whether to loop keyboard navigation',
      default: 'true',
    },
  },

  relations: [
    { component: 'Dialog', relationship: 'sibling', note: 'Compose inside Dialog for modal command palette' },
    { component: 'Listbox', relationship: 'sibling', note: 'Command uses Listbox-like keyboard navigation internally' },
    { component: 'Combobox', relationship: 'alternative', note: 'Use Combobox for form field selection with search' },
  ],

  contract: {
    propsSummary: [
      'search: string - controlled search value',
      'onSearchChange: (search) => void - search change handler',
      'filter: (value, search, keywords?) => number - custom filter',
      'loop: boolean - loop keyboard navigation (default: true)',
      'Command.Item value: string - filter match value',
      'Command.Item keywords: string[] - extra filter terms',
      'Command.Item onItemSelect: () => void - selection handler',
    ],
    subComponents: [
      {
        name: 'Command.Input',
        props: ['placeholder: string', 'className: string'],
      },
      {
        name: 'Command.List',
        props: ['children: ReactNode'],
      },
      {
        name: 'Command.Item',
        props: [
          'value: string - filter value',
          'keywords: string[] - extra keywords',
          'disabled: boolean',
          'onItemSelect: () => void',
        ],
      },
      {
        name: 'Command.Group',
        props: ['heading: string - group label', 'children: ReactNode'],
      },
      {
        name: 'Command.Empty',
        props: ['children: ReactNode - empty state message'],
      },
      {
        name: 'Command.Separator',
        props: [],
      },
    ],
    scenarioTags: [
      'navigation.command',
      'search.palette',
      'action.quick',
    ],
    a11yRules: ['A11Y_COMBOBOX_ROLE', 'A11Y_LISTBOX_ROLE', 'A11Y_ACTIVE_DESCENDANT'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Input', 'List', 'Item', 'Group', 'Empty', 'Separator'],
    requiredChildren: ['Input', 'List'],
    commonPatterns: [
      '<Dialog><Dialog.Trigger><Button>Open Palette</Button></Dialog.Trigger><Dialog.Content size="sm"><Command><Command.Input placeholder="Search..." /><Command.List><Command.Group heading="Actions"><Command.Item onItemSelect={() => {}}>Action 1</Command.Item></Command.Group><Command.Empty>No results.</Command.Empty></Command.List></Command></Dialog.Content></Dialog>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Inline command list with search',
      render: () => (
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <Command>
            <Command.Input placeholder="Type a command..." />
            <Command.List>
              <Command.Item onItemSelect={() => {}}>Open File</Command.Item>
              <Command.Item onItemSelect={() => {}}>Save Document</Command.Item>
              <Command.Item onItemSelect={() => {}}>Print</Command.Item>
              <Command.Empty>No results found.</Command.Empty>
            </Command.List>
          </Command>
        </div>
      ),
    },
    {
      name: 'Dialog Command Palette',
      description: 'Command palette inside a Dialog',
      render: () => (
        <Dialog>
          <Dialog.Trigger asChild>
            <Button variant="secondary">Open Command Palette</Button>
          </Dialog.Trigger>
          <Dialog.Content size="sm">
            <Command>
              <Command.Input placeholder="Search commands..." />
              <Command.List>
                <Command.Group heading="Actions">
                  <Command.Item onItemSelect={() => {}}>New File</Command.Item>
                  <Command.Item onItemSelect={() => {}}>Open Recent</Command.Item>
                </Command.Group>
                <Command.Separator />
                <Command.Group heading="Settings">
                  <Command.Item onItemSelect={() => {}}>Preferences</Command.Item>
                  <Command.Item onItemSelect={() => {}}>Keyboard Shortcuts</Command.Item>
                </Command.Group>
                <Command.Empty>No results found.</Command.Empty>
              </Command.List>
            </Command>
          </Dialog.Content>
        </Dialog>
      ),
    },
    {
      name: 'With Groups',
      description: 'Organized by category groups',
      render: () => (
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <Command>
            <Command.Input placeholder="Search..." />
            <Command.List>
              <Command.Group heading="Suggestions">
                <Command.Item onItemSelect={() => {}}>Calendar</Command.Item>
                <Command.Item onItemSelect={() => {}}>Calculator</Command.Item>
              </Command.Group>
              <Command.Separator />
              <Command.Group heading="Settings">
                <Command.Item onItemSelect={() => {}}>Profile</Command.Item>
                <Command.Item onItemSelect={() => {}}>Billing</Command.Item>
                <Command.Item disabled onItemSelect={() => {}}>
                  Team (coming soon)
                </Command.Item>
              </Command.Group>
              <Command.Empty>No results found.</Command.Empty>
            </Command.List>
          </Command>
        </div>
      ),
    },
    {
      name: 'With Icons',
      description: 'Items with leading icons',
      render: () => (
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <Command>
            <Command.Input placeholder="What do you need?" />
            <Command.List>
              <Command.Item onItemSelect={() => {}}>
                <span style={{ marginRight: '0.5rem', fontSize: '1rem' }}>+</span> New Document
              </Command.Item>
              <Command.Item onItemSelect={() => {}}>
                <span style={{ marginRight: '0.5rem', fontSize: '1rem' }}>{'>'}</span> Open Folder
              </Command.Item>
              <Command.Item onItemSelect={() => {}}>
                <span style={{ marginRight: '0.5rem', fontSize: '1rem' }}>?</span> Search
              </Command.Item>
              <Command.Empty>No results found.</Command.Empty>
            </Command.List>
          </Command>
        </div>
      ),
    },
  ],
});
