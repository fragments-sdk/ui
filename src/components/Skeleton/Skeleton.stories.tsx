import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from ".";

/**
 * Skeleton is a placeholder loading state for content. Semantic shapes
 * auto-size to common content, while width/height allow custom dimensions.
 * Includes the Skeleton.Text subcomponent. Reduced motion holds every bar still.
 */
const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Placeholder loading state for content.",
      },
    },
  },
  argTypes: {
    shape: {
      control: "select",
      options: ["text", "heading", "avatar", "control", "row", "rect"],
      description: "Semantic shape that auto-sizes",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size for the avatar and control shapes",
    },
    fill: { control: "boolean", description: "Fill parent container" },
  },
  args: { shape: "rect", width: 200, height: 20 },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { shape: "rect", width: 200, height: 20 },
};

export const Heading: Story = {
  args: { shape: "heading", width: 200 },
};

export const TextLines: Story = {
  render: () => <Skeleton.Text lines={3} />,
};

export const Avatars: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--fui-raw-space-6)", alignItems: "center" }}>
      <Skeleton shape="avatar" size="sm" />
      <Skeleton shape="avatar" size="md" />
      <Skeleton shape="avatar" size="lg" />
    </div>
  ),
};

export const Controls: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--fui-raw-space-8)", alignItems: "center" }}>
      <Skeleton shape="control" size="sm" />
      <Skeleton shape="control" size="md" />
      <Skeleton shape="control" size="lg" />
    </div>
  ),
};

export const Rows: Story = {
  render: () => (
    <div style={{ width: 260 }}>
      <Skeleton shape="row" width="64%" />
      <Skeleton shape="row" width="48%" />
      <Skeleton shape="row" width="72%" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <Skeleton shape="rect" height={120} />
      <div style={{ marginTop: "var(--fui-raw-space-12)" }}>
        <Skeleton shape="heading" width="60%" />
      </div>
      <div style={{ marginTop: "var(--fui-raw-space-6)" }}>
        <Skeleton.Text lines={2} />
      </div>
    </div>
  ),
};
