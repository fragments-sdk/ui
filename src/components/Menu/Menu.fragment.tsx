import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Menu } from '.';
import { Button } from '../Button';

function CheckedItemsMenuDemo() {
  const [view, setView] = React.useState('grid');
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button variant="secondary">View</Button>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item checked={view === 'grid'} onSelect={() => setView('grid')}>Grid</Menu.Item>
        <Menu.Item checked={view === 'list'} onSelect={() => setView('list')}>List</Menu.Item>
        <Menu.Item checked={view === 'board'} onSelect={() => setView('board')}>Board</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}

export default defineFragment({
  component: Menu,

  meta: {
    name: 'Menu',
    description: 'Dropdown menu for actions and commands. Supports submenus, check items, radio groups, and keyboard shortcuts.',
    category: 'feedback',
    status: 'stable',
    tags: ['menu', 'dropdown', 'actions', 'context-menu', 'commands', 'submenu'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Overflow actions that dont fit in the toolbar',
      'Context menus (right-click)',
      'User account menus',
      'Grouped actions with separators',
      'Nested menus with submenus',
    ],
    whenNot: [
      'Selecting from options (use Select)',
      'Navigation (use Tabs or navigation components)',
      'Form selection (use Select or RadioGroup)',
    ],
    guidelines: [
      'Group related actions with Menu.Group',
      'Use separators to divide action categories',
      'Include keyboard shortcuts where applicable',
      'Use danger variant for destructive actions',
      'Keep menu items under 10-12 for usability',
      'Use checked prop on Menu.Item for simple selection state',
      'Use Menu.Submenu for nested secondary options',
      'Menu.Trigger supports asChild for links/router-link components (single valid element child required)',
    ],
    accessibility: [
      'Full keyboard navigation with arrow keys',
      'Type-ahead search for items',
      'Focus returns to trigger on close',
      'Proper ARIA menu roles',
      'ArrowRight opens submenus, ArrowLeft closes them',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Menu trigger and content',
      required: true,
    },
    open: {
      type: 'boolean',
      description: 'Controlled open state',
    },
    defaultOpen: {
      type: 'boolean',
      description: 'Default open state (uncontrolled)',
      default: 'false',
    },
    onOpenChange: {
      type: 'function',
      description: 'Called when open state changes',
    },
    modal: {
      type: 'boolean',
      description: 'Whether menu is modal',
      default: 'true',
    },
  },

  relations: [
    { component: 'Select', relationship: 'alternative', note: 'Use Select for form field selection' },
    { component: 'Popover', relationship: 'alternative', note: 'Use Popover for rich non-action content' },
  ],

  contract: {
    propsSummary: [
      'open: boolean - controlled open state',
      'onOpenChange: (open) => void - state handler',
      'Menu.Trigger asChild supports non-button trigger elements',
      'Menu.Item onSelect: (event) => void - selection callback receives click event',
      'Menu.Item danger: boolean - destructive styling',
      'Menu.Item shortcut: string - keyboard shortcut text',
      'Menu.Item checked: boolean - check indicator for selection state',
    ],
    scenarioTags: [
      'action.menu',
      'action.overflow',
      'navigation.context',
    ],
    a11yRules: ['A11Y_MENU_KEYBOARD', 'A11Y_MENU_ROLE'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Trigger', 'Content', 'Item', 'CheckboxItem', 'RadioGroup', 'RadioItem', 'Group', 'GroupLabel', 'Separator', 'Submenu', 'SubmenuTrigger'],
    requiredChildren: ['Trigger', 'Content'],
    commonPatterns: [
      '<Menu><Menu.Trigger asChild><Button>Actions</Button></Menu.Trigger><Menu.Content><Menu.Item>{action1}</Menu.Item><Menu.Separator /><Menu.Item danger>{delete}</Menu.Item></Menu.Content></Menu>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic dropdown menu',
      render: () => (
        <Menu>
          <Menu.Trigger asChild>
            <Button variant="secondary">Actions</Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item onSelect={() => {}}>Edit</Menu.Item>
            <Menu.Item onSelect={() => {}}>Duplicate</Menu.Item>
            <Menu.Separator />
            <Menu.Item danger onSelect={() => {}}>Delete</Menu.Item>
          </Menu.Content>
        </Menu>
      ),
    },
    {
      name: 'With Shortcuts',
      description: 'Menu items with keyboard shortcuts',
      render: () => (
        <Menu>
          <Menu.Trigger asChild>
            <Button variant="secondary">Edit</Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item shortcut="Ctrl+Z" onSelect={() => {}}>Undo</Menu.Item>
            <Menu.Item shortcut="Ctrl+Y" onSelect={() => {}}>Redo</Menu.Item>
            <Menu.Separator />
            <Menu.Item shortcut="Ctrl+C" onSelect={() => {}}>Copy</Menu.Item>
            <Menu.Item shortcut="Ctrl+V" onSelect={() => {}}>Paste</Menu.Item>
          </Menu.Content>
        </Menu>
      ),
    },
    {
      name: 'With Groups',
      description: 'Menu with labeled groups',
      render: () => (
        <Menu>
          <Menu.Trigger asChild>
            <Button variant="secondary">Options</Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Group>
              <Menu.GroupLabel>View</Menu.GroupLabel>
              <Menu.Item onSelect={() => {}}>Zoom In</Menu.Item>
              <Menu.Item onSelect={() => {}}>Zoom Out</Menu.Item>
            </Menu.Group>
            <Menu.Separator />
            <Menu.Group>
              <Menu.GroupLabel>Layout</Menu.GroupLabel>
              <Menu.Item onSelect={() => {}}>Grid View</Menu.Item>
              <Menu.Item onSelect={() => {}}>List View</Menu.Item>
            </Menu.Group>
          </Menu.Content>
        </Menu>
      ),
    },
    {
      name: 'With Checkboxes',
      description: 'Menu with toggleable checkbox options',
      render: () => (
        <Menu>
          <Menu.Trigger asChild>
            <Button variant="secondary">Display</Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.CheckboxItem defaultChecked>Show Grid</Menu.CheckboxItem>
            <Menu.CheckboxItem defaultChecked>Show Rulers</Menu.CheckboxItem>
            <Menu.CheckboxItem>Show Guides</Menu.CheckboxItem>
          </Menu.Content>
        </Menu>
      ),
    },
    {
      name: 'With Checked Items',
      description: 'Filter menu with check marks indicating active selections',
      render: () => <CheckedItemsMenuDemo />,
    },
    {
      name: 'With Submenu',
      description: 'Menu with nested submenu for grouped secondary options',
      render: () => (
        <Menu>
          <Menu.Trigger asChild>
            <Button variant="secondary">File</Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item onSelect={() => {}}>New File</Menu.Item>
            <Menu.Item onSelect={() => {}}>Open</Menu.Item>
            <Menu.Separator />
            <Menu.Submenu>
              <Menu.SubmenuTrigger>Export As</Menu.SubmenuTrigger>
              <Menu.Content side="right" align="start">
                <Menu.Item onSelect={() => {}}>PNG</Menu.Item>
                <Menu.Item onSelect={() => {}}>SVG</Menu.Item>
                <Menu.Item onSelect={() => {}}>PDF</Menu.Item>
              </Menu.Content>
            </Menu.Submenu>
            <Menu.Separator />
            <Menu.Item danger onSelect={() => {}}>Delete</Menu.Item>
          </Menu.Content>
        </Menu>
      ),
    },
    {
      name: 'Link Trigger',
      description: 'Use asChild with a non-button trigger element',
      render: () => (
        <Menu>
          <Menu.Trigger asChild>
            <a href="#menu-actions">Open menu</a>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item onSelect={() => {}}>Inspect</Menu.Item>
            <Menu.Item onSelect={() => {}}>Rename</Menu.Item>
          </Menu.Content>
        </Menu>
      ),
    },
  ],
});
