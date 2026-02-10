import React from 'react';
import { defineFragment } from '@fragments/core';
import { Icon } from '.';
import { Heart, Star, Check, Warning, Info } from '@phosphor-icons/react';

export default defineFragment({
  component: Icon,

  meta: {
    name: 'Icon',
    description: 'Wrapper for Phosphor icons with consistent sizing and semantic colors. Provides standardized icon rendering across the design system.',
    category: 'display',
    status: 'stable',
    tags: ['icon', 'phosphor', 'visual', 'symbol', 'graphic'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Displaying UI icons alongside text or in buttons',
      'Indicating status or state visually',
      'Adding visual hierarchy to feature lists',
      'Decorating cards or stats with relevant symbols',
    ],
    whenNot: [
      'Large decorative illustrations (use Image or custom SVG)',
      'Logo display (use dedicated Logo component)',
      'Complex graphics with multiple colors',
      'Animated icons (use custom implementation)',
    ],
    guidelines: [
      'Use semantic color variants (success, error, warning) for status indication',
      'Pair icons with text labels for accessibility',
      'Match icon weight to surrounding text weight for visual consistency',
      'Use consistent sizes within the same context',
    ],
    accessibility: [
      'Icons are decorative by default (aria-hidden)',
      'Always pair with visible or visually-hidden text for meaning',
      'Do not rely on color alone to convey information',
      'Consider using VisuallyHidden for icon-only buttons',
    ],
  },

  props: {
    icon: {
      type: 'custom',
      description: 'Phosphor icon component to render',
      required: true,
    },
    size: {
      type: 'enum',
      description: 'Icon size',
      values: ['xs', 'sm', 'md', 'lg', 'xl'],
      default: 'md',
    },
    weight: {
      type: 'enum',
      description: 'Icon stroke weight/style',
      values: ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'],
      default: 'regular',
    },
    variant: {
      type: 'enum',
      description: 'Semantic color variant',
      values: ['default', 'primary', 'secondary', 'tertiary', 'accent', 'success', 'warning', 'error'],
      default: 'default',
    },
    color: {
      type: 'enum',
      description: 'Deprecated alias for variant',
      values: ['primary', 'secondary', 'tertiary', 'accent', 'success', 'warning', 'error'],
    },
  },

  relations: [
    { component: 'Button', relationship: 'child', note: 'Use inside icon-only buttons with VisuallyHidden label' },
    { component: 'VisuallyHidden', relationship: 'sibling', note: 'Pair with VisuallyHidden for accessible icon-only elements' },
    { component: 'Badge', relationship: 'child', note: 'Can be used as badge icon prop' },
  ],

  contract: {
    propsSummary: [
      'icon: PhosphorIcon - icon component (required)',
      'size: xs|sm|md|lg|xl - icon size',
      'weight: thin|light|regular|bold|fill|duotone - stroke style',
      'variant: default|primary|secondary|tertiary|accent|success|warning|error - color',
    ],
    scenarioTags: [
      'display.icon',
      'feedback.status',
      'decoration.visual',
    ],
    a11yRules: ['A11Y_ICON_LABEL', 'A11Y_COLOR_CONTRAST'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic icon with default styling',
      render: () => <Icon icon={Heart} />,
    },
    {
      name: 'Sizes',
      description: 'Available size options',
      render: () => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Icon icon={Star} size="xs" />
          <Icon icon={Star} size="sm" />
          <Icon icon={Star} size="md" />
          <Icon icon={Star} size="lg" />
          <Icon icon={Star} size="xl" />
        </div>
      ),
    },
    {
      name: 'Semantic Colors',
      description: 'Status and semantic color variants',
      render: () => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Icon icon={Check} variant="success" />
          <Icon icon={Warning} variant="warning" />
          <Icon icon={Warning} variant="error" />
          <Icon icon={Info} variant="accent" />
        </div>
      ),
    },
    {
      name: 'Weights',
      description: 'Icon weight/style options',
      render: () => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Icon icon={Heart} weight="thin" />
          <Icon icon={Heart} weight="light" />
          <Icon icon={Heart} weight="regular" />
          <Icon icon={Heart} weight="bold" />
          <Icon icon={Heart} weight="fill" />
          <Icon icon={Heart} weight="duotone" />
        </div>
      ),
    },
  ],
});
