import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from ".";
import { Button } from "../Button";
import { Card } from "../Card";
import { Stack } from "../Stack";

/**
 * Alert marks an inline state the reader should act on. The tone spends its
 * colour on the tint fill, the icon and the title; body copy stays ink 1. It is
 * a compound component: compose Alert.Icon, Alert.Body, Alert.Title,
 * Alert.Content, Alert.Actions, Alert.Action and Alert.Close.
 */
const meta = {
  title: "Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An inline state worth stopping for: information, a warning or an error, with one way forward.",
      },
    },
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["info", "warning", "danger"],
      description: "Tone",
    },
  },
  args: {
    tone: "info",
    children: (
      <>
        <Alert.Icon />
        <Alert.Body>
          <Alert.Content>The next check runs at 15:00.</Alert.Content>
        </Alert.Body>
      </>
    ),
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
  render: () => (
    <Alert tone="info">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Title>Scan scheduled</Alert.Title>
        <Alert.Content>The next check runs at 15:00 against the main branch.</Alert.Content>
      </Alert.Body>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert tone="warning">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Title>Contract out of date</Alert.Title>
        <Alert.Content>Two token files changed since the last approval.</Alert.Content>
      </Alert.Body>
    </Alert>
  ),
};

export const Error: Story = {
  render: () => (
    <Alert tone="danger">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Title>The check could not run</Alert.Title>
        <Alert.Content>The workflow token expired on 2 October.</Alert.Content>
      </Alert.Body>
    </Alert>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Alert tone="warning">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Title>Contract out of date</Alert.Title>
        <Alert.Content>Review the changed token files before the next merge.</Alert.Content>
      </Alert.Body>
      <Alert.Actions>
        <Alert.Action>Review changes</Alert.Action>
        <Alert.Action>Snooze</Alert.Action>
      </Alert.Actions>
    </Alert>
  ),
};

export const Dismissible: Story = {
  render: () => (
    <Alert tone="info">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Content>Repository connected. The first scan starts shortly.</Alert.Content>
      </Alert.Body>
      <Alert.Close />
    </Alert>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [open, setOpen] = React.useState(true);
    return (
      <Stack gap="sm">
        <Alert tone="info" open={open} onOpenChange={setOpen}>
          <Alert.Icon />
          <Alert.Body>
            <Alert.Content>The scan finished with no new findings.</Alert.Content>
          </Alert.Body>
          <Alert.Close />
        </Alert>
        {!open && (
          <div>
            <Button variant="soft" size="sm" onClick={() => setOpen(true)}>
              Show the notice again
            </Button>
          </div>
        )}
      </Stack>
    );
  },
};

export const InsideACard: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Card.Title>Workflow</Card.Title>
      </Card.Header>
      <Card.Body>
        <Alert tone="danger">
          <Alert.Icon />
          <Alert.Body>
            <Alert.Content>The workflow token expired. Renew it to resume checks.</Alert.Content>
          </Alert.Body>
          <Alert.Actions>
            <Alert.Action>Renew token</Alert.Action>
          </Alert.Actions>
        </Alert>
      </Card.Body>
    </Card>
  ),
};
