import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Drawer } from '.';
import { Button } from '../Button';
import { Stack } from '../Stack';
import { Input } from '../Input';

export default defineFragment({
  component: Drawer,

  meta: {
    name: 'Drawer',
    description: 'A panel that slides in from screen edges. Extends the Dialog pattern with slide animations and edge positioning.',
    category: 'feedback',
    status: 'stable',
    tags: ['drawer', 'sheet', 'panel', 'sidebar', 'slide-over'],
    since: '0.8.2',
  },

  usage: {
    when: [
      'Side panels for editing or creating content',
      'Mobile-style bottom sheets for actions',
      'Navigation panels that slide in from the left',
      'Detail views that overlay the main content',
    ],
    whenNot: [
      'Centered modal dialogs (use Dialog)',
      'Non-blocking notifications (use Toast)',
      'Permanent side navigation (use Sidebar)',
      'Small contextual menus (use Menu or Popover)',
    ],
    guidelines: [
      'Default to right side for content editing and forms',
      'Use left side for navigation drawers',
      'Use bottom for mobile-style action sheets',
      'Provide clear close affordance (X button or cancel)',
      'Keep drawer content focused on a single task',
      'Drawer.Trigger and Drawer.Close with asChild require a single valid React element child',
      'Set Drawer.Content initialFocus={false} when custom focus management is needed',
    ],
    accessibility: [
      'Automatically traps focus within the drawer',
      'Closes on Escape key press',
      'Returns focus to trigger element on close',
      'Uses role="dialog" with proper aria attributes',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Drawer content (use Drawer.Content, Drawer.Header, etc.)',
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
      description: 'Whether to render as modal (blocks interaction with rest of page)',
      default: 'true',
    },
  },

  relations: [
    { component: 'Dialog', relationship: 'sibling', note: 'Use Dialog for centered modal overlays' },
    { component: 'Sidebar', relationship: 'alternative', note: 'Use Sidebar for permanent side navigation' },
    { component: 'Popover', relationship: 'alternative', note: 'Use Popover for small contextual content' },
  ],

  contract: {
    propsSummary: [
      'open: boolean - controlled open state',
      'onOpenChange: (open) => void - open state handler',
      'modal: boolean - blocks page interaction (default: true)',
      'Drawer.Content side: left|right|top|bottom - slide direction (default: right)',
      'Drawer.Content size: sm|md|lg|xl|full - panel size',
      'Drawer.Content initialFocus: boolean - auto-focus popup on open (default: true)',
    ],
    scenarioTags: [
      'overlay.drawer',
      'form.editor',
      'navigation.panel',
      'action.sheet',
    ],
    a11yRules: ['A11Y_DIALOG_FOCUS', 'A11Y_DIALOG_ESCAPE', 'A11Y_DIALOG_LABEL'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Trigger', 'Content', 'Close', 'Header', 'Title', 'Description', 'Body', 'Footer'],
    requiredChildren: ['Content'],
    commonPatterns: [
      '<Drawer><Drawer.Trigger><Button>Open</Button></Drawer.Trigger><Drawer.Content><Drawer.Close /><Drawer.Header><Drawer.Title>{title}</Drawer.Title></Drawer.Header><Drawer.Body>{content}</Drawer.Body><Drawer.Footer><Drawer.Close asChild><Button variant="secondary">Cancel</Button></Drawer.Close><Button>Save</Button></Drawer.Footer></Drawer.Content></Drawer>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Right-side drawer with header, body, and footer',
      render: () => (
        <Drawer>
          <Drawer.Trigger asChild>
            <Button>Open Drawer</Button>
          </Drawer.Trigger>
          <Drawer.Content>
            <Drawer.Close />
            <Drawer.Header>
              <Drawer.Title>Drawer Title</Drawer.Title>
              <Drawer.Description>
                A panel sliding in from the right.
              </Drawer.Description>
            </Drawer.Header>
            <Drawer.Body>
              <p>Drawer content goes here.</p>
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Drawer.Close>
              <Button variant="primary">Save</Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      ),
    },
    {
      name: 'Left Side',
      description: 'Left-side drawer for navigation',
      render: () => (
        <Drawer>
          <Drawer.Trigger asChild>
            <Button variant="secondary">Open Left</Button>
          </Drawer.Trigger>
          <Drawer.Content side="left">
            <Drawer.Close />
            <Drawer.Header>
              <Drawer.Title>Navigation</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <p>Left-side drawer for navigation or filters.</p>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      ),
    },
    {
      name: 'Bottom Sheet',
      description: 'Bottom drawer for mobile-style actions',
      render: () => (
        <Drawer>
          <Drawer.Trigger asChild>
            <Button variant="secondary">Open Bottom Sheet</Button>
          </Drawer.Trigger>
          <Drawer.Content side="bottom" size="sm">
            <Drawer.Header>
              <Drawer.Title>Actions</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <p>Bottom sheet for mobile-style actions.</p>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      ),
    },
    {
      name: 'With Form',
      description: 'Drawer with a form layout',
      render: () => (
        <Drawer>
          <Drawer.Trigger asChild>
            <Button>Edit Settings</Button>
          </Drawer.Trigger>
          <Drawer.Content size="md">
            <Drawer.Close />
            <Drawer.Header>
              <Drawer.Title>Settings</Drawer.Title>
              <Drawer.Description>Update your preferences.</Drawer.Description>
            </Drawer.Header>
            <Drawer.Body>
              <Stack gap="md">
                <Input label="Display Name" placeholder="Enter name" />
                <Input label="Email" type="email" placeholder="you@example.com" />
              </Stack>
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Drawer.Close>
              <Button variant="primary">Save Changes</Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      ),
    },
  ],
});
