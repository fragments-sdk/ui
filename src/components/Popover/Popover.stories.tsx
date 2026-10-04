import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from ".";
import { Button } from "../Button";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Rich content overlay anchored to a trigger element. Compose with
 * `Popover.Trigger`, `Popover.Content`, `Popover.Title`, `Popover.Description`,
 * `Popover.Body`, `Popover.Footer`, and `Popover.Close`.
 */
const meta = {
  title: "Feedback/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Floating content overlay anchored to a trigger element.",
      },
    },
  },
  argTypes: {
    modal: { control: "boolean" },
    defaultOpen: { control: "boolean" },
  },
  args: {
    modal: false,
  },
} satisfies Meta<typeof Popover>;

export default meta;

// Typed from the component, not the meta: every story renders its own
// children, and JSX stays out of component-level args (Storybook docs).
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger render={<Button variant="soft" />}>Open popover</Popover.Trigger>
      <Popover.Content>
        <Popover.Close />
        <Popover.Title>Popover title</Popover.Title>
        <Popover.Description>
          This is a popover with some content. It can contain text, forms, or other elements.
        </Popover.Description>
      </Popover.Content>
    </Popover>
  ),
};

export const WithFooter: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger render={<Button variant="soft" />}>Evidence</Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Checked 4 minutes ago</Popover.Title>
        <Popover.Description>Three findings in two files.</Popover.Description>
        <Popover.Footer>
          <Popover.Close render={<Button variant="ghost" size="sm" />}>Dismiss</Popover.Close>
          <Button size="sm">Open findings</Button>
        </Popover.Footer>
      </Popover.Content>
    </Popover>
  ),
};

export const WithArrow: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger render={<Button variant="soft" />}>Info</Popover.Trigger>
      <Popover.Content arrow>
        <Popover.Title>Quick tip</Popover.Title>
        <Popover.Description>
          This popover has an arrow pointing to its trigger element.
        </Popover.Description>
      </Popover.Content>
    </Popover>
  ),
};

export const TopSide: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger render={<Button variant="soft" />}>Top</Popover.Trigger>
      <Popover.Content side="top" size="sm">
        <Popover.Description>Popover on top</Popover.Description>
      </Popover.Content>
    </Popover>
  ),
};

export const SmallSize: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger render={<Button variant="soft" />}>Compact</Popover.Trigger>
      <Popover.Content size="sm">
        <Popover.Description>A small, focused popover.</Popover.Description>
      </Popover.Content>
    </Popover>
  ),
};

function VirtualAnchorDemo(args: React.ComponentProps<typeof Popover>) {
  const [anchor, setAnchor] = React.useState<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ paddingTop: 80 }}>
      <div
        ref={setAnchor}
        style={{
          width: 160,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed currentColor",
          borderRadius: 8,
        }}
      >
        Anchor element
      </div>
      <Popover {...args} open={open} onOpenChange={setOpen}>
        <Popover.Trigger render={<Button variant="soft" />}>Open against the box</Popover.Trigger>
        <Popover.Content anchor={anchor} positionMethod="fixed">
          <Popover.Close />
          <Popover.Title>Anchored elsewhere</Popover.Title>
          <Popover.Description>
            This content is positioned against the dashed box above, not the trigger button.
          </Popover.Description>
        </Popover.Content>
      </Popover>
    </div>
  );
}

/**
 * Positions content against an arbitrary DOM element instead of the
 * trigger, via `anchor` + `positionMethod="fixed"`: the anchor can be a node
 * in a host page rather than something this popover renders.
 */
export const VirtualAnchor: Story = {
  render: (args) => <VirtualAnchorDemo {...args} />,
};
