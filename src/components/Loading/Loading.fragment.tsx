import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Loading } from '.';

export default defineFragment({
  component: Loading,

  meta: {
    name: 'Loading',
    description: 'Versatile loading indicator with multiple variants for showing progress or waiting states',
    category: 'feedback',
    status: 'stable',
    tags: ['loading', 'spinner', 'progress', 'feedback', 'indicator', 'async'],
  },

  usage: {
    when: [
      'Indicating content is being fetched or processed',
      'Showing a pending state while waiting for an async operation',
      'Displaying loading state for buttons, forms, or page sections',
      'Full-screen loading during initial app/page load',
    ],
    whenNot: [
      'For showing determinate progress - use Progress component instead',
      'For showing skeleton placeholders - use Skeleton component instead',
      'For AI-specific thinking states - use ThinkingIndicator instead',
    ],
    guidelines: [
      'Use spinner variant for general loading states',
      'Use dots variant for chat/messaging contexts',
      'Use pulse variant for subtle, ambient loading',
      'Always provide a meaningful label for screen readers',
      'Consider using Loading.Screen for initial page loads',
      'Use Loading.Inline when loading indicator should flow with text',
    ],
    accessibility: [
      'Component uses role="status" and aria-live="polite"',
      'Always provide descriptive label prop for screen readers',
      'Animations respect prefers-reduced-motion preference',
    ],
  },

  props: {
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg', 'xl'],
      default: 'md',
      description: 'Size of the loading indicator',
    },
    variant: {
      type: 'enum',
      values: ['spinner', 'dots', 'pulse'],
      default: 'spinner',
      description: 'Visual style of the loading animation',
    },
    label: {
      type: 'string',
      default: 'Loading...',
      description: 'Accessible label for screen readers',
    },
    centered: {
      type: 'boolean',
      default: false,
      description: 'Whether to center the loading indicator in its container',
    },
    fill: {
      type: 'boolean',
      default: false,
      description: 'Whether to fill the parent container',
    },
    overlay: {
      type: 'boolean',
      default: false,
      description: 'Whether to show with a backdrop overlay',
    },
    color: {
      type: 'enum',
      values: ['accent', 'current', 'muted'],
      default: 'accent',
      description: 'Color variant - accent uses theme color, current inherits text color',
    },
  },

  variants: [
    {
      name: 'Default',
      description: 'Default spinner loading indicator',
      render: () => <Loading />,
    },
    {
      name: 'Sizes',
      description: 'Loading indicators in different sizes',
      render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Loading size="sm" />
          <Loading size="md" />
          <Loading size="lg" />
          <Loading size="xl" />
        </div>
      ),
    },
    {
      name: 'Dots',
      description: 'Bouncing dots animation',
      render: () => <Loading variant="dots" />,
    },
    {
      name: 'Pulse',
      description: 'Pulsing circle animation',
      render: () => <Loading variant="pulse" />,
    },
    {
      name: 'Colors',
      description: 'Different color variants',
      render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Loading color="accent" />
          <Loading color="muted" />
          <span style={{ color: '#3b82f6' }}>
            <Loading color="current" />
          </span>
        </div>
      ),
    },
    {
      name: 'Inline',
      description: 'Inline loading indicator that flows with text',
      render: () => (
        <p style={{ margin: 0 }}>
          Processing your request <Loading.Inline /> please wait...
        </p>
      ),
    },
    {
      name: 'Centered',
      description: 'Centered in container',
      render: () => (
        <div style={{ width: '200px', height: '100px', border: '1px dashed #ccc', borderRadius: '8px' }}>
          <Loading centered fill />
        </div>
      ),
    },
    {
      name: 'Screen',
      description: 'Full-screen loading state with optional label',
      render: () => (
        <div style={{ position: 'relative', width: '300px', height: '200px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
          <Loading.Screen size="lg" label="Loading application..." showLabel />
        </div>
      ),
    },
  ],
});
