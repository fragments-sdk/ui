import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Command } from ".";
import { Button } from "../Button";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Searchable command palette combining an input with a filterable,
 * keyboard-navigable list of actions. Compose Command.Input and Command.List
 * with Command.Item children; group with Command.Group and Command.Separator.
 */
const meta = {
  title: "Navigation/Command",
  component: Command,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component:
          "A frameless searchable list of commands; Command.Dialog floats it as a palette.",
      },
    },
  },
  argTypes: {
    loop: { control: "boolean", description: "Loop keyboard navigation" },
  },
  args: {
    loop: true,
    children: (
      <>
        <Command.Input placeholder="Type a command…" />
        <Command.List>
          <Command.Item onSelect={() => {}}>Open file</Command.Item>
          <Command.Empty>No results found.</Command.Empty>
        </Command.List>
      </>
    ),
  },
} satisfies Meta<typeof Command>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: "400px", width: "100%" }}>
      <Command {...args}>
        <Command.Input placeholder="Type a command…" />
        <Command.List>
          <Command.Item onSelect={() => {}}>Open file</Command.Item>
          <Command.Item onSelect={() => {}}>Save document</Command.Item>
          <Command.Item onSelect={() => {}}>Print</Command.Item>
          <Command.Empty>No results found.</Command.Empty>
        </Command.List>
      </Command>
    </div>
  ),
};

export const WithGroups: Story = {
  render: (args) => (
    <div style={{ maxWidth: "400px", width: "100%" }}>
      <Command {...args}>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Group heading="Suggestions">
            <Command.Item onSelect={() => {}}>Calendar</Command.Item>
            <Command.Item onSelect={() => {}}>Calculator</Command.Item>
          </Command.Group>
          <Command.Separator />
          <Command.Group heading="Settings">
            <Command.Item onSelect={() => {}}>Profile</Command.Item>
            <Command.Item onSelect={() => {}}>Billing</Command.Item>
            <Command.Item disabled onSelect={() => {}}>
              Team (coming soon)
            </Command.Item>
          </Command.Group>
          <Command.Empty>No results found.</Command.Empty>
        </Command.List>
      </Command>
    </div>
  ),
};

export const WithKeywords: Story = {
  render: (args) => (
    <div style={{ maxWidth: "400px", width: "100%" }}>
      <Command {...args}>
        <Command.Input placeholder="What do you need?" />
        <Command.List>
          <Command.Item keywords={["create", "add"]} onSelect={() => {}}>
            New Document
          </Command.Item>
          <Command.Item keywords={["browse"]} onSelect={() => {}}>
            Open Folder
          </Command.Item>
          <Command.Item keywords={["find"]} onSelect={() => {}}>
            Search
          </Command.Item>
          <Command.Empty>No results found.</Command.Empty>
        </Command.List>
      </Command>
    </div>
  ),
};

function PaletteDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="soft" onClick={() => setOpen(true)}>
        Open palette
      </Button>
      <Command.Dialog open={open} onOpenChange={setOpen}>
        <Command.Input placeholder="Search commands…" />
        <Command.List>
          <Command.Group heading="Repository">
            <Command.Item onSelect={() => {}}>Open pull requests</Command.Item>
            <Command.Item onSelect={() => {}}>Rename branch</Command.Item>
          </Command.Group>
          <Command.Group heading="Contract">
            <Command.Item onSelect={() => {}}>Publish contract</Command.Item>
          </Command.Group>
          <Command.Empty>No commands match.</Command.Empty>
        </Command.List>
      </Command.Dialog>
    </>
  );
}

export const Palette: Story = {
  render: () => <PaletteDemo />,
};

export const Loading: Story = {
  args: {
    children: (
      <>
        <Command.Input placeholder="Search issues…" defaultValue="bug" />
        <Command.List loading>
          <Command.Empty>No issues match.</Command.Empty>
        </Command.List>
      </>
    ),
  },
};

export const Error: Story = {
  args: {
    children: (
      <>
        <Command.Input placeholder="Search issues…" />
        <Command.List>
          <Command.Error onRetry={() => {}}>Couldn’t load issues.</Command.Error>
        </Command.List>
      </>
    ),
  },
};
