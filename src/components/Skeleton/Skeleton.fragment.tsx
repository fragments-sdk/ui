import React from 'react';
import { defineSegment } from '@fragments/core';
import { Skeleton } from './index.js';

export default defineSegment({
  component: Skeleton,

  meta: {
    name: 'Skeleton',
    description: 'Placeholder loading state for content',
    category: 'feedback',
    status: 'stable',
    tags: ['loading', 'placeholder', 'skeleton', 'shimmer'],
  },

  usage: {
    when: [
      'Content is loading asynchronously',
      'Preventing layout shift during data fetching',
      'Providing visual feedback that content is coming',
      'Improving perceived performance',
    ],
    whenNot: [
      'Short loading times (< 300ms)',
      'When spinner is more appropriate',
      'Background operations without visible impact',
    ],
    guidelines: [
      'Match skeleton shape to expected content',
      'Use semantic variants (text, heading, avatar) for consistency',
      'Maintain similar dimensions to loaded content',
      'Avoid too many skeleton elements - simplify complex layouts',
    ],
    accessibility: [
      'Skeletons are decorative - use aria-hidden',
      'Announce loading state separately if needed',
      'Ensure sufficient contrast for the animation',
    ],
  },

  props: {
    variant: {
      type: 'enum',
      values: ['text', 'heading', 'avatar', 'button', 'input', 'rect'],
      default: 'rect',
      description: 'Semantic variant that auto-sizes',
    },
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: 'Size for avatar/button variants',
    },
    width: {
      type: 'union',
      description: 'Custom width (string or number)',
    },
    height: {
      type: 'union',
      description: 'Custom height (string or number)',
    },
    fill: {
      type: 'boolean',
      default: false,
      description: 'Fill parent container',
    },
    radius: {
      type: 'enum',
      values: ['none', 'sm', 'md', 'lg', 'full'],
      description: 'Border radius override',
    },
  },

  relations: [
    {
      component: 'Progress',
      relationship: 'alternative',
      note: 'Use Progress for determinate loading',
    },
  ],

  contract: {
    propsSummary: [
      'variant: text|heading|avatar|button|input|rect',
      'size: sm|md|lg (for avatar/button)',
      'width/height: custom dimensions',
      'fill: boolean - fill parent',
    ],
    scenarioTags: [
      'loading.content',
      'loading.list',
      'loading.card',
    ],
    a11yRules: [],
    bans: [],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic rectangle skeleton',
      render: () => <Skeleton width={200} height={20} />,
    },
    {
      name: 'Text Lines',
      description: 'Multi-line text placeholder',
      render: () => <Skeleton.Text lines={3} />,
    },
    {
      name: 'Semantic Variants',
      description: 'Pre-configured shapes for common elements',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fui-space-2)' }}>
          <Skeleton variant="heading" width={200} />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
        </div>
      ),
    },
    {
      name: 'Avatar Skeleton',
      description: 'Circular placeholder for avatars',
      render: () => (
        <div style={{ display: 'flex', gap: 'var(--fui-space-1)', alignItems: 'center' }}>
          <Skeleton.Circle size="sm" />
          <Skeleton.Circle size="md" />
          <Skeleton.Circle size="lg" />
        </div>
      ),
    },
    {
      name: 'Card Skeleton',
      description: 'Composed skeleton for a card layout',
      render: () => (
        <div style={{ width: 300, padding: 'var(--fui-space-2)', border: '1px solid var(--fui-border)', borderRadius: 'var(--fui-radius-lg)' }}>
          <Skeleton variant="rect" height={120} radius="md" />
          <div style={{ marginTop: 'var(--fui-space-2)' }}>
            <Skeleton variant="heading" width="60%" />
          </div>
          <div style={{ marginTop: 'var(--fui-space-1)' }}>
            <Skeleton.Text lines={2} />
          </div>
        </div>
      ),
    },
  ],
});
