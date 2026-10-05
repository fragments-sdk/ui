import type { Meta, StoryObj } from "@storybook/react";
import { Text } from ".";
import { Stack } from "../Stack";

/**
 * Text is the typography primitive. Every heading, paragraph, label and
 * inline string routes through one of its roles on the 11/12/15/24 ladder,
 * at the regular or the strong weight. Agents should reuse it rather than
 * styling raw elements.
 */
const meta = {
  title: "Display/Text",
  component: Text,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "Typography on the 11/12/15/24 ladder. A step (`type`) owns size, line height, weight and tracking; strong adds the strong weight.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["caption", "control", "body", "title", "display", "code", "section-label"],
      description: "The step on the type ladder",
    },
    strong: { control: "boolean", description: "The strong weight" },
    color: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "accent", "success", "warning", "danger"],
      description: "Ink",
    },
    as: {
      control: "select",
      options: ["span", "p", "h1", "h2", "h3", "label", "code", "time"],
      description: "HTML element to render",
    },
    truncate: { control: "boolean" },
    tabularNums: { control: "boolean" },
  },
  args: {
    children: "The contract is active on web.",
    type: "body",
  },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Ladder: Story = {
  render: () => (
    <Stack gap="sm">
      <Text as="h1" type="display">
        Two findings block the merge
      </Text>
      <Text as="h2" type="title">
        Pull request 412
      </Text>
      <Text as="p">Two token files changed since the last approval.</Text>
      <Text type="caption" color="tertiary">
        Checked 2 minutes ago
      </Text>
      <Text type="control">Repository</Text>
      <Text type="code">fragments-sdk/ui@c46ff42</Text>
      <Text as="p" type="section-label">
        On this page
      </Text>
    </Stack>
  ),
};

export const Strong: Story = {
  args: { strong: true, children: "Section header in the strong weight" },
};

export const Inks: Story = {
  render: () => (
    <Stack gap="xs">
      <Text>Primary ink</Text>
      <Text color="secondary">Secondary ink</Text>
      <Text color="tertiary">Tertiary ink</Text>
      <Text>
        Checked <Text color="accent">fragments-sdk/ui</Text> today.
      </Text>
      <Text color="success">All checks pass</Text>
      <Text color="warning">91% of context used</Text>
      <Text color="danger">The token expired</Text>
    </Stack>
  ),
};

export const TabularFigures: Story = {
  args: { type: "display", tabularNums: true, children: "1,204" },
};

export const Truncated: Story = {
  render: () => (
    <div style={{ maxInlineSize: 200 }}>
      <Text as="p" truncate>
        fragments-sdk/a-repository-with-a-very-long-name changed its token files
      </Text>
    </div>
  ),
};

export const LineClamp: Story = {
  render: () => (
    <div style={{ maxInlineSize: 240 }}>
      <Text as="p" lineClamp={2}>
        Two token files changed since the last approval, and one canonical component was replaced by
        a local copy in the settings page.
      </Text>
    </div>
  ),
};
