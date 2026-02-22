import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Link } from '.';

export default defineFragment({
  component: Link,

  meta: {
    name: 'Link',
    description: 'Styled anchor element for navigation. Supports internal and external links with consistent visual treatment.',
    category: 'navigation',
    status: 'stable',
    tags: ['link', 'anchor', 'navigation', 'href', 'url'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Inline text links within paragraphs',
      'Navigation links in footers or sidebars',
      '"Forgot password?" or "Sign up" links in forms',
      'External links to documentation or resources',
    ],
    whenNot: [
      'Primary call-to-action (use Button instead)',
      'Navigation tabs (use Tabs component)',
      'Menu items in dropdowns (use Menu component)',
      'Cards that link to detail pages should still use real link semantics (Link or anchor inside Card)',
    ],
    guidelines: [
      'Link text should describe the destination, not "click here"',
      'Use external prop for links that open in new tabs',
      'Use subtle variant for secondary/contextual links',
      'Ensure links are distinguishable from regular text',
      'When using asChild, Link composes event handlers with the child instead of overwriting them',
    ],
    accessibility: [
      'Link text must be descriptive of the destination',
      'External links should indicate they open in new window',
      'Links must have visible focus indicators',
      'Avoid using links that look like buttons without button semantics',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Link text content',
      required: true,
    },
    variant: {
      type: 'enum',
      description: 'Visual style variant',
      values: ['default', 'subtle', 'muted'],
      default: 'default',
    },
    underline: {
      type: 'enum',
      description: 'Underline behavior',
      values: ['always', 'hover', 'none'],
      default: 'hover',
    },
    external: {
      type: 'boolean',
      description: 'Opens in new tab with noopener noreferrer',
      default: 'false',
    },
    asChild: {
      type: 'boolean',
      description: 'Render as child element (polymorphic). Merges link props/classes and composes event handlers onto the single child (e.g. Next.js Link).',
      default: 'false',
    },
  },

  relations: [
    { component: 'Button', relationship: 'alternative', note: 'Use Button for primary actions, Link for navigation' },
    { component: 'Text', relationship: 'parent', note: 'Links often appear within Text components' },
  ],

  contract: {
    propsSummary: [
      'children: ReactNode - link text (required)',
      'href: string - destination URL',
      'variant: default|subtle|muted - visual style',
      'underline: always|hover|none - underline behavior',
      'external: boolean - opens in new tab',
      'asChild: boolean - polymorphic child rendering with merged styles and composed event handlers',
    ],
    scenarioTags: [
      'navigation.link',
      'content.inline',
      'action.navigate',
    ],
    a11yRules: ['A11Y_LINK_TEXT', 'A11Y_LINK_FOCUS'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Standard link with hover underline',
      render: () => <Link href="#">Learn more about our services</Link>,
    },
    {
      name: 'Variants',
      description: 'Visual style options',
      render: () => (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="#" variant="default">Default</Link>
          <Link href="#" variant="subtle">Subtle</Link>
          <Link href="#" variant="muted">Muted</Link>
        </div>
      ),
    },
    {
      name: 'Underline Styles',
      description: 'Different underline behaviors',
      render: () => (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="#" underline="always">Always underlined</Link>
          <Link href="#" underline="hover">Underline on hover</Link>
          <Link href="#" underline="none">No underline</Link>
        </div>
      ),
    },
    {
      name: 'External Link',
      description: 'Link that opens in new tab',
      render: () => (
        <Link href="https://example.com" external>
          View documentation ↗
        </Link>
      ),
    },
    {
      name: 'As Child (Polymorphic)',
      description: 'Renders as a custom element while applying Link styles and composing handlers. Useful with Next.js Link for client-side navigation.',
      render: () => (
        <Link asChild variant="subtle" onClick={() => {}}>
          <button type="button" onClick={() => alert('Navigated!')}>
            Polymorphic link as button
          </button>
        </Link>
      ),
    },
  ],
});
