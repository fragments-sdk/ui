import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { VisuallyHidden } from '.';

export default defineFragment({
  component: VisuallyHidden,

  meta: {
    name: 'VisuallyHidden',
    description: 'Hides content visually while keeping it accessible to screen readers. Essential for accessible icon-only buttons and supplementary text.',
    category: 'navigation',
    status: 'stable',
    tags: ['accessibility', 'a11y', 'screen-reader', 'hidden', 'sr-only'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Providing accessible labels for icon-only buttons',
      'Adding context that screen readers need but sighted users don\'t',
      'Hiding decorative content while providing text alternatives',
      'Skip links for keyboard navigation',
    ],
    whenNot: [
      'Hiding content from everyone (use display: none or conditional render)',
      'Content that should be visible on focus (use focus-visible styles)',
      'Temporarily hidden content (use proper ARIA attributes)',
      'Lazy-loaded content (use suspense or loading states)',
    ],
    guidelines: [
      'Always use with icon-only interactive elements',
      'Keep hidden text concise but descriptive',
      'Test with screen readers to verify announcements',
      'Don\'t overuse; visible text is often better',
    ],
    accessibility: [
      'Content is announced by screen readers',
      'Content is focusable if interactive elements are inside',
      'Essential for WCAG 2.1 compliance with icon-only controls',
      'Must convey equivalent information to visual content',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Content to hide visually',
      required: true,
    },
    as: {
      type: 'enum',
      description: 'HTML element to render',
      values: ['span', 'div'],
      default: 'span',
    },
  },

  relations: [
    { component: 'Button', relationship: 'child', note: 'Use inside icon-only buttons for accessible labels' },
    { component: 'Icon', relationship: 'sibling', note: 'Pair with icons to provide text alternatives' },
  ],

  contract: {
    propsSummary: [
      'children: ReactNode - hidden text (required)',
      'as: span|div - HTML element',
    ],
    scenarioTags: [
      'accessibility.label',
      'utility.hidden',
      'screen-reader.text',
    ],
    a11yRules: ['A11Y_SR_ONLY', 'A11Y_ICON_LABEL'],
  },

  variants: [
    {
      name: 'Icon Button Label',
      description: 'Accessible label for icon-only button',
      render: () => (
        <button style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          border: '1px solid var(--fui-border-default)',
          borderRadius: '8px',
          background: 'var(--fui-color-surface-primary)',
          cursor: 'pointer'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <VisuallyHidden>Search</VisuallyHidden>
        </button>
      ),
    },
    {
      name: 'Supplementary Text',
      description: 'Additional context for screen readers',
      render: () => (
        <a href="#" style={{ color: 'var(--fui-color-accent)' }}>
          Read more
          <VisuallyHidden> about our accessibility features</VisuallyHidden>
        </a>
      ),
    },
    {
      name: 'Skip Link',
      description: 'Navigation aid that becomes visible on focus',
      render: () => (
        <div>
          <VisuallyHidden as="div">
            <a
              href="#main-content"
              style={{
                position: 'absolute',
                padding: '8px 16px',
                background: 'var(--fui-color-accent)',
                color: 'white'
              }}
            >
              Skip to main content
            </a>
          </VisuallyHidden>
          <p style={{ color: 'var(--fui-color-text-tertiary)', fontSize: '14px' }}>
            (Screen reader only: "Skip to main content" link)
          </p>
        </div>
      ),
    },
  ],
});
