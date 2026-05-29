import type { Meta, StoryObj } from '@storybook/react';
import { ButtonGroup } from '.';
import { Button } from '../Button';

/**
 * ButtonGroup groups related buttons together with consistent spacing and
 * alignment. Use it for action bars, toolbars, and form submit/cancel pairs.
 * It expects Button children.
 */
const meta = {
  title: 'Forms/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Groups related buttons together with consistent spacing and alignment.',
      },
    },
  },
  argTypes: {
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md'],
      description: 'Spacing between buttons',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Alignment of buttons',
    },
    wrap: {
      control: 'boolean',
      description: 'Allow buttons to wrap to next line',
    },
  },
  args: {
    gap: 'sm',
    children: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </>
    ),
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save</Button>
    </ButtonGroup>
  ),
};

export const Tight: Story = {
  render: () => (
    <ButtonGroup gap="none">
      <Button variant="secondary" size="sm">
        Bold
      </Button>
      <Button variant="secondary" size="sm">
        Italic
      </Button>
      <Button variant="secondary" size="sm">
        Underline
      </Button>
    </ButtonGroup>
  ),
};

export const AlignedEnd: Story = {
  render: () => (
    <ButtonGroup align="end">
      <Button variant="secondary" size="sm">
        End
      </Button>
      <Button variant="secondary" size="sm">
        Aligned
      </Button>
    </ButtonGroup>
  ),
};

export const FormActions: Story = {
  render: () => (
    <ButtonGroup align="end" role="group" aria-label="Form actions">
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Submit</Button>
    </ButtonGroup>
  ),
};
