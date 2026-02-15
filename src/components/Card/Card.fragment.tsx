import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Card } from '.';

export default defineFragment({
  component: Card,

  meta: {
    name: 'Card',
    description: 'Container for grouping related content',
    category: 'layout',
    status: 'stable',
    tags: ['container', 'layout', 'surface'],
  },

  usage: {
    when: [
      'Grouping related pieces of content together',
      'Creating visual separation between content sections',
      'Displaying a preview or summary of an item',
      'Building dashboard widgets or tiles',
    ],
    whenNot: [
      'Simple text content that does not need grouping',
      'Modal or dialog content (use Dialog component)',
      'Navigation items (use List or Sidebar patterns)',
    ],
    guidelines: [
      'Use consistent card variants within the same context',
      'Cards in a grid should have uniform sizing',
      'Use elevated variant sparingly for emphasis',
      'Interactive cards should have clear hover states',
    ],
    accessibility: [
      'Interactive cards should use button or link semantics',
      'Card titles should be appropriate heading levels',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Card content - use Card.Header, Card.Body, Card.Footer sub-components',
    },
    variant: {
      type: 'enum',
      values: ['default', 'outlined', 'elevated'],
      default: 'default',
      description: 'Visual style of the card surface',
      constraints: ['Use "elevated" sparingly to maintain visual hierarchy'],
    },
    padding: {
      type: 'enum',
      values: ['none', 'sm', 'md', 'lg'],
      default: 'md',
      description: 'Internal padding size',
    },
    onClick: {
      type: 'function',
      description: 'Click handler - makes card interactive',
    },
  },

  relations: [
    {
      component: 'Grid',
      relationship: 'parent',
      note: 'Use Grid + Card for responsive card layouts',
    },
    {
      component: 'List',
      relationship: 'alternative',
      note: 'Use List for linear, text-first layouts',
    },
  ],

  contract: {
    propsSummary: [
      'variant: default|outlined|elevated (default: default)',
      'padding: none|sm|md|lg (default: md)',
      'onClick: () => void - makes card interactive',
      'Sub-components: Card.Header, Card.Title, Card.Description, Card.Body, Card.Footer',
    ],
    scenarioTags: [
      'layout.container',
      'content.group',
      'pattern.widget',
      'pattern.tile',
    ],
    a11yRules: [
      'A11Y_CARD_HEADING',
      'A11Y_CARD_INTERACTIVE',
    ],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Header', 'Title', 'Description', 'Body', 'Footer'],
    requiredChildren: ['Body'],
    commonPatterns: [
      '<Card><Card.Body>{content}</Card.Body></Card>',
      '<Card><Card.Header><Card.Title>{title}</Card.Title></Card.Header><Card.Body>{content}</Card.Body></Card>',
      '<Card><Card.Header><Card.Title>{title}</Card.Title><Card.Description>{desc}</Card.Description></Card.Header><Card.Body>{content}</Card.Body><Card.Footer>{actions}</Card.Footer></Card>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Standard card with subtle shadow',
      render: () => (
        <Card>
          <Card.Header>
            <Card.Title>Card Title</Card.Title>
            <Card.Description>A brief description</Card.Description>
          </Card.Header>
          <Card.Body>Card content goes here.</Card.Body>
        </Card>
      ),
    },
    {
      name: 'Outlined',
      description: 'Card with border instead of shadow',
      render: () => (
        <Card variant="outlined">
          <Card.Header>
            <Card.Title>Outlined Card</Card.Title>
          </Card.Header>
          <Card.Body>Content with border.</Card.Body>
        </Card>
      ),
    },
    {
      name: 'Elevated',
      description: 'Card with prominent shadow for emphasis',
      render: () => (
        <Card variant="elevated">
          <Card.Header>
            <Card.Title>Featured Item</Card.Title>
          </Card.Header>
          <Card.Body>Important content.</Card.Body>
        </Card>
      ),
    },
    {
      name: 'Interactive',
      description: 'Clickable card',
      render: () => (
        <Card onClick={() => alert('Card clicked!')}>
          <Card.Header>
            <Card.Title>Click Me</Card.Title>
            <Card.Description>This card is interactive</Card.Description>
          </Card.Header>
          <Card.Body>Click anywhere on this card.</Card.Body>
        </Card>
      ),
    },
    {
      name: 'With Footer',
      description: 'Card with header, body, and footer',
      render: () => (
        <Card>
          <Card.Header>
            <Card.Title>Card with Footer</Card.Title>
            <Card.Description>Complete card layout</Card.Description>
          </Card.Header>
          <Card.Body>Main content area.</Card.Body>
          <Card.Footer>Footer actions go here</Card.Footer>
        </Card>
      ),
    },
    {
      name: 'Content Only',
      description: 'Card with just body content',
      render: () => (
        <Card>
          <Card.Body>Just content, no header or footer.</Card.Body>
        </Card>
      ),
    },
  ],
});
