import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from ".";

/**
 * Badge is a compact label for status, counts, or categorization. It draws
 * attention to metadata without dominating the layout and supports semantic
 * variants, an optional status dot, and a removable affordance.
 */
const meta = {
  title: "Display/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Compact label for status, counts, or categorization.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["soft", "outline", "ghost"],
      description: "Chrome family",
    },
    tone: {
      control: "select",
      options: ["neutral", "accent", "info", "success", "warning", "danger"],
      description: "Colour on the shared status ramp",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Badge size",
    },
    dot: {
      control: "boolean",
      description: "Show a colored dot indicator before the label",
    },
    dotPulse: {
      control: "boolean",
      description: "Breathe the dot for a state that is still happening",
    },
    announce: {
      control: "boolean",
      description: 'Opt into role="status" live announcement semantics',
    },
  },
  args: {
    variant: "soft",
    tone: "neutral",
    size: "md",
    children: "Default",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Default" },
};

export const Success: Story = {
  args: { tone: "success", children: "Active" },
};

export const Danger: Story = {
  args: { tone: "danger", children: "Failed" },
};

export const SemanticStatus: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--fui-space-2)", alignItems: "center" }}>
      <Badge tone="success" size="lg">
        Delivered
      </Badge>
      <Badge tone="danger" size="lg">
        Bounced
      </Badge>
      <Badge tone="warning" size="lg">
        Delayed
      </Badge>
      <Badge tone="info" size="lg">
        Queued
      </Badge>
    </div>
  ),
};

export const WithDot: Story = {
  args: { tone: "success", dot: true, children: "Online" },
};

export const PulsingDot: Story = {
  args: { tone: "info", dot: true, dotPulse: true, announce: true, children: "Running" },
  parameters: {
    docs: {
      description: {
        story:
          "Two badges of the same colour can mean very different things — one state a board is waiting on, one it has finished with. The pulse is what separates them at a glance. Opacity only, so nothing reflows, and it stops for prefers-reduced-motion.",
      },
    },
  },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Ghost: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--fui-space-2)", alignItems: "center" }}>
      <Badge variant="ghost" active>
        All
      </Badge>
      <Badge variant="ghost">Archived</Badge>
    </div>
  ),
};

export const Removable: Story = {
  args: { tone: "info", children: "React", onRemove: () => {} },
};
