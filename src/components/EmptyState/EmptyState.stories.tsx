import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from '.';
import { Button } from '../Button';

/**
 * EmptyState is a placeholder for empty content areas, providing context,
 * guidance, and actions when no data is available. It is a compound component:
 * compose EmptyState.Icon, EmptyState.Title, EmptyState.Description, and
 * EmptyState.Actions inside the root.
 */
const meta = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Placeholder for empty content areas with context, guidance, and actions.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
  },
  args: {
    size: 'md',
    children: (
      <>
        <EmptyState.Title>No projects yet</EmptyState.Title>
        <EmptyState.Description>
          Get started by creating your first project.
        </EmptyState.Description>
      </>
    ),
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <EmptyState>
      <EmptyState.Title>No projects yet</EmptyState.Title>
      <EmptyState.Description>
        Get started by creating your first project.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button>Create Project</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
};

export const NoResults: Story = {
  render: () => (
    <EmptyState>
      <EmptyState.Title>No results found</EmptyState.Title>
      <EmptyState.Description>
        Try adjusting your search terms or filters.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button variant="secondary">Clear Filters</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
};

export const Small: Story = {
  render: () => (
    <EmptyState size="sm">
      <EmptyState.Title>No items</EmptyState.Title>
      <EmptyState.Description>Add items to see them here.</EmptyState.Description>
    </EmptyState>
  ),
};

export const Large: Story = {
  render: () => (
    <EmptyState size="lg">
      <EmptyState.Title>Welcome to your workspace</EmptyState.Title>
      <EmptyState.Description>
        This is where your projects will appear. Create your first project to get
        started.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button>Create Your First Project</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
};
