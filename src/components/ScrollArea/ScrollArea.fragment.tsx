import React from 'react';
import { defineFragment } from '@fragments/core';
import { ScrollArea } from '.';

const tags = ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4', 'Tag 5', 'Tag 6', 'Tag 7', 'Tag 8', 'Tag 9', 'Tag 10', 'Tag 11', 'Tag 12', 'Tag 13', 'Tag 14', 'Tag 15'];

export default defineFragment({
  component: ScrollArea,

  meta: {
    name: 'ScrollArea',
    description: 'A styled scrollable container with thin scrollbars and optional fade indicators.',
    category: 'layout',
    status: 'stable',
    tags: ['scroll', 'overflow', 'scrollbar', 'container', 'layout'],
    since: '0.4.0',
  },

  usage: {
    when: [
      'Content overflows its container and needs scrolling',
      'Horizontal tab bars or chip lists that may overflow',
      'Scrollable panels, sidebars, or dropdown content',
      'Any area where native scrollbars look too heavy',
    ],
    whenNot: [
      'Page-level scrolling (use native body scroll)',
      'Very short content that never overflows',
    ],
    guidelines: [
      'Use `orientation` to constrain scroll direction',
      'Use `showFades` to hint at hidden content beyond the viewport',
      'The `hover` scrollbar visibility keeps the UI clean until the user interacts',
      'Combine with `orientation="horizontal"` for tab bars and chip rows',
    ],
    accessibility: [
      'Preserves native scroll behavior and keyboard support',
      'Scrollbar is visible on focus for keyboard users',
      'Respects prefers-reduced-motion for fade transitions',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Scrollable content',
      required: true,
    },
    orientation: {
      type: 'enum',
      description: 'Scroll direction',
      values: ['horizontal', 'vertical', 'both'],
      default: 'vertical',
    },
    scrollbarVisibility: {
      type: 'enum',
      description: 'When to show the scrollbar',
      values: ['auto', 'always', 'hover'],
      default: 'auto',
    },
    showFades: {
      type: 'boolean',
      description: 'Show gradient fade indicators at scroll edges',
      default: false,
    },
  },

  contract: {
    propsSummary: [
      'orientation: horizontal|vertical|both - scroll direction',
      'scrollbarVisibility: auto|always|hover - scrollbar display mode',
      'showFades: boolean - gradient edge indicators',
    ],
    scenarioTags: ['layout.scroll', 'container.scroll'],
    a11yRules: [],
  },

  ai: {
    compositionPattern: 'wrapper',
    requiredChildren: [],
    commonPatterns: [
      '<ScrollArea orientation="horizontal"><div style={{ display: "flex", gap: 8 }}>{items}</div></ScrollArea>',
      '<ScrollArea style={{ height: 300 }}>{longContent}</ScrollArea>',
    ],
  },

  variants: [
    {
      name: 'Vertical',
      description: 'Vertical scrollable area with thin scrollbar.',
      code: `<ScrollArea style={{ height: '200px' }}>
  {/* Long content */}
</ScrollArea>`,
      render: () => (
        <div style={{ height: '200px', width: '300px', border: '1px solid var(--fui-border)' }}>
          <ScrollArea style={{ height: '200px' }}>
            <div style={{ padding: '16px' }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <p key={i} style={{ margin: '0 0 12px', color: 'var(--fui-text-secondary)', fontSize: '14px' }}>
                  Item {i + 1} — Lorem ipsum dolor sit amet
                </p>
              ))}
            </div>
          </ScrollArea>
        </div>
      ),
    },
    {
      name: 'Horizontal',
      description: 'Horizontal scrollable area for overflowing inline content like tabs or chips.',
      code: `<ScrollArea orientation="horizontal">
  <div style={{ display: 'flex', gap: '8px' }}>
    {tags.map(tag => <Chip key={tag}>{tag}</Chip>)}
  </div>
</ScrollArea>`,
      render: () => (
        <div style={{ width: '400px', border: '1px solid var(--fui-border)', borderRadius: '8px' }}>
          <ScrollArea orientation="horizontal">
            <div style={{ display: 'flex', gap: '8px', padding: '12px', whiteSpace: 'nowrap' }}>
              {tags.map(tag => (
                <span key={tag} style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--fui-bg-secondary)',
                  color: 'var(--fui-text-secondary)',
                  fontSize: '13px',
                  flexShrink: 0,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </ScrollArea>
        </div>
      ),
    },
    {
      name: 'With Fades',
      description: 'Fade indicators show when content is scrollable in either direction.',
      code: `<ScrollArea orientation="horizontal" showFades>
  {/* Overflowing content */}
</ScrollArea>`,
      render: () => (
        <div style={{ width: '400px', border: '1px solid var(--fui-border)', borderRadius: '8px' }}>
          <ScrollArea orientation="horizontal" showFades>
            <div style={{ display: 'flex', gap: '8px', padding: '12px', whiteSpace: 'nowrap' }}>
              {tags.map(tag => (
                <span key={tag} style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--fui-bg-secondary)',
                  color: 'var(--fui-text-secondary)',
                  fontSize: '13px',
                  flexShrink: 0,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </ScrollArea>
        </div>
      ),
    },
    {
      name: 'Hover Scrollbar',
      description: 'Scrollbar is hidden until the user hovers over the scroll area.',
      code: `<ScrollArea scrollbarVisibility="hover" style={{ height: '200px' }}>
  {/* Content */}
</ScrollArea>`,
      render: () => (
        <div style={{ height: '200px', width: '300px', border: '1px solid var(--fui-border)' }}>
          <ScrollArea scrollbarVisibility="hover" style={{ height: '200px' }}>
            <div style={{ padding: '16px' }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <p key={i} style={{ margin: '0 0 12px', color: 'var(--fui-text-secondary)', fontSize: '14px' }}>
                  Item {i + 1} — Hover to reveal scrollbar
                </p>
              ))}
            </div>
          </ScrollArea>
        </div>
      ),
    },
  ],
});
