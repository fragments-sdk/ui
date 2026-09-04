import type { Meta, StoryObj } from "@storybook/react";
import { Card } from ".";
import { Progress } from "../Progress";
import { Stack } from "../Stack";
import { Text } from "../Text";
import { RENDER_STATES } from "../../storybook/render-states";
import fixtureStyles from "./Card.consumer-fixture.module.scss";

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
    renderStates: RENDER_STATES,
    docs: {
      description: { component: "Container for grouping related content." },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "soft", "outline"],
      description: "Surface chrome",
    },
    tone: {
      control: "select",
      options: ["neutral", "accent", "warning", "danger"],
      description: "Earned-moment capsule; neutral is the plain card",
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
    variant: "solid",
    tone: "neutral",
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

export const Outline: Story = {
  render: () => (
    <Card variant="outline">
      <Card.Header>
        <Card.Title>Outline Card</Card.Title>
      </Card.Header>
      <Card.Body>Content with border.</Card.Body>
    </Card>
  ),
};

export const Soft: Story = {
  render: () => (
    <Card variant="soft" style={{ width: 280 }}>
      <Stack gap="md">
        <Stack gap="xs">
          <Text as="strong" scale="2xl" weight="bold" letterSpacing="tighter" tabularNums>
            94%
          </Text>
          <Text as="p" scale="sm" color="secondary">
            Component coverage
          </Text>
        </Stack>
        <Progress value={94} tone="success" size="sm" />
      </Stack>
    </Card>
  ),
};

export const Panel: Story = {
  render: () => (
    <Card variant="soft" padding="none" style={{ width: 360 }}>
      <Card.Header divided>
        <Card.Title>System states</Card.Title>
      </Card.Header>
      <Card.Body padding="md">
        <Text as="p" scale="sm" color="secondary">
          Use panel cards for bordered dashboard regions with their own internal header and body
          rhythm.
        </Text>
      </Card.Body>
    </Card>
  ),
};

export const Accent: Story = {
  render: () => (
    <Card variant="soft" tone="accent" padding="lg" style={{ width: 420 }}>
      <Stack gap="sm">
        <Card.Title>Finish setting up governance</Card.Title>
        <Text as="p" scale="sm" color="secondary">
          Your contract is authored — run the first scan to start tracking drift.
        </Text>
      </Stack>
    </Card>
  ),
};

export const Tones: Story = {
  render: () => (
    <Stack gap="md" style={{ width: 420 }}>
      {(["accent", "warning", "danger"] as const).map((tone) => (
        <Card key={tone} variant="soft" tone={tone}>
          <Card.Title>{tone}</Card.Title>
          <Text as="p" scale="sm" color="secondary">
            The capsule carries state; the variant stays the same.
          </Text>
        </Card>
      ))}
    </Stack>
  ),
};

export const PanelWithAside: Story = {
  render: () => (
    <Card variant="soft" padding="none" style={{ width: 420 }}>
      <Card.Header divided>
        <Stack gap="none">
          <Card.Title>Adoption</Card.Title>
          <Card.Description>Trailing controls pin to the end edge.</Card.Description>
        </Stack>
        <Text as="span" scale="xs" color="secondary">
          3m
        </Text>
      </Card.Header>
      <Card.Body padding="md">Panel body</Card.Body>
    </Card>
  ),
};

export const NestedHeading: Story = {
  render: () => (
    <Card variant="soft" padding="none" style={{ width: 360 }}>
      <Card.Header divided>
        <Card.Title as="h4">Nested panel</Card.Title>
      </Card.Header>
      <Card.Body padding="md">
        Select the title level that preserves the surrounding document outline.
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

export const GeometryMatrix: Story = {
  render: () => (
    <Stack gap="md" data-geometry-family="surfaces/card">
      {(["none", "sm", "md", "lg"] as const).map((padding) => (
        <Card key={padding} padding={padding} data-geometry-size={padding}>
          <Card.Title>{padding}</Card.Title>
          <Card.Body>Inset reference</Card.Body>
        </Card>
      ))}
      <Card variant="soft" padding="none" data-geometry-scenario="panel-inset">
        <Card.Header divided>
          <Card.Title>A localized heading that may wrap without clipping</Card.Title>
        </Card.Header>
        <Card.Body padding="md">Independent body inset</Card.Body>
      </Card>
    </Stack>
  ),
};

export const CascadeFixture: Story = {
  render: () => (
    <Stack gap="md" data-geometry-family="surfaces/card-cascade">
      <Card padding="lg" className={fixtureStyles.consumerOverride}>
        Unlayered consumer override
      </Card>
      <Card padding="lg" style={{ padding: 31, backgroundColor: "rgb(12, 34, 56)" }}>
        Inline override
      </Card>
    </Stack>
  ),
};
