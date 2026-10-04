import type { Meta, StoryObj } from "@storybook/react";
import { Box } from ".";
import { Stack } from "../Stack";
import { Text } from "../Text";

/**
 * Box puts content on one of the four planes (canvas, band, surface, raised),
 * with an optional hairline, a corner role and a surface inset. Layout, ink,
 * scrolling and shadow belong to Stack, Grid, Text, ScrollArea and the
 * floating surfaces.
 */
const meta = {
  title: "Layout/Box",
  component: Box,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "Puts content on a plane, with an optional hairline, a corner role and a surface inset.",
      },
    },
  },
  argTypes: {
    as: {
      control: "select",
      options: ["div", "section", "article", "aside", "main", "header", "footer", "nav", "span"],
      description: "HTML element to render",
    },
    plane: {
      control: "select",
      options: [undefined, "canvas", "band", "surface", "raised"],
      description: "The plane the box paints",
    },
    border: {
      control: "select",
      options: [false, true, "block-start", "block-end"],
      description: "The one hairline",
    },
    radius: {
      control: "select",
      options: ["none", "control", "nested", "surface"],
      description: "Corner role",
    },
    inset: {
      control: "select",
      options: ["none", "compact", "default"],
      description: "Surface inset",
    },
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    plane: "surface",
    border: true,
    radius: "surface",
    inset: "default",
    children: "A bordered region on the surface plane",
  },
};

export const Planes: Story = {
  render: () => (
    <Box plane="canvas" inset="default">
      <Stack gap="sm">
        <Box plane="band" radius="control" inset="compact">
          Band: a recessed strip
        </Box>
        <Box plane="surface" border radius="surface" inset="compact">
          Surface: the card plane
        </Box>
        <Box plane="raised" border radius="surface" inset="compact">
          Raised: a lifted plane
        </Box>
      </Stack>
    </Box>
  ),
};

export const Nested: Story = {
  render: () => (
    <Box plane="surface" border radius="surface" inset="compact">
      <Stack gap="sm">
        <Text>The outer surface uses the surface corner.</Text>
        <Box plane="band" radius="nested" inset="compact">
          The inner tile follows the nested corner, so the curves stay concentric.
        </Box>
      </Stack>
    </Box>
  ),
};

export const BlockBorders: Story = {
  render: () => (
    <Box plane="surface" border radius="surface">
      <Box border="block-end" inset="compact">
        Hairline below
      </Box>
      <Box inset="compact">Middle strip</Box>
      <Box border="block-start" inset="compact">
        Hairline above
      </Box>
    </Box>
  ),
};

export const Insets: Story = {
  render: () => (
    <Stack gap="sm">
      {(["none", "compact", "default"] as const).map((inset) => (
        <Box key={inset} plane="band" radius="control" inset={inset}>
          inset=&quot;{inset}&quot;
        </Box>
      ))}
    </Stack>
  ),
};

export const Radii: Story = {
  render: () => (
    <Stack direction="row" gap="sm">
      {(["none", "control", "nested", "surface"] as const).map((radius) => (
        <Box key={radius} plane="surface" border radius={radius} inset="compact">
          {radius}
        </Box>
      ))}
    </Stack>
  ),
};

export const Semantic: Story = {
  render: () => (
    <Box as="aside" plane="band" radius="surface" inset="default" aria-label="Repository summary">
      Rendered as an aside landmark on the band plane.
    </Box>
  ),
};
