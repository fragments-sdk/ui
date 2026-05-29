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
