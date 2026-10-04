import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from ".";
import { Stack } from "../Stack";

/**
 * Avatar shows a person: a photo, their initials on the accent's soft fill,
 * or a placeholder glyph on the band. A rounded square on the control
 * tracks; Avatar.Group overlaps a row of them.
 */
const meta = {
  title: "Display/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "A person: photo, initials or placeholder glyph." },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Control track: xs 24, sm 28, md 32, lg 40",
    },
    src: { control: "text", description: "Image source URL" },
    name: { control: "text", description: "Full name - used to generate initials" },
    initials: { control: "text", description: "Fallback initials (1-2 characters)" },
  },
  args: {
    name: "Jane Doe",
    size: "xs",
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithInitials: Story = {};

export const WithImage: Story = {
  args: {
    src: "https://i.pravatar.cc/150?u=jane",
    alt: "Jane Doe",
    name: "Jane Doe",
  },
};

export const Placeholder: Story = {
  args: { name: undefined, alt: "Unknown user" },
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" gap="sm" align="center">
      <Avatar name="Jane Doe" size="xs" />
      <Avatar name="Jane Doe" size="sm" />
      <Avatar name="Jane Doe" size="md" />
      <Avatar name="Jane Doe" size="lg" />
    </Stack>
  ),
};

export const Group: Story = {
  render: () => (
    <Avatar.Group max={3}>
      <Avatar name="Alice Johnson" />
      <Avatar name="Bob Smith" />
      <Avatar src="https://i.pravatar.cc/150?u=carol" alt="Carol White" />
      <Avatar name="David Brown" />
      <Avatar name="Eve Davis" />
    </Avatar.Group>
  ),
};
