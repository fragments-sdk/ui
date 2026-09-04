import type { Meta, StoryObj } from '@storybook/react';
import { List } from '.';

/**
 * Compound component for ordered or unordered lists with consistent styling.
 * Compose with `List.Item`. Supports bullet, numbered, icon, and unstyled markers.
 */
const meta = {
  title: 'Display/List',
  component: List,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component: 'Renders ordered or unordered lists with consistent styling.',
      },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['ul', 'ol'],
      description: 'Underlying list element',
    },
    marker: {
      control: 'select',
      options: ['none', 'disc', 'decimal', 'icon'],
      description: 'Marker drawn before each item',
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Spacing between items',
    },
  },
  args: {
    marker: 'disc',
    gap: 'sm',
    children: (
      <>
        <List.Item>First item</List.Item>
        <List.Item>Second item</List.Item>
        <List.Item>Third item</List.Item>
      </>
    ),
  },
} satisfies Meta<typeof List>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bullet: Story = {
  args: { marker: 'disc' },
  render: (args) => (
    <List {...args}>
      <List.Item>First item</List.Item>
      <List.Item>Second item</List.Item>
      <List.Item>Third item</List.Item>
    </List>
  ),
};

export const Numbered: Story = {
  args: { as: 'ol', marker: 'decimal' },
  render: (args) => (
    <List {...args}>
      <List.Item>Create your account</List.Item>
      <List.Item>Configure your settings</List.Item>
      <List.Item>Start building</List.Item>
    </List>
  ),
};

export const IconList: Story = {
  args: { marker: 'icon' },
  render: (args) => (
    <List {...args}>
      <List.Item icon={<span aria-hidden>✓</span>}>Unlimited projects</List.Item>
      <List.Item icon={<span aria-hidden>✓</span>}>Priority support</List.Item>
      <List.Item icon={<span aria-hidden>✓</span>}>Advanced analytics</List.Item>
    </List>
  ),
};

export const Unstyled: Story = {
  args: { marker: 'none', gap: 'md' },
  render: (args) => (
    <List {...args}>
      <List.Item>Dashboard</List.Item>
      <List.Item>Settings</List.Item>
      <List.Item>Profile</List.Item>
    </List>
  ),
};
