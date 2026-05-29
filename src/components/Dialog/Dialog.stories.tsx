import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from '.';
import { Button } from '../Button';

/**
 * Modal overlay for focused user interactions such as confirmations and
 * forms. Compose Dialog.Trigger, Dialog.Content, Dialog.Header, Dialog.Body,
 * Dialog.Footer, and Dialog.Close. Supports controlled open and modal mode.
 */
const meta = {
  title: 'Feedback/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Modal overlay for focused user interactions.',
      },
    },
  },
  argTypes: {
    defaultOpen: { control: 'boolean', description: 'Default open state' },
    modal: {
      control: 'boolean',
      description: 'Block interaction with the rest of the page',
    },
  },
  args: {
    modal: true,
    defaultOpen: false,
    children: (
      <>
        <Dialog.Trigger asChild>
          <Button>Open Dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Close />
          <Dialog.Header>
            <Dialog.Title>Dialog Title</Dialog.Title>
            <Dialog.Description>
              A brief description of what this dialog is for.
            </Dialog.Description>
          </Dialog.Header>
        </Dialog.Content>
      </>
    ),
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Trigger asChild>
        <Button>Open Dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Close />
        <Dialog.Header>
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Description>
            A brief description of what this dialog is for.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <p>Dialog content goes here.</p>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Button variant="primary">Confirm</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
};

export const Confirmation: Story = {
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Trigger asChild>
        <Button variant="danger">Delete Item</Button>
      </Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Header>
          <Dialog.Title>Delete item?</Dialog.Title>
          <Dialog.Description>
            This action cannot be undone. The item will be permanently removed.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Button variant="danger">Delete</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
};

export const Large: Story = {
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Trigger asChild>
        <Button>Open Large Dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content size="lg">
        <Dialog.Close />
        <Dialog.Header>
          <Dialog.Title>Settings</Dialog.Title>
          <Dialog.Description>
            Configure your application preferences.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <p>This dialog has more space for complex forms or layouts.</p>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Button variant="primary">Save Changes</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
};

export const OpenByDefault: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Dialog {...args}>
      <Dialog.Content size="sm">
        <Dialog.Close />
        <Dialog.Header>
          <Dialog.Title>Welcome</Dialog.Title>
          <Dialog.Description>
            This dialog is open when the story first renders.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="secondary">Close</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  ),
};
