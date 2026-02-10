import React from 'react';
import { defineFragment } from '@fragments/core';
import { ThinkingIndicator } from '.';

export default defineFragment({
  component: ThinkingIndicator,

  meta: {
    name: 'ThinkingIndicator',
    description: 'Animated indicator showing AI is processing',
    category: 'ai',
    status: 'stable',
    tags: ['thinking', 'loading', 'ai', 'processing', 'indicator', 'animation'],
  },

  usage: {
    when: [
      'AI is processing a request and generating a response',
      'Need visual feedback during async AI operations',
      'Want to show multi-step progress for complex AI tasks',
      'Indicating streaming is about to begin',
    ],
    whenNot: [
      'Simple loading states (use Progress or Skeleton)',
      'Form submission loading (use Button loading state)',
      'Page-level loading (use Progress or Skeleton)',
    ],
    guidelines: [
      'Use active prop to control visibility',
      'Choose variant based on context (dots for chat, spinner for actions)',
      'Enable showElapsed for longer operations',
      'Use steps for multi-step AI workflows (tool calls, research)',
    ],
    accessibility: [
      'Uses role="status" and aria-live="polite"',
      'Provides aria-label for screen readers',
      'Animations respect prefers-reduced-motion',
      'Elapsed time uses tabular numbers for stability',
    ],
  },

  props: {
    active: {
      type: 'boolean',
      default: 'true',
      description: 'Whether thinking is active',
    },
    label: {
      type: 'string',
      default: '"Thinking..."',
      description: 'Status text',
    },
    variant: {
      type: 'enum',
      values: ['dots', 'pulse', 'spinner'],
      default: '"dots"',
      description: 'Animation style',
    },
    showElapsed: {
      type: 'boolean',
      default: 'false',
      description: 'Show elapsed time',
    },
    steps: {
      type: 'array',
      description: 'Multi-step progress array',
    },
  },

  relations: [
    {
      component: 'Message',
      relationship: 'sibling',
      note: 'Show ThinkingIndicator while waiting for assistant message',
    },
    {
      component: 'ConversationList',
      relationship: 'parent',
      note: 'Typically placed at bottom of ConversationList',
    },
    {
      component: 'Progress',
      relationship: 'alternative',
      note: 'Use Progress for determinate progress',
    },
  ],

  contract: {
    propsSummary: [
      'active: boolean - whether indicator is visible (default: true)',
      'label: string - status text (default: "Thinking...")',
      'variant: "dots" | "pulse" | "spinner" - animation style',
      'showElapsed: boolean - show elapsed time',
      'steps: ThinkingStep[] - multi-step progress',
    ],
    scenarioTags: [
      'ui.loading',
      'ui.indicator',
      'ai.thinking',
      'ai.processing',
    ],
    a11yRules: [
      'A11Y_ARIA_LIVE',
      'A11Y_MOTION_PREFERENCE',
    ],
    bans: [],
  },

  variants: [
    {
      name: 'Dots (Default)',
      description: 'Bouncing dots animation',
      render: () => (
        <ThinkingIndicator variant="dots" label="Thinking..." />
      ),
    },
    {
      name: 'Pulse',
      description: 'Pulsing ring animation',
      render: () => (
        <ThinkingIndicator variant="pulse" label="Processing..." />
      ),
    },
    {
      name: 'Spinner',
      description: 'Rotating spinner animation',
      render: () => (
        <ThinkingIndicator variant="spinner" label="Loading..." />
      ),
    },
    {
      name: 'With Elapsed Time',
      description: 'Shows time since started',
      render: () => (
        <ThinkingIndicator
          variant="dots"
          label="Generating response..."
          showElapsed
        />
      ),
    },
    {
      name: 'Multi-Step Progress',
      description: 'Shows progress through multiple steps',
      render: () => (
        <ThinkingIndicator
          variant="spinner"
          label="Working..."
          steps={[
            { id: '1', label: 'Analyzing request', status: 'complete' },
            { id: '2', label: 'Searching knowledge base', status: 'active' },
            { id: '3', label: 'Generating response', status: 'pending' },
          ]}
        />
      ),
    },
    {
      name: 'With Error Step',
      description: 'Shows a step that encountered an error',
      render: () => (
        <ThinkingIndicator
          variant="spinner"
          label="Retrying..."
          steps={[
            { id: '1', label: 'Connecting to API', status: 'complete' },
            { id: '2', label: 'Fetching data', status: 'error' },
            { id: '3', label: 'Retrying with fallback', status: 'active' },
          ]}
        />
      ),
    },
    {
      name: 'Custom Label',
      description: 'Custom status text',
      render: () => (
        <ThinkingIndicator
          variant="dots"
          label="Claude is writing code..."
        />
      ),
    },
  ],
});
