import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '.';

/**
 * Card is a container for grouping related content into a distinct surface. It
 * is a compound component: compose Card.Header, Card.Title, Card.Description,
 * Card.Body, and Card.Footer inside the root.
 */
const meta = {
  title: 'Layout/Card',
  component: Card,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: { component: 'Container for grouping related content.' },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'outline', 'elevated'],
      description: 'Visual style of the card surface',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Internal padding size',
    },
    as: {
      control: 'select',
      options: ['article', 'div', 'section'],
      description: 'Semantic HTML element for the card root',
    },
  },
  args: {
    variant: 'default',
    padding: 'md',
    children: (
      <>
        <Card.Header>
          <Card.Title>Card Title</Card.Title>
          <Card.Description>A brief description</Card.Description>
        </Card.Header>
        <Card.Body>Card content goes here.</Card.Body>
      </>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Card.Title>Card Title</Card.Title>
        <Card.Description>A brief description</Card.Description>
      </Card.Header>
      <Card.Body>Card content goes here.</Card.Body>
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined">
      <Card.Header>
        <Card.Title>Outlined Card</Card.Title>
      </Card.Header>
      <Card.Body>Content with border.</Card.Body>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated">
      <Card.Header>
        <Card.Title>Featured Item</Card.Title>
      </Card.Header>
      <Card.Body>Important content.</Card.Body>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Card.Title>Card with Footer</Card.Title>
        <Card.Description>Complete card layout</Card.Description>
      </Card.Header>
      <Card.Body>Main content area.</Card.Body>
      <Card.Footer>Footer actions go here</Card.Footer>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Card>
      <Card.Body>Just content, no header or footer.</Card.Body>
    </Card>
  ),
};
