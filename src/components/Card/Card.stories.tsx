import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from ".";
import { Button } from "../Button";
import { Grid } from "../Grid";
import { Progress } from "../Progress";
import { Stack } from "../Stack";
import { Text } from "../Text";
import { RENDER_STATES } from "../../storybook/render-states";
import fixtureStyles from "./Card.consumer-fixture.module.scss";

/**
 * Card groups related content on the one surface: the surface plane, the
 * hairline, the surface corner and no shadow. It is a compound component:
 * compose Card.Header, Card.Title, Card.Description, Card.Body and
 * Card.Footer inside the root. render makes the whole card one link or button.
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
    tone: {
      control: "select",
      options: ["neutral", "danger"],
      description: "danger draws the edge in the danger ink",
    },
    padding: {
      control: "select",
      options: ["none", "md"],
      description: "md is the compact inset (12)",
    },
    selected: {
      control: "boolean",
      description: "The selection wash and ring",
    },
    as: {
      control: "select",
      options: ["article", "div", "section"],
      description: "Semantic HTML element for the card root",
    },
  },
  args: {
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

export const Metric: Story = {
  render: () => (
    <Card style={{ inlineSize: 280, maxInlineSize: "100%" }}>
      <Stack gap="md">
        <Stack gap="xs">
          <Text as="p" type="display" tabularNums>
            94%
          </Text>
          <Text as="p" color="secondary">
            Component coverage
          </Text>
        </Stack>
        <Progress value={94} />
      </Stack>
    </Card>
  ),
};

export const Panel: Story = {
  render: () => (
    <Card padding="none" style={{ inlineSize: 360, maxInlineSize: "100%" }}>
      <Card.Header divided>
        <Card.Title>System states</Card.Title>
      </Card.Header>
      <Card.Body padding="md">
        <Text as="p" color="secondary">
          A panel owns its own head and body rhythm: a 40px head with the line below, then the body
          inset.
        </Text>
      </Card.Body>
    </Card>
  ),
};

export const PanelWithAside: Story = {
  render: () => (
    <Card padding="none" style={{ inlineSize: 420, maxInlineSize: "100%" }}>
      <Card.Header divided>
        <Stack gap="none">
          <Card.Title>Adoption</Card.Title>
          <Card.Description>Trailing controls pin to the end edge.</Card.Description>
        </Stack>
        <Text as="span" type="caption" color="secondary">
          3m
        </Text>
      </Card.Header>
      <Card.Body padding="md">Panel body</Card.Body>
    </Card>
  ),
};

export const DangerTone: Story = {
  render: () => (
    <Card tone="danger" style={{ inlineSize: 420, maxInlineSize: "100%" }}>
      <Card.Header>
        <Card.Title>Merge held</Card.Title>
        <Card.Description>Two blocking findings need a decision.</Card.Description>
      </Card.Header>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Stack gap="md" style={{ inlineSize: 360, maxInlineSize: "100%" }}>
      <Card render={<a href="#web" />}>
        <Card.Title>web</Card.Title>
        <Card.Description>The whole card is one link.</Card.Description>
      </Card>
      <Card render={<button type="button" />}>
        <Card.Title>Run the check</Card.Title>
        <Card.Description>The whole card is one button.</Card.Description>
      </Card>
    </Stack>
  ),
};

export const Selected: Story = {
  render: function SelectedStory() {
    const plans = ["Repository", "Team", "Enterprise"];
    const [chosen, setChosen] = React.useState("Team");
    return (
      <Stack direction="row" gap="md" wrap>
        {plans.map((plan) => (
          <Card
            key={plan}
            selected={plan === chosen}
            render={<button type="button" aria-pressed={plan === chosen} />}
            onClick={() => setChosen(plan)}
            style={{ inlineSize: 160, maxInlineSize: "100%" }}
          >
            <Card.Title>{plan}</Card.Title>
          </Card>
        ))}
      </Stack>
    );
  },
};

export const Mosaic: Story = {
  render: () => (
    <Grid columns={3} gap="md" style={{ inlineSize: 640, maxInlineSize: "100%" }}>
      <Grid.Item colSpan={2} rowSpan={2}>
        <Card style={{ height: "100%" }}>
          <Card.Title>Coverage</Card.Title>
          <Card.Body>A feature tile spans two columns and two rows.</Card.Body>
        </Card>
      </Grid.Item>
      <Card>
        <Card.Title>Findings</Card.Title>
      </Card>
      <Card>
        <Card.Title>Merges</Card.Title>
      </Card>
    </Grid>
  ),
};

export const NestedHeading: Story = {
  render: () => (
    <Card padding="none" style={{ inlineSize: 360, maxInlineSize: "100%" }}>
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
    <Card style={{ inlineSize: 420, maxInlineSize: "100%" }}>
      <Card.Header>
        <Card.Title>Card with footer</Card.Title>
        <Card.Description>Complete card layout</Card.Description>
      </Card.Header>
      <Card.Body>Main content area.</Card.Body>
      <Card.Footer>
        <Button variant="soft" size="sm">
          Cancel
        </Button>
        <Button size="sm">Save</Button>
      </Card.Footer>
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
      {(["none", "md"] as const).map((padding) => (
        <Card key={padding} padding={padding} data-geometry-size={padding}>
          <Card.Title>{padding}</Card.Title>
          <Card.Body>Inset reference</Card.Body>
        </Card>
      ))}
      <Card padding="none" data-geometry-scenario="panel-inset">
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
      <Card className={fixtureStyles.consumerOverride}>Unlayered consumer override</Card>
      <Card style={{ padding: 31, backgroundColor: "rgb(12, 34, 56)" }}>Inline override</Card>
    </Stack>
  ),
};
