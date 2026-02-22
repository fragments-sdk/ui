import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { ButtonGroup } from '.';
import { Button } from '../Button';

export default defineFragment({
  component: ButtonGroup,

  meta: {
    name: 'ButtonGroup',
    description: 'Groups related buttons together with consistent spacing and alignment. Useful for action bars, toolbars, and related button sets.',
    category: 'forms',
    status: 'stable',
    tags: ['button', 'group', 'toolbar', 'actions', 'layout'],
    since: '0.2.0',
  },

  usage: {
    when: [
      'Grouping related actions together',
      'Creating toolbars or action bars',
      'Form submit/cancel button pairs',
      'Pagination controls',
    ],
    whenNot: [
      'Unrelated buttons (use Stack instead)',
      'Navigation links (use nav element)',
      'Single button (no grouping needed)',
    ],
    guidelines: [
      'Keep button groups focused on related actions',
      'Use consistent button variants within a group',
      'Consider visual hierarchy - primary action should stand out',
      'Limit to 2-4 buttons per group for clarity',
      'Pass role/aria-label/id/data-* directly to ButtonGroup when you need semantic grouping hooks',
    ],
    accessibility: [
      'Group provides semantic relationship between buttons',
      'Each button remains individually focusable',
      'Consider using role="group" with aria-label for screen readers',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Button elements to group together',
      required: true,
    },
    gap: {
      type: 'enum',
      description: 'Spacing between buttons',
      values: ['none', 'xs', 'sm', 'md'],
      default: 'sm',
    },
    wrap: {
      type: 'boolean',
      description: 'Allow buttons to wrap to next line',
      default: 'false',
    },
    align: {
      type: 'enum',
      description: 'Alignment of buttons',
      values: ['start', 'center', 'end'],
    },
  },

  relations: [
    { component: 'Button', relationship: 'child', note: 'ButtonGroup contains Button components' },
    { component: 'Stack', relationship: 'alternative', note: 'Use Stack for more general layout needs' },
  ],

  contract: {
    propsSummary: [
      'children: ReactNode - buttons to group',
      'gap: none|xs|sm|md - spacing between buttons',
      'wrap: boolean - allow wrapping',
      'align: start|center|end - alignment',
      'Pass-through DOM props supported on root (id, role, aria-*, data-*, handlers)',
    ],
    scenarioTags: [
      'layout.group',
      'actions.toolbar',
      'buttons.related',
    ],
    a11yRules: ['A11Y_GROUP_LABEL'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic button group with default spacing',
      render: () => (
        <ButtonGroup>
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save</Button>
        </ButtonGroup>
      ),
    },
    {
      name: 'Gap Variants',
      description: 'Different spacing options',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ButtonGroup gap="none">
            <Button variant="secondary" size="sm">None</Button>
            <Button variant="secondary" size="sm">Gap</Button>
          </ButtonGroup>
          <ButtonGroup gap="xs">
            <Button variant="secondary" size="sm">XS</Button>
            <Button variant="secondary" size="sm">Gap</Button>
          </ButtonGroup>
          <ButtonGroup gap="sm">
            <Button variant="secondary" size="sm">SM</Button>
            <Button variant="secondary" size="sm">Gap</Button>
          </ButtonGroup>
          <ButtonGroup gap="md">
            <Button variant="secondary" size="sm">MD</Button>
            <Button variant="secondary" size="sm">Gap</Button>
          </ButtonGroup>
        </div>
      ),
    },
    {
      name: 'Alignment',
      description: 'Different alignment options',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
          <ButtonGroup align="start">
            <Button variant="secondary" size="sm">Start</Button>
            <Button variant="secondary" size="sm">Aligned</Button>
          </ButtonGroup>
          <ButtonGroup align="center">
            <Button variant="secondary" size="sm">Center</Button>
            <Button variant="secondary" size="sm">Aligned</Button>
          </ButtonGroup>
          <ButtonGroup align="end">
            <Button variant="secondary" size="sm">End</Button>
            <Button variant="secondary" size="sm">Aligned</Button>
          </ButtonGroup>
        </div>
      ),
    },
    {
      name: 'Form Actions',
      description: 'Common pattern for form submit/cancel',
      render: () => (
        <ButtonGroup align="end" role="group" aria-label="Form actions">
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Submit</Button>
        </ButtonGroup>
      ),
    },
  ],
});
