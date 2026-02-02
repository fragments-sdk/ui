import React from 'react';
import { defineSegment } from '@fragments/core';
import { Menu } from './index.js';
import { Button } from '../Button/index.js';

export default defineSegment({
  component: Menu,

  meta: {
    name: 'Menu',
    description: 'Dropdown menu for actions and commands. Use for contextual actions, overflow menus, or grouped commands.',
    category: 'overlays',
    status: 'stable',
    tags: ['menu', 'dropdown', 'actions', 'context-menu', 'commands'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Overflow actions that dont fit in the toolbar',
      'Context menus (right-click)',
      'User account menus',
      'Grouped actions with separators',
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
    ],
    accessibility: [
      'Full keyboard navigation with arrow keys',
      'Type-ahead search for items',
      'Focus returns to trigger on close',
      'Proper ARIA menu roles',
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
      'Menu.Item danger: boolean - destructive styling',
      'Menu.Item shortcut: string - keyboard shortcut text',
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
    subComponents: ['Trigger', 'Content', 'Item', 'CheckboxItem', 'RadioGroup', 'RadioItem', 'Group', 'GroupLabel', 'Separator'],
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
      description: 'Menu with toggleable options',
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
  ],
});
