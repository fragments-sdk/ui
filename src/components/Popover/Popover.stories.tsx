import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from '.';

/**
 * Rich content overlay anchored to a trigger element. Compose with
 * `Popover.Trigger`, `Popover.Content`, `Popover.Title`, `Popover.Description`,
 * `Popover.Body`, `Popover.Footer`, and `Popover.Close`.
 */
const meta = {
  title: 'Feedback/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Floating content overlay anchored to a trigger element.',
      },
    },
  },
  argTypes: {
    modal: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
  },
  args: {
    modal: false,
    children: (
      <>
        <Popover.Trigger>Open Popover</Popover.Trigger>
        <Popover.Content>
          <Popover.Close />
          <Popover.Title>Popover Title</Popover.Title>
          <Popover.Description>
            This is a popover with some content.
          </Popover.Description>
        </Popover.Content>
      </>
    ),
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger>Open Popover</Popover.Trigger>
      <Popover.Content>
        <Popover.Close />
        <Popover.Title>Popover Title</Popover.Title>
        <Popover.Description>
          This is a popover with some content. It can contain text, forms, or
          other elements.
        </Popover.Description>
      </Popover.Content>
    </Popover>
  ),
};

export const WithArrow: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger>Info</Popover.Trigger>
      <Popover.Content arrow>
        <Popover.Title>Quick Tip</Popover.Title>
        <Popover.Description>
          This popover has an arrow pointing to its trigger element.
        </Popover.Description>
      </Popover.Content>
    </Popover>
  ),
};

export const TopSide: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger>Top</Popover.Trigger>
      <Popover.Content side="top" size="sm">
        <Popover.Description>Popover on top</Popover.Description>
      </Popover.Content>
    </Popover>
  ),
};

export const SmallSize: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger>Compact</Popover.Trigger>
      <Popover.Content size="sm">
        <Popover.Description>A small, focused popover.</Popover.Description>
      </Popover.Content>
    </Popover>
  ),
};
