import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from '.';

/**
 * ScrollArea is a styled scrollable container with thin scrollbars and
 * optional fade indicators. Use orientation to constrain scroll direction
 * and showFades to hint at content beyond the viewport.
 */
const meta = {
  title: 'Layout/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Styled scrollable container with thin scrollbars and optional fade indicators.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical', 'both'],
      description: 'Scroll direction',
    },
    scrollbarVisibility: {
      control: 'select',
      options: ['auto', 'always', 'hover'],
      description: 'When to show the scrollbar',
    },
    showFades: {
      control: 'boolean',
      description: 'Show gradient fade indicators at scroll edges',
    },
  },
  args: {
    orientation: 'vertical',
    scrollbarVisibility: 'auto',
    showFades: false,
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i}>Row {i + 1}</div>
        ))}
      </div>
    ),
  },
  render: (args) => (
    <ScrollArea {...args} style={{ height: 160, width: 280 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i}>Row {i + 1}</div>
        ))}
      </div>
    </ScrollArea>
  ),
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <ScrollArea {...args} style={{ width: 280 }}>
      <div style={{ display: 'flex', gap: 8, padding: 8 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ flex: '0 0 auto' }}>
            Chip {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const WithFades: Story = {
  args: { orientation: 'horizontal', showFades: true },
  render: (args) => (
    <ScrollArea {...args} style={{ width: 280 }}>
      <div style={{ display: 'flex', gap: 8, padding: 8 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ flex: '0 0 auto' }}>
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const HoverScrollbar: Story = {
  args: { scrollbarVisibility: 'hover' },
};

const geometryContent = Array.from({ length: 18 }, (_, index) => (
  <button key={index} type="button" style={{ flex: '0 0 auto' }}>
    Item {index + 1}
  </button>
));

/** Independent-axis, direction, nesting, and visibility evidence. */
export const GeometryMatrix: Story = {
  args: { showFades: true },
  render: () => (
    <div
      data-geometry-root="scroll-area"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}
    >
      {(['auto', 'always', 'hover'] as const).map((visibility) => (
        <ScrollArea
          key={visibility}
          orientation="horizontal"
          scrollbarVisibility={visibility}
          showFades
          style={{ width: 280, height: 96 }}
        >
          <div style={{ display: 'flex', gap: 8, padding: 8 }}>{geometryContent}</div>
        </ScrollArea>
      ))}

      <ScrollArea orientation="vertical" showFades style={{ width: 280, height: 160 }}>
        <div style={{ display: 'grid', gap: 8, padding: 8 }}>{geometryContent}</div>
      </ScrollArea>

      <ScrollArea orientation="both" showFades style={{ width: 280, height: 160 }}>
        <div style={{ display: 'grid', gap: 8, padding: 8, width: 560 }}>{geometryContent}</div>
      </ScrollArea>

      <ScrollArea orientation="both" dir="rtl" showFades style={{ width: 280, height: 160 }}>
        <div style={{ display: 'grid', gap: 8, padding: 8, width: 560 }}>{geometryContent}</div>
      </ScrollArea>

      <ScrollArea orientation="vertical" showFades style={{ width: 280, height: 160 }}>
        <div style={{ display: 'grid', gap: 8, padding: 8 }}>
          <span>Nested same-axis area</span>
          <ScrollArea orientation="vertical" showFades style={{ height: 96 }}>
            <div style={{ display: 'grid', gap: 8, padding: 8 }}>{geometryContent}</div>
          </ScrollArea>
          <ScrollArea orientation="horizontal" showFades>
            <div style={{ display: 'flex', gap: 8, padding: 8 }}>{geometryContent}</div>
          </ScrollArea>
        </div>
      </ScrollArea>
    </div>
  ),
};
