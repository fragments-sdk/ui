import type { Meta, StoryObj } from "@storybook/react";
import { FolderSimple, MagnifyingGlass, Tray } from "@phosphor-icons/react";
import { EmptyState } from ".";
import { Button } from "../Button";
import { Card } from "../Card";

/**
 * EmptyState says why a region is empty and what to do next. It is
 * start-aligned, like the copy around it: a band icon tile, a title, ink-2
 * copy at the reading measure and at most two actions. It is a compound
 * component: compose EmptyState.Icon, EmptyState.Title, EmptyState.Description
 * and EmptyState.Actions inside the root.
 */
const meta = {
  title: "Feedback/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Why a region is empty and the one thing to do next, start-aligned.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md"],
      description: "Padding: sm for a panel or table body, md for a page region",
    },
  },
  args: {
    size: "md",
    children: (
      <>
        <EmptyState.Title>No repositories yet</EmptyState.Title>
        <EmptyState.Description>
          Connect a repository to start checking it against the contract.
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
      <EmptyState.Icon>
        <FolderSimple />
      </EmptyState.Icon>
      <EmptyState.Title>No repositories yet</EmptyState.Title>
      <EmptyState.Description>
        Connect a repository to start checking it against the contract.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button>Connect repository</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
};

export const NoResults: Story = {
  render: () => (
    <EmptyState>
      <EmptyState.Icon>
        <MagnifyingGlass />
      </EmptyState.Icon>
      <EmptyState.Title>No findings match these filters</EmptyState.Title>
      <EmptyState.Description>
        Clear a filter or widen the date range to see more findings.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button variant="soft">Clear filters</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
};

export const Small: Story = {
  render: () => (
    <EmptyState size="sm">
      <EmptyState.Icon>
        <Tray />
      </EmptyState.Icon>
      <EmptyState.Title>Nothing to review</EmptyState.Title>
      <EmptyState.Description>New pull requests appear here.</EmptyState.Description>
    </EmptyState>
  ),
};

export const TwoActions: Story = {
  render: () => (
    <EmptyState>
      <EmptyState.Icon>
        <FolderSimple />
      </EmptyState.Icon>
      <EmptyState.Title>No contract yet</EmptyState.Title>
      <EmptyState.Description>
        Pick the canonical components and token files the checks enforce.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button>Create contract</Button>
        <Button variant="soft">Read the guide</Button>
      </EmptyState.Actions>
    </EmptyState>
  ),
};

export const InsideACard: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <Card.Title>Pull requests</Card.Title>
      </Card.Header>
      <Card.Body>
        <EmptyState size="sm">
          <EmptyState.Icon>
            <Tray />
          </EmptyState.Icon>
          <EmptyState.Title>Nothing to review</EmptyState.Title>
          <EmptyState.Description>New pull requests appear here.</EmptyState.Description>
        </EmptyState>
      </Card.Body>
    </Card>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <EmptyState size="sm">
      <EmptyState.Title>No tokens in this file</EmptyState.Title>
      <EmptyState.Description>
        Add a token file to the contract to list it here.
      </EmptyState.Description>
    </EmptyState>
  ),
};
