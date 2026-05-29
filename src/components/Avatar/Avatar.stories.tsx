import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '.';

/**
 * Avatar is the visual representation of a user or entity. It renders an image
 * when available and falls back to initials or a placeholder icon. Use
 * Avatar.Group to stack multiple avatars in a row.
 */
const meta = {
  title: 'Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: { component: 'Visual representation of a user or entity.' },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size variant',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Shape variant',
    },
    src: { control: 'text', description: 'Image source URL' },
    name: { control: 'text', description: 'Full name - used to generate initials' },
    initials: { control: 'text', description: 'Fallback initials (1-2 characters)' },
  },
  args: {
    name: 'Jane Doe',
    size: 'md',
    shape: 'circle',
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?u=jane',
    alt: 'Jane Doe',
    name: 'Jane Doe',
  },
};

export const WithInitials: Story = {
  args: { name: 'John Smith' },
};

export const Large: Story = {
  args: { name: 'Conan McNicholl', size: 'xl' },
};

export const Square: Story = {
  args: { name: 'App', shape: 'square' },
};

export const Group: Story = {
  render: () => (
    <Avatar.Group max={3} size="md">
      <Avatar name="Alice Johnson" />
      <Avatar name="Bob Smith" />
      <Avatar name="Carol Williams" />
      <Avatar name="David Brown" />
      <Avatar name="Eve Davis" />
    </Avatar.Group>
  ),
};
