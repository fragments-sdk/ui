import type { Meta, StoryObj } from "@storybook/react";
import { Drawer } from ".";
import { Button } from "../Button";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Drawer is the Dialog sheet on an edge: start and end follow the writing
 * direction, bottom is the mobile sheet. It fades in place and follows a swipe
 * back toward its edge to dismiss. Compose Drawer.Trigger, Drawer.Content,
 * Drawer.Header, Drawer.Body and Drawer.Footer inside the root.
 */
const meta = {
  title: "Feedback/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Edge panel for an inspector, a navigation list or a mobile sheet.",
      },
    },
  },
  argTypes: {
    open: { control: "boolean", description: "Controlled open state" },
    defaultOpen: { control: "boolean", description: "Default open state (uncontrolled)" },
    modal: {
      control: "select",
      options: [true, "trap-focus", false],
      description: "true draws the scrim; trap-focus keeps focus inside without one",
    },
  },
  args: {
    modal: true,
    children: null,
  },
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Drawer modal={args.modal}>
      <Drawer.Trigger render={<Button variant="soft" />}>Open drawer</Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit repository</Drawer.Title>
          <Drawer.Description>Changes apply on the next check.</Drawer.Description>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <p>The body scrolls on its own; the header and footer stay put.</p>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close render={<Button variant="ghost" />}>Cancel</Drawer.Close>
          <Button variant="solid">Save</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      {(["start", "end", "bottom"] as const).map((side) => (
        <Drawer key={side}>
          <Drawer.Trigger render={<Button variant="soft" />}>{side}</Drawer.Trigger>
          <Drawer.Content side={side}>
            <Drawer.Header>
              <Drawer.Title>On the {side} edge</Drawer.Title>
              <Drawer.Close />
            </Drawer.Header>
            <Drawer.Body>
              <p>Swipe back toward the edge to dismiss.</p>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Drawer key={size}>
          <Drawer.Trigger render={<Button variant="soft" />}>{size}</Drawer.Trigger>
          <Drawer.Content size={size}>
            <Drawer.Header>
              <Drawer.Title>Size {size}</Drawer.Title>
              <Drawer.Close />
            </Drawer.Header>
            <Drawer.Body>
              <p>Width on the start and end edges, height on the bottom edge.</p>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      ))}
    </div>
  ),
};

export const Inspector: Story = {
  render: () => (
    <Drawer modal="trap-focus">
      <Drawer.Trigger render={<Button variant="soft" />}>Inspect</Drawer.Trigger>
      <Drawer.Content side="end" size="sm">
        <Drawer.Header>
          <Drawer.Title>Details</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>
          <p>No scrim: the page stays visible while focus stays here.</p>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  ),
};

export const BottomSheet: Story = {
  render: () => (
    <Drawer snapPoints={[0.4, 1]}>
      <Drawer.Trigger render={<Button variant="soft" />}>Open sheet</Drawer.Trigger>
      <Drawer.Content side="bottom" size="lg">
        <Drawer.Header>
          <Drawer.Title>Actions</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <p>Snaps at 40% and full height.</p>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  ),
};
