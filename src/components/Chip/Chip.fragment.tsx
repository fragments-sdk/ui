import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Chip } from '.';

export default defineFragment({
  component: Chip,

  meta: {
    name: 'Chip',
    description: 'Interactive pill-shaped element for filtering, selecting, and tagging. Supports single and multi-select via Chip.Group.',
    category: 'forms',
    status: 'stable',
    tags: ['chip', 'tag', 'filter', 'selection', 'multi-select', 'action'],
    since: '0.7.0',
  },

  usage: {
    when: [
      'Filtering content by categories or tags',
      'Multi-select scenarios like choosing interests or skills',
      'Toggling options in a compact pill-shaped control',
      'Displaying removable user-applied filters',
    ],
    whenNot: [
      'Display-only status labels (use Badge)',
      'Navigation between views (use Tabs)',
      'Binary on/off state (use Switch)',
      'Primary call-to-action (use Button)',
    ],
    guidelines: [
      'Keep chip labels short (1-3 words)',
      'Use Chip.Group for multi-select sets with shared state',
      'Use onRemove only when users should be able to dismiss the chip',
      'Pair avatar chips with user-related selections (assignees, reviewers)',
      'Provide an explicit value on Chip when using non-string/custom JSX children inside Chip.Group',
    ],
    accessibility: [
      'Chips are buttons and use aria-pressed for selection state',
      'Chip.Group is a grouping wrapper; add role/aria-label when needed for assistive context',
      'Remove buttons include descriptive aria-label with chip text',
      'Disabled chips are properly excluded from interaction',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Chip label text',
      required: true,
    },
    variant: {
      type: 'enum',
      description: 'Visual style variant',
      values: ['filled', 'outlined', 'outline', 'soft'],
      default: 'filled',
    },
    size: {
      type: 'enum',
      description: 'Chip size',
      values: ['sm', 'md'],
      default: 'md',
    },
    selected: {
      type: 'boolean',
      description: 'Whether the chip is in a selected state',
      default: 'false',
    },
    icon: {
      type: 'node',
      description: 'Icon element rendered before the label',
    },
    avatar: {
      type: 'node',
      description: 'Avatar element rendered before the label',
    },
    onRemove: {
      type: 'function',
      description: 'Makes chip removable. Called when X is clicked.',
    },
    value: {
      type: 'string',
      description: 'Value identifier used by Chip.Group for selection tracking',
    },
  },

  relations: [
    { component: 'Badge', relationship: 'sibling', note: 'Badge is display-only; Chip is interactive' },
    { component: 'ToggleGroup', relationship: 'alternative', note: 'Use ToggleGroup for mutually exclusive options' },
    { component: 'Button', relationship: 'alternative', note: 'Use Button for primary actions, Chip for selection/filtering' },
  ],

  contract: {
    propsSummary: [
      'children: ReactNode - chip label (required)',
      'variant: filled|outlined|outline|soft - visual style',
      'size: sm|md - chip size',
      'selected: boolean - selection state',
      'icon/avatar: ReactNode - leading visual',
      'onRemove: () => void - makes chip removable',
      'value: string - identifier for Chip.Group',
      'Chip.Group forwards DOM props (id, role, aria-*, data-*, handlers)',
      'Chip.Group: non-string chip labels should set an explicit value',
    ],
    scenarioTags: [
      'actions.filter',
      'actions.select',
      'actions.tag',
      'input.multi-select',
    ],
    a11yRules: ['A11Y_CHIP_SELECTION', 'A11Y_CHIP_DISMISS'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic filled chip',
      render: () => <Chip>Default</Chip>,
    },
    {
      name: 'Outline',
      description: 'Chip with border using the "outline" alias for "outlined"',
      render: () => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Chip variant="outline">Outline</Chip>
          <Chip variant="outline" selected>Outline Selected</Chip>
        </div>
      ),
    },
    {
      name: 'Selected',
      description: 'Chip in selected state across variants',
      render: () => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Chip selected>Filled</Chip>
          <Chip variant="outlined" selected>Outlined</Chip>
          <Chip variant="soft" selected>Soft</Chip>
        </div>
      ),
    },
    {
      name: 'With Avatar',
      description: 'Chip with a leading avatar image',
      render: () => (
        <Chip avatar={<img src="https://i.pravatar.cc/32?u=chip" alt="" />}>
          Jane Doe
        </Chip>
      ),
    },
    {
      name: 'With Remove',
      description: 'Removable chip with dismiss button',
      render: () => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Chip onRemove={() => {}}>React</Chip>
          <Chip onRemove={() => {}}>TypeScript</Chip>
          <Chip onRemove={() => {}}>SCSS</Chip>
        </div>
      ),
    },
    {
      name: 'Chip Group',
      description: 'Multi-select chip set with shared state',
      render: () => (
        <Chip.Group defaultValue={['react']}>
          <Chip value="react">React</Chip>
          <Chip value="vue">Vue</Chip>
          <Chip value="angular">Angular</Chip>
          <Chip value="svelte">Svelte</Chip>
        </Chip.Group>
      ),
    },
    {
      name: 'Chip Group with Custom Labels',
      description: 'Use explicit values when chip labels are custom JSX',
      render: () => (
        <Chip.Group aria-label="Assignees">
          <Chip value="jane">
            <span>Jane Doe</span>
          </Chip>
          <Chip value="sam">
            <span>Sam Lee</span>
          </Chip>
        </Chip.Group>
      ),
    },
    {
      name: 'Disabled',
      description: 'Chip in disabled state',
      render: () => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Chip disabled>Disabled</Chip>
          <Chip disabled selected>Disabled Selected</Chip>
        </div>
      ),
    },
  ],
});
