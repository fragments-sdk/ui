import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle } from "@phosphor-icons/react";
import { Badge } from ".";
import { Stack } from "../Stack";

/**
 * Badge is a compact label for a status, a count or a category. One 20px
 * step at the indicator corner: neutral on the band, the semantic tones on
 * their soft fill and ink.
 */
const meta = {
  title: "Display/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Compact label for a status, a count or a category.",
      },
    },
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "accent", "info", "success", "warning", "danger"],
      description: "Colour on the shared status ramp",
    },
    dot: {
      control: "boolean",
      description: "A status dot in the tone's ink before the label",
    },
    announce: {
      control: "boolean",
      description: 'Opt into role="status" live announcement semantics',
    },
  },
  args: {
    tone: "neutral",
    children: "Draft",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <Stack direction="row" gap="sm" wrap>
      <Badge>Draft</Badge>
      <Badge tone="accent">New</Badge>
      <Badge tone="info">Queued</Badge>
      <Badge tone="success">Passing</Badge>
      <Badge tone="warning">Stale</Badge>
      <Badge tone="danger">Blocked</Badge>
    </Stack>
  ),
};

export const WithDot: Story = {
  render: () => (
    <Stack direction="row" gap="sm" wrap>
      <Badge tone="success" dot>
        Online
      </Badge>
      <Badge tone="warning" dot>
        Degraded
      </Badge>
      <Badge tone="danger" dot>
        Offline
      </Badge>
    </Stack>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Badge tone="success" icon={<CheckCircle weight="fill" />}>
      Verified
    </Badge>
  ),
};

export const Removable: Story = {
  render: () => (
    <Stack direction="row" gap="sm" wrap>
      <Badge onRemove={() => {}}>react</Badge>
      <Badge tone="info" onRemove={() => {}}>
        typescript
      </Badge>
    </Stack>
  ),
};

export const Truncated: Story = {
  render: () => (
    <div style={{ maxInlineSize: 160 }}>
      <Badge>fragments-sdk/a-repository-with-a-long-name</Badge>
    </div>
  ),
};

export const AnnouncedStatus: Story = {
  args: { tone: "success", announce: true, children: "Saved" },
};
