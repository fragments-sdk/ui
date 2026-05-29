import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from '.';
import { Button } from '../Button';

/**
 * Tooltip is the canonical contextual-hint primitive. Wrap a focusable trigger
 * to surface brief help on hover or focus — explaining icon-only buttons,
 * truncated text, or shortcuts. Agents should reuse it rather than building a
 * positioned hover popup; use Popover for interactive or longer content.
 */
const meta = {
  title: 'Feedback/Tooltip',
  component: Tooltip,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Contextual help text that appears on hover or focus. Prefer this over a hand-rolled hover popup; use Popover for interactive content.',
      },
    },
  },
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Which side to show the tooltip',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Alignment along the side',
    },
    sideOffset: { control: 'number', description: 'Distance from trigger in pixels' },
    arrow: { control: 'boolean', description: 'Show arrow pointing to trigger' },
    disabled: { control: 'boolean', description: 'Disable the tooltip' },
  },
  args: {
    content: 'Save your changes',
    side: 'top',
    align: 'center',
    arrow: true,
    children: <Button>Save</Button>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { content: 'Save your changes' },
  render: (args) => (
    <Tooltip {...args}>
      <Button>Save</Button>
    </Tooltip>
  ),
};

export const Positions: Story = {
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
};

export const WithShortcut: Story = {
  args: { content: 'Undo (Ctrl+Z)' },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="ghost">Undo</Button>
    </Tooltip>
  ),
};

export const NoArrow: Story = {
  args: { content: 'Clean tooltip', arrow: false },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary">Hover me</Button>
    </Tooltip>
  ),
};
