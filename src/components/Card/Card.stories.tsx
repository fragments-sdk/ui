import type { Meta, StoryObj } from "@storybook/react";
import { Card } from ".";
import { Progress } from "../Progress";
import { Stack } from "../Stack";
import { Text } from "../Text";

/**
 * Card is a container for grouping related content into a distinct surface. It
 * is a compound component: compose Card.Header, Card.Title, Card.Description,
 * Card.Body, and Card.Footer inside the root.
 */
const meta = {
  title: "Layout/Card",
  component: Card,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: { component: "Container for grouping related content." },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outlined", "outline", "elevated", "stat", "panel"],
      description: "Visual style of the card surface",
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
      description: "Internal padding size",
    },
    as: {
      control: "select",
      options: ["article", "div", "section"],
      description: "Semantic HTML element for the card root",
    },
  },
  args: {
    variant: "default",
    padding: "md",
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

export const Stat: Story = {
  render: () => (
    <Card variant="stat" style={{ width: 280 }}>
      <Stack gap="md">
        <Stack gap="xs">
          <Text as="strong" size="2xl" weight="bold" letterSpacing="tighter" tabularNums>
            94%
          </Text>
          <Text as="p" size="sm" color="secondary">
            Component coverage
          </Text>
        </Stack>
        <Progress value={94} variant="success" size="sm" />
      </Stack>
    </Card>
  ),
};

export const Panel: Story = {
  render: () => (
    <Card variant="panel" padding="none" style={{ width: 360 }}>
      <Card.Header divided>
        <Card.Title>System states</Card.Title>
      </Card.Header>
      <Card.Body padding="md">
        <Text as="p" size="sm" color="secondary">
          Use panel cards for bordered dashboard regions with their own internal header and body
          rhythm.
        </Text>
      </Card.Body>
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
