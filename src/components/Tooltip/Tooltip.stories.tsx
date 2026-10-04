import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from ".";
import { Button } from "../Button";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Tooltip is the canonical label for a control: the inverse fill, no edge, no
 * arrow. It opens after a 500ms rest, at once inside the 300ms after another
 * tip closed, and at once on keyboard focus; a press quiets it. Use Popover for
 * anything interactive or longer than a phrase.
 */
const meta = {
  title: "Feedback/Tooltip",
  component: Tooltip,
  tags: ["autodocs", "canonical"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component:
          "A short label on hover or focus. Prefer this over a hand-rolled hover popup; use Popover for interactive content.",
      },
    },
  },
  argTypes: {
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Which side to show the tooltip",
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Alignment along the side",
    },
    shortcut: { control: "text", description: "Keyboard shortcut shown after the text" },
    disabled: { control: "boolean", description: "Render the child alone" },
  },
  args: {
    content: "Save your changes",
    side: "top",
    align: "center",
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

// Typed from the component, not the meta: every story renders its own
// children, and JSX stays out of component-level args (Storybook docs).
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Button>Save</Button>
    </Tooltip>
  ),
};

export const Positions: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", padding: "40px" }}>
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Tooltip key={side} content={`On the ${side}`} side={side}>
          <Button variant="soft">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const WithShortcut: Story = {
  render: () => (
    <Tooltip content="Undo" shortcut="⌘Z">
      <Button variant="ghost">Undo</Button>
    </Tooltip>
  ),
};

/** Moving across a toolbar: the first tip waits, the next ones open at once. */
export const WarmToolbar: Story = {
  render: () => (
    <Tooltip.Provider>
      <div style={{ display: "flex", gap: "4px", padding: "40px" }}>
        <Tooltip content="Bold" shortcut="⌘B">
          <Button variant="ghost">B</Button>
        </Tooltip>
        <Tooltip content="Italic" shortcut="⌘I">
          <Button variant="ghost">I</Button>
        </Tooltip>
        <Tooltip content="Link" shortcut="⌘K">
          <Button variant="ghost">L</Button>
        </Tooltip>
      </div>
    </Tooltip.Provider>
  ),
};

/** A disabled control still explains itself on hover. */
export const OnDisabledControl: Story = {
  render: () => (
    <Tooltip content="Pick canonical components first">
      <Button disabled>Activate contract</Button>
    </Tooltip>
  ),
};
