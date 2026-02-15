import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Dialog } from '.';
import { Button } from '../Button';

export default defineFragment({
  component: Dialog,

  meta: {
    name: 'Dialog',
    description: 'Modal overlay for focused user interactions. Use for confirmations, forms, or content requiring full attention.',
    category: 'feedback',
    status: 'stable',
    tags: ['modal', 'dialog', 'overlay', 'popup', 'confirmation'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Confirming destructive actions (delete, discard changes)',
      'Collecting focused input (forms, settings)',
      'Displaying content that requires acknowledgment',
      'Multi-step workflows that need isolation',
    ],
    whenNot: [
      'Simple tooltips or hints (use Tooltip)',
      'Contextual menus (use Menu or Popover)',
      'Non-blocking notifications (use Toast or Alert)',
      'Simple confirmation that can be inline (use Alert)',
    ],
    guidelines: [
      'Keep dialog content focused on a single task',
      'Provide clear primary and secondary actions',
      'Use descriptive title that explains the purpose',
      'Allow dismissal via backdrop click or close button for non-critical dialogs',
      'Trap focus within the dialog for accessibility',
    ],
    accessibility: [
      'Automatically traps focus within the dialog',
      'Closes on Escape key press',
      'Returns focus to trigger element on close',
      'Uses role="dialog" with proper aria attributes',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Dialog content (use Dialog.Content, Dialog.Header, etc.)',
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
    { component: 'Popover', relationship: 'alternative', note: 'Use Popover for non-modal contextual content' },
    { component: 'Menu', relationship: 'alternative', note: 'Use Menu for action lists' },
    { component: 'Alert', relationship: 'sibling', note: 'Use Alert for inline notifications' },
  ],

  contract: {
    propsSummary: [
      'open: boolean - controlled open state',
      'onOpenChange: (open) => void - open state handler',
      'modal: boolean - blocks page interaction (default: true)',
      'Dialog.Content size: sm|md|lg|xl|full - dialog width',
    ],
    scenarioTags: [
      'overlay.modal',
      'form.dialog',
      'action.confirm',
      'workflow.step',
    ],
    a11yRules: ['A11Y_DIALOG_FOCUS', 'A11Y_DIALOG_ESCAPE', 'A11Y_DIALOG_LABEL'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Trigger', 'Content', 'Close', 'Header', 'Title', 'Description', 'Body', 'Footer'],
    requiredChildren: ['Content'],
    commonPatterns: [
      '<Dialog><Dialog.Trigger><Button>Open</Button></Dialog.Trigger><Dialog.Content><Dialog.Header><Dialog.Title>{title}</Dialog.Title></Dialog.Header><Dialog.Body>{content}</Dialog.Body><Dialog.Footer><Dialog.Close><Button variant="secondary">Cancel</Button></Dialog.Close><Button>Confirm</Button></Dialog.Footer></Dialog.Content></Dialog>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic dialog with header, body, and footer',
      render: () => (
        <Dialog>
          <Dialog.Trigger asChild>
            <Button>Open Dialog</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Close />
            <Dialog.Header>
              <Dialog.Title>Dialog Title</Dialog.Title>
              <Dialog.Description>
                A brief description of what this dialog is for.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <p>Dialog content goes here. You can include forms, text, or any other content.</p>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button variant="primary">Confirm</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
    },
    {
      name: 'Confirmation',
      description: 'Destructive action confirmation',
      render: () => (
        <Dialog>
          <Dialog.Trigger asChild>
            <Button variant="danger">Delete Item</Button>
          </Dialog.Trigger>
          <Dialog.Content size="sm">
            <Dialog.Header>
              <Dialog.Title>Delete item?</Dialog.Title>
              <Dialog.Description>
                This action cannot be undone. The item will be permanently removed.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button variant="danger">Delete</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
    },
    {
      name: 'Large',
      description: 'Large dialog for complex content',
      render: () => (
        <Dialog>
          <Dialog.Trigger asChild>
            <Button>Open Large Dialog</Button>
          </Dialog.Trigger>
          <Dialog.Content size="lg">
            <Dialog.Close />
            <Dialog.Header>
              <Dialog.Title>Settings</Dialog.Title>
              <Dialog.Description>
                Configure your application preferences.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <p>This dialog has more space for complex forms or content layouts.</p>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button variant="primary">Save Changes</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
    },
  ],
});
