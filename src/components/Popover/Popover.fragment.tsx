import React from 'react';
import { defineSegment } from '@fragments/core';
import { Popover } from './index.js';
import { Button } from '../Button/index.js';
import { Input } from '../Input/index.js';

export default defineSegment({
  component: Popover,

  meta: {
    name: 'Popover',
    description: 'Rich content overlay anchored to a trigger element. Use for forms, detailed information, or interactive content that should stay in context.',
    category: 'overlays',
    status: 'stable',
    tags: ['popover', 'overlay', 'dropdown', 'floating', 'contextual'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Inline editing forms',
      'Rich preview content',
      'Filter panels',
      'Date/color pickers',
      'Content that needs more space than a tooltip',
    ],
    whenNot: [
      'Simple hints (use Tooltip)',
      'Action lists (use Menu)',
      'Blocking user interaction (use Dialog)',
      'System notifications (use Toast or Alert)',
    ],
    guidelines: [
      'Keep popover content focused and minimal',
      'Include a clear way to close (X button or action buttons)',
      'Position to avoid covering important content',
      'Use arrow to visually connect popover to trigger',
    ],
    accessibility: [
      'Focus is moved to popover content on open',
      'Closes on Escape key',
      'Focus returns to trigger on close',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Popover trigger and content',
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
      description: 'Whether to block page interaction',
      default: 'false',
    },
  },

  relations: [
    { component: 'Tooltip', relationship: 'alternative', note: 'Use Tooltip for brief, non-interactive hints' },
    { component: 'Menu', relationship: 'alternative', note: 'Use Menu for action lists' },
    { component: 'Dialog', relationship: 'alternative', note: 'Use Dialog for blocking interactions' },
  ],

  contract: {
    propsSummary: [
      'open: boolean - controlled open state',
      'onOpenChange: (open) => void - state handler',
      'modal: boolean - blocks page interaction (default: false)',
      'Popover.Content side: top|bottom|left|right - position',
    ],
    scenarioTags: [
      'overlay.popover',
      'form.inline',
      'content.preview',
    ],
    a11yRules: ['A11Y_POPOVER_FOCUS', 'A11Y_POPOVER_ESCAPE'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Trigger', 'Content', 'Close', 'Title', 'Description', 'Body', 'Footer'],
    requiredChildren: ['Trigger', 'Content'],
    commonPatterns: [
      '<Popover><Popover.Trigger asChild><Button>Open</Button></Popover.Trigger><Popover.Content><Popover.Close /><Popover.Title>{title}</Popover.Title><Popover.Description>{description}</Popover.Description></Popover.Content></Popover>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic popover with content',
      render: () => (
        <Popover>
          <Popover.Trigger asChild>
            <Button variant="secondary">Open Popover</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Popover.Close />
            <Popover.Title>Popover Title</Popover.Title>
            <Popover.Description>
              This is a popover with some content. It can contain text, forms, or other elements.
            </Popover.Description>
          </Popover.Content>
        </Popover>
      ),
    },
    {
      name: 'With Form',
      description: 'Popover containing a form',
      render: () => (
        <Popover>
          <Popover.Trigger asChild>
            <Button variant="secondary">Edit Name</Button>
          </Popover.Trigger>
          <Popover.Content size="sm">
            <Popover.Close />
            <Popover.Title>Edit Name</Popover.Title>
            <Popover.Body>
              <Input label="Display Name" placeholder="Enter name" />
            </Popover.Body>
            <Popover.Footer>
              <Popover.Close asChild>
                <Button variant="secondary" size="sm">Cancel</Button>
              </Popover.Close>
              <Button variant="primary" size="sm">Save</Button>
            </Popover.Footer>
          </Popover.Content>
        </Popover>
      ),
    },
    {
      name: 'With Arrow',
      description: 'Popover with pointing arrow',
      render: () => (
        <Popover>
          <Popover.Trigger asChild>
            <Button variant="secondary">Info</Button>
          </Popover.Trigger>
          <Popover.Content arrow>
            <Popover.Title>Quick Tip</Popover.Title>
            <Popover.Description>
              This popover has an arrow pointing to its trigger element.
            </Popover.Description>
          </Popover.Content>
        </Popover>
      ),
    },
    {
      name: 'Positions',
      description: 'Popover on different sides',
      render: () => (
        <div style={{ display: 'flex', gap: '16px', padding: '60px' }}>
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="secondary">Top</Button>
            </Popover.Trigger>
            <Popover.Content side="top" size="sm">
              <Popover.Description>Popover on top</Popover.Description>
            </Popover.Content>
          </Popover>
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="secondary">Bottom</Button>
            </Popover.Trigger>
            <Popover.Content side="bottom" size="sm">
              <Popover.Description>Popover on bottom</Popover.Description>
            </Popover.Content>
          </Popover>
        </div>
      ),
    },
  ],
});
