import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "../Stack";
import { Text } from "../Text";
import { Link } from ".";

/**
 * Inline navigation with real link semantics. Always underlined at the shared
 * offset; accent reads the link ink, neutral steps ink 2 to ink 1 on hover.
 */
const meta = {
  title: "Navigation/Link",
  component: Link,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component: "Inline navigation, always underlined, in the link ink or the neutral ink.",
      },
    },
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["accent", "neutral"],
      description: "accent: the link ink; neutral: ink 2, ink 1 on hover",
    },
    external: { control: "boolean" },
  },
  args: {
    href: "#",
    tone: "accent",
    children: "Learn more about our services",
  },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { href: "#", children: "Learn more about our services" },
};

export const Neutral: Story = {
  args: { href: "#", tone: "neutral", children: "Quiet footer link" },
};

export const InProse: Story = {
  render: () => (
    <Text>
      Read the <Link href="#guide">migration guide</Link> before upgrading, or browse the{" "}
      <Link href="#changelog" tone="neutral">
        changelog
      </Link>
      .
    </Text>
  ),
};

export const External: Story = {
  args: {
    href: "https://example.com",
    external: true,
    children: "View documentation",
  },
};

/** `render` moves the look onto another element, such as a router link. */
export const Render: Story = {
  render: () => (
    <Stack direction="row" gap="md">
      <Link render={<a href="#pricing" data-router-link="" />}>Client-side navigation</Link>
    </Stack>
  ),
};
