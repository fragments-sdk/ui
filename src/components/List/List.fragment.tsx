import React from 'react';
import { defineSegment } from '@fragments/core';
import { List } from './index.js';
import { Check, Star, ArrowRight } from '@phosphor-icons/react';

export default defineSegment({
  component: List,

  meta: {
    name: 'List',
    description: 'Compound component for rendering ordered or unordered lists with consistent styling. Supports bullet, numbered, and icon-prefixed items.',
    category: 'display',
    status: 'stable',
    tags: ['list', 'items', 'bullet', 'ordered', 'unordered'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Feature lists with checkmarks or icons',
      'Ordered steps or instructions',
      'Navigation lists in sidebars',
      'Pricing plan feature comparisons',
    ],
    whenNot: [
      'Interactive selection lists (use Menu or Select)',
      'Data tables with columns (use Table)',
      'Cards in a grid (use Grid with Card)',
      'Navigation tabs (use Tabs)',
    ],
    guidelines: [
      'Use as="ol" for sequential or numbered content',
      'Use variant="icon" with meaningful icons for feature lists',
      'Keep list items concise and parallel in structure',
      'Use consistent icons within a single list',
    ],
    accessibility: [
      'Use semantic list elements (ul, ol) for screen reader support',
      'List items are automatically announced with count',
      'Icons are decorative; ensure text conveys meaning',
      'Avoid deeply nested lists (3+ levels)',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'List.Item components',
      required: true,
    },
    as: {
      type: 'enum',
      description: 'List type',
      values: ['ul', 'ol'],
      default: 'ul',
    },
    variant: {
      type: 'enum',
      description: 'List style variant',
      values: ['none', 'disc', 'decimal', 'icon'],
      default: 'disc',
    },
    gap: {
      type: 'enum',
      description: 'Spacing between items',
      values: ['none', 'xs', 'sm', 'md', 'lg'],
      default: 'sm',
    },
  },

  relations: [
    { component: 'Icon', relationship: 'child', note: 'Use Icon as List.Item icon prop' },
    { component: 'Stack', relationship: 'alternative', note: 'Use Stack for non-semantic vertical lists' },
  ],

  contract: {
    propsSummary: [
      'children: List.Item[] - list items (required)',
      'as: ul|ol - list type',
      'variant: none|disc|decimal|icon - list style',
      'gap: none|xs|sm|md|lg - item spacing',
    ],
    subComponents: [
      {
        name: 'List.Item',
        props: [
          'children: ReactNode - item content',
          'icon: ReactNode - icon for variant="icon"',
        ],
      },
    ],
    scenarioTags: [
      'content.list',
      'layout.vertical',
      'display.items',
    ],
    a11yRules: ['A11Y_LIST_SEMANTIC', 'A11Y_LIST_NESTING'],
  },

  variants: [
    {
      name: 'Bullet List',
      description: 'Default unordered list with bullets',
      render: () => (
        <List variant="disc">
          <List.Item>First item</List.Item>
          <List.Item>Second item</List.Item>
          <List.Item>Third item</List.Item>
        </List>
      ),
    },
    {
      name: 'Numbered List',
      description: 'Ordered list with numbers',
      render: () => (
        <List as="ol" variant="decimal">
          <List.Item>Create your account</List.Item>
          <List.Item>Configure your settings</List.Item>
          <List.Item>Start building</List.Item>
        </List>
      ),
    },
    {
      name: 'Icon List',
      description: 'List with custom icons per item',
      render: () => (
        <List variant="icon">
          <List.Item icon={<Check weight="bold" color="var(--fui-color-success)" />}>
            Unlimited projects
          </List.Item>
          <List.Item icon={<Check weight="bold" color="var(--fui-color-success)" />}>
            Priority support
          </List.Item>
          <List.Item icon={<Check weight="bold" color="var(--fui-color-success)" />}>
            Advanced analytics
          </List.Item>
        </List>
      ),
    },
    {
      name: 'No Style',
      description: 'Plain list without markers',
      render: () => (
        <List variant="none" gap="md">
          <List.Item>Dashboard</List.Item>
          <List.Item>Settings</List.Item>
          <List.Item>Profile</List.Item>
        </List>
      ),
    },
  ],
});
