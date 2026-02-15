import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Tooltip } from '.';
import { Button } from '../Button';

export default defineFragment({
  component: Tooltip,

  meta: {
    name: 'Tooltip',
    description: 'Contextual help text that appears on hover or focus. Perfect for explaining icons, truncated text, or providing additional context.',
    category: 'feedback',
    status: 'stable',
    tags: ['tooltip', 'hint', 'help', 'hover', 'contextual'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Explaining icon-only buttons',
      'Showing full text for truncated content',
      'Providing keyboard shortcuts',
      'Brief contextual help that fits in one line',
    ],
    whenNot: [
      'Long-form help content (use Popover)',
      'Critical information users must see (use Alert)',
      'Interactive content (use Popover or Menu)',
      'Mobile-primary interfaces (tooltips require hover)',
    ],
    guidelines: [
      'Keep tooltip text concise (under 80 characters)',
      'Use sentence case, no period for single sentences',
      'Avoid duplicating visible label text',
      'Consider mobile users who cannot hover',
    ],
    accessibility: [
      'Accessible via focus as well as hover',
      'Uses role="tooltip" with proper aria association',
      'Delay prevents tooltips from appearing during navigation',
    ],
  },

  props: {
    children: {
      type: 'element',
      description: 'The element that triggers the tooltip',
      required: true,
    },
    content: {
      type: 'node',
      description: 'Content to display in the tooltip',
      required: true,
    },
    side: {
      type: 'enum',
      description: 'Which side to show the tooltip',
      values: ['top', 'bottom', 'left', 'right'],
      default: 'top',
    },
    align: {
      type: 'enum',
      description: 'Alignment along the side',
      values: ['start', 'center', 'end'],
      default: 'center',
    },
    sideOffset: {
      type: 'number',
      description: 'Distance from trigger in pixels',
      default: '6',
    },
    delay: {
      type: 'number',
      description: 'Delay before showing (ms)',
      default: '400',
    },
    closeDelay: {
      type: 'number',
      description: 'Delay before hiding (ms)',
      default: '0',
    },
    arrow: {
      type: 'boolean',
      description: 'Show arrow pointing to trigger',
      default: 'true',
    },
    disabled: {
      type: 'boolean',
      description: 'Disable the tooltip',
      default: 'false',
    },
    open: {
      type: 'boolean',
      description: 'Controlled open state',
    },
    defaultOpen: {
      type: 'boolean',
      description: 'Default open state',
      default: 'false',
    },
    onOpenChange: {
      type: 'function',
      description: 'Callback when open state changes',
    },
  },

  relations: [
    { component: 'Popover', relationship: 'alternative', note: 'Use Popover for interactive or longer content' },
    { component: 'Alert', relationship: 'alternative', note: 'Use Alert for critical information that must be visible' },
  ],

  contract: {
    propsSummary: [
      'content: ReactNode - tooltip content',
      'side: top|bottom|left|right - position',
      'delay: number - show delay in ms (default: 400)',
      'arrow: boolean - show arrow (default: true)',
    ],
    scenarioTags: [
      'help.tooltip',
      'content.hint',
      'action.explain',
    ],
    a11yRules: ['A11Y_TOOLTIP_FOCUS', 'A11Y_TOOLTIP_ROLE'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic tooltip on hover',
      render: () => (
        <Tooltip content="Save your changes">
          <Button>Save</Button>
        </Tooltip>
      ),
    },
    {
      name: 'Positions',
      description: 'Tooltips on different sides',
      render: () => (
        <div style={{ display: 'flex', gap: '16px', padding: '40px' }}>
          <Tooltip content="Top tooltip" side="top">
            <Button variant="secondary">Top</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" side="bottom">
            <Button variant="secondary">Bottom</Button>
          </Tooltip>
          <Tooltip content="Left tooltip" side="left">
            <Button variant="secondary">Left</Button>
          </Tooltip>
          <Tooltip content="Right tooltip" side="right">
            <Button variant="secondary">Right</Button>
          </Tooltip>
        </div>
      ),
    },
    {
      name: 'With Shortcut',
      description: 'Tooltip showing keyboard shortcut',
      render: () => (
        <Tooltip content="Undo (Ctrl+Z)">
          <Button variant="ghost">Undo</Button>
        </Tooltip>
      ),
    },
    {
      name: 'No Arrow',
      description: 'Tooltip without arrow',
      render: () => (
        <Tooltip content="Clean tooltip" arrow={false}>
          <Button variant="secondary">Hover me</Button>
        </Tooltip>
      ),
    },
  ],
});
