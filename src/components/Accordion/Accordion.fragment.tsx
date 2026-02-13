import React from 'react';
import { defineFragment } from '@fragments/core';
import { Accordion } from '.';

export default defineFragment({
  component: Accordion,

  meta: {
    name: 'Accordion',
    description: 'Vertically stacked, collapsible content sections. Use for organizing related content that can be progressively disclosed.',
    category: 'layout',
    status: 'stable',
    tags: ['accordion', 'collapse', 'expand', 'disclosure', 'faq'],
    since: '0.2.0',
  },

  usage: {
    when: [
      'FAQ pages with multiple questions and answers',
      'Settings panels with grouped options',
      'Long forms that benefit from progressive disclosure',
      'Navigation menus with nested items',
    ],
    whenNot: [
      'Primary content that all users need to see',
      'Very short content (just display inline)',
      'Sequential steps (use Stepper or wizard)',
      'Tab-like navigation (use Tabs instead)',
    ],
    guidelines: [
      'Keep section headers concise and descriptive',
      'Use single mode when only one section should be open at a time',
      'Use multiple mode when users may need to compare sections',
      'Consider defaulting important sections to open',
      'Avoid nesting accordions more than one level deep',
    ],
    accessibility: [
      'Keyboard navigation with Enter/Space to toggle',
      'Arrow keys navigate between accordion headers',
      'Uses proper ARIA expanded/controls attributes',
      'Focus is visible on accordion triggers',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Accordion items (use Accordion.Item with Accordion.Trigger and Accordion.Content)',
      required: true,
    },
    type: {
      type: 'enum',
      description: 'Whether one or multiple items can be open',
      values: ['single', 'multiple'],
      default: 'single',
    },
    value: {
      type: 'union',
      description: 'Controlled open item(s)',
    },
    defaultValue: {
      type: 'union',
      description: 'Initially open item(s) for uncontrolled usage',
    },
    onValueChange: {
      type: 'function',
      description: 'Called when open items change',
    },
    collapsible: {
      type: 'boolean',
      description: 'Whether all items can be closed (single mode only)',
      default: 'false',
    },
    headingLevel: {
      type: 'enum',
      description: 'Semantic heading level for accordion triggers',
      values: ['2', '3', '4', '5', '6'],
      default: '3',
    },
  },

  relations: [
    { component: 'Tabs', relationship: 'alternative', note: 'Use Tabs for horizontal switching between related views' },
    { component: 'Dialog', relationship: 'alternative', note: 'Use Dialog for focused content that interrupts the flow' },
    { component: 'Card', relationship: 'complementary', note: 'Accordion items can contain Card-like content' },
  ],

  contract: {
    propsSummary: [
      'type: single|multiple - controls how many items can be open',
      'value: string|string[] - controlled open items',
      'defaultValue: string|string[] - initial open items',
      'collapsible: boolean - allow all closed in single mode',
    ],
    scenarioTags: [
      'layout.disclosure',
      'navigation.collapsible',
      'content.faq',
    ],
    a11yRules: ['A11Y_DISCLOSURE_KEYBOARD', 'A11Y_FOCUS_VISIBLE'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Item', 'Trigger', 'Content'],
    requiredChildren: ['Item'],
    commonPatterns: [
      '<Accordion type="single" collapsible><Accordion.Item value="item-1"><Accordion.Trigger>{title}</Accordion.Trigger><Accordion.Content>{content}</Accordion.Content></Accordion.Item></Accordion>',
    ],
  },

  variants: [
    {
      name: 'Basic',
      description: 'Single accordion with collapsible sections',
      code: `import { Accordion } from '@/components/Accordion';

<Accordion type="single" collapsible defaultValue="item-1">
  <Accordion.Item value="item-1">
    <Accordion.Trigger>What is Fragments UI?</Accordion.Trigger>
    <Accordion.Content>
      Fragments UI is a modern React component library built on Base UI primitives, providing accessible and customizable components.
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="item-2">
    <Accordion.Trigger>How do I install it?</Accordion.Trigger>
    <Accordion.Content>
      Install via npm or pnpm: pnpm add @fragments-sdk/ui
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="item-3">
    <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
    <Accordion.Content>
      Yes! All components follow WAI-ARIA guidelines and support keyboard navigation.
    </Accordion.Content>
  </Accordion.Item>
</Accordion>`,
      render: () => (
        <Accordion type="single" collapsible defaultValue="item-1">
          <Accordion.Item value="item-1">
            <Accordion.Trigger>What is Fragments UI?</Accordion.Trigger>
            <Accordion.Content>
              Fragments UI is a modern React component library built on Base UI primitives, providing accessible and customizable components.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item-2">
            <Accordion.Trigger>How do I install it?</Accordion.Trigger>
            <Accordion.Content>
              Install via npm or pnpm: pnpm add @fragments-sdk/ui
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item-3">
            <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
            <Accordion.Content>
              Yes! All components follow WAI-ARIA guidelines and support keyboard navigation.
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      ),
    },
    {
      name: 'Multiple Open',
      description: 'Allows multiple sections to be open simultaneously',
      code: `import { Accordion } from '@/components/Accordion';

<Accordion type="multiple" defaultValue={['features', 'pricing']}>
  <Accordion.Item value="features">
    <Accordion.Trigger>Features</Accordion.Trigger>
    <Accordion.Content>
      Comprehensive component library with theming support, accessibility built-in, and TypeScript-first development.
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="pricing">
    <Accordion.Trigger>Pricing</Accordion.Trigger>
    <Accordion.Content>
      Free and open source. MIT licensed for both personal and commercial use.
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="support">
    <Accordion.Trigger>Support</Accordion.Trigger>
    <Accordion.Content>
      Community support via GitHub issues and discussions.
    </Accordion.Content>
  </Accordion.Item>
</Accordion>`,
      render: () => (
        <Accordion type="multiple" defaultValue={['features', 'pricing']}>
          <Accordion.Item value="features">
            <Accordion.Trigger>Features</Accordion.Trigger>
            <Accordion.Content>
              Comprehensive component library with theming support, accessibility built-in, and TypeScript-first development.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="pricing">
            <Accordion.Trigger>Pricing</Accordion.Trigger>
            <Accordion.Content>
              Free and open source. MIT licensed for both personal and commercial use.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="support">
            <Accordion.Trigger>Support</Accordion.Trigger>
            <Accordion.Content>
              Community support via GitHub issues and discussions.
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      ),
    },
    {
      name: 'With Disabled',
      description: 'Accordion with a disabled item',
      code: `import { Accordion } from '@/components/Accordion';

<Accordion type="single" collapsible>
  <Accordion.Item value="available">
    <Accordion.Trigger>Available Section</Accordion.Trigger>
    <Accordion.Content>
      This section can be expanded and collapsed.
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="disabled" disabled>
    <Accordion.Trigger>Disabled Section</Accordion.Trigger>
    <Accordion.Content>
      This content is not accessible because the item is disabled.
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="another">
    <Accordion.Trigger>Another Section</Accordion.Trigger>
    <Accordion.Content>
      This section is also available for interaction.
    </Accordion.Content>
  </Accordion.Item>
</Accordion>`,
      render: () => (
        <Accordion type="single" collapsible>
          <Accordion.Item value="available">
            <Accordion.Trigger>Available Section</Accordion.Trigger>
            <Accordion.Content>
              This section can be expanded and collapsed.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="disabled" disabled>
            <Accordion.Trigger>Disabled Section</Accordion.Trigger>
            <Accordion.Content>
              This content is not accessible because the item is disabled.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="another">
            <Accordion.Trigger>Another Section</Accordion.Trigger>
            <Accordion.Content>
              This section is also available for interaction.
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      ),
    },
  ],
});
