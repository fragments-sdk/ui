import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from '.';
import { Button } from '../Button';

/**
 * Drawer is a panel that slides in from a screen edge, extending the Dialog
 * pattern with slide animations and edge positioning. It is a compound
 * component: compose Drawer.Trigger, Drawer.Content, Drawer.Header,
 * Drawer.Body, and Drawer.Footer inside the root.
 */
const meta = {
  title: 'Feedback/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Slide-in panel for navigation, forms, or supplementary content.',
      },
    },
  },
  argTypes: {
    open: { control: 'boolean', description: 'Controlled open state' },
    defaultOpen: {
      control: 'boolean',
      description: 'Default open state (uncontrolled)',
    },
    modal: {
      control: 'boolean',
      description: 'Whether the drawer blocks interaction with the page',
    },
  },
  args: {
    modal: true,
    children: (
      <>
        <Drawer.Trigger asChild>
          <Button>Open Drawer</Button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Close />
          <Drawer.Header>
            <Drawer.Title>Drawer Title</Drawer.Title>
            <Drawer.Description>
              A panel sliding in from the right.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body>
            <p>Drawer content goes here.</p>
          </Drawer.Body>
        </Drawer.Content>
      </>
    ),
  },
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button>Open Drawer</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Close />
        <Drawer.Header>
          <Drawer.Title>Drawer Title</Drawer.Title>
          <Drawer.Description>
            A panel sliding in from the right.
          </Drawer.Description>
        </Drawer.Header>
        <Drawer.Body>
          <p>Drawer content goes here.</p>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button variant="primary">Save</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  ),
};

export const LeftSide: Story = {
  render: () => (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button variant="secondary">Open Left</Button>
      </Drawer.Trigger>
      <Drawer.Content side="left">
        <Drawer.Close />
        <Drawer.Header>
          <Drawer.Title>Navigation</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <p>Left-side drawer for navigation or filters.</p>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  ),
};

export const BottomSheet: Story = {
  render: () => (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button variant="secondary">Open Bottom Sheet</Button>
      </Drawer.Trigger>
      <Drawer.Content side="bottom" size="sm">
        <Drawer.Header>
          <Drawer.Title>Actions</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <p>Bottom sheet for mobile-style actions.</p>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  ),
};

export const NonModal: Story = {
  render: () => (
    <Drawer modal={false}>
      <Drawer.Trigger asChild>
        <Button>Open Non-Modal</Button>
      </Drawer.Trigger>
      <Drawer.Content side="right" size="md">
        <Drawer.Close />
        <Drawer.Header>
          <Drawer.Title>Details</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <p>The rest of the page stays interactive.</p>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  ),
};
