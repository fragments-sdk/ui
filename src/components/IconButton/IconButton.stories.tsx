import type { Meta, StoryObj } from '@storybook/react';
import { Gear, Trash, Plus, DotsThree } from '@phosphor-icons/react';
import { IconButton } from '.';

/**
 * IconButton is a compact square button for icon-only affordances such as
 * topbar actions, row controls, and workspace rails. Icon-only buttons need an
 * accessible name, so always provide an aria-label describing the action.
 */
const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Compact square button for icon-only affordances in dense chrome.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['ghost', 'subtle', 'outlined'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    pressed: {
      control: 'boolean',
      description: 'Mark as pressed for toggle-style affordances',
    },
  },
  args: {
    variant: 'ghost',
    size: 'md',
    'aria-label': 'Settings',
    children: <Gear />,
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ghost: Story = {
  args: { variant: 'ghost', 'aria-label': 'More options', children: <DotsThree /> },
};

export const Subtle: Story = {
  args: { variant: 'subtle', 'aria-label': 'Add item', children: <Plus /> },
};

export const Outlined: Story = {
  args: { variant: 'outlined', 'aria-label': 'Settings', children: <Gear /> },
};

export const Pressed: Story = {
  args: {
    variant: 'subtle',
    pressed: true,
    'aria-label': 'Toggle setting',
    children: <Gear />,
  },
};

export const Destructive: Story = {
  args: {
    variant: 'outlined',
    size: 'lg',
    'aria-label': 'Delete',
    children: <Trash />,
  },
};
