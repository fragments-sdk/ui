import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { Stack } from "../Stack";
import { Text } from "../Text";
import { ScrollArea } from ".";

// A story area: 280 wide, never wider than the canvas.
const AREA = { inlineSize: 280, maxInlineSize: "100%" } as const;
const PAD = { padding: 8 } as const;

const rows = (
  <Stack gap="sm" style={PAD}>
    {Array.from({ length: 20 }, (_, i) => (
      <Text key={i} as="div">
        Row {i + 1}
      </Text>
    ))}
  </Stack>
);

/**
 * ScrollArea is a styled scrollable container with thin scrollbars and
 * optional fade indicators. Use orientation to constrain scroll direction
 * and showFades to communicate overflow when no other affordance does.
 */
const meta = {
  title: "Layout/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Styled scrollable container with thin scrollbars and optional edge fades.",
      },
    },
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical", "both"],
      description: "Scroll direction",
    },
    scrollbarVisibility: {
      control: "select",
      options: ["auto", "always"],
      description: "When to show the scrollbar",
    },
    showFades: {
      control: "boolean",
      description: "Show gradient fade indicators at scroll edges",
    },
  },
  args: {
    orientation: "vertical",
    scrollbarVisibility: "auto",
    showFades: false,
  },
  render: (args) => (
    <ScrollArea {...args} style={{ ...AREA, blockSize: 160 }}>
      {rows}
    </ScrollArea>
  ),
} satisfies Meta<typeof ScrollArea>;

export default meta;

// Typed from the component: the stories render their own children, and JSX
// stays out of component-level args (compound parts carry a `.Root` cycle).
type Story = StoryObj<typeof ScrollArea>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <ScrollArea {...args} style={AREA}>
      <Stack direction="row" gap="sm" style={PAD}>
        {Array.from({ length: 20 }, (_, i) => (
          <Text key={i} style={{ flex: "0 0 auto" }}>
            Chip {i + 1}
          </Text>
        ))}
      </Stack>
    </ScrollArea>
  ),
};

export const WithFades: Story = {
  args: { orientation: "horizontal", showFades: true },
  render: (args) => (
    <ScrollArea {...args} style={AREA}>
      <Stack direction="row" gap="sm" style={PAD}>
        {Array.from({ length: 20 }, (_, i) => (
          <Text key={i} style={{ flex: "0 0 auto" }}>
            Item {i + 1}
          </Text>
        ))}
      </Stack>
    </ScrollArea>
  ),
};

export const AlwaysScrollbar: Story = {
  args: { scrollbarVisibility: "always" },
};

const geometryContent = Array.from({ length: 18 }, (_, index) => (
  <Button key={index} variant="soft" size="sm" style={{ flex: "0 0 auto" }}>
    Item {index + 1}
  </Button>
));

/** Independent-axis, direction, nesting, and visibility evidence. */
export const GeometryMatrix: Story = {
  args: { showFades: true },
  render: () => (
    <div
      data-geometry-root="scroll-area"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
        gap: 24,
      }}
    >
      {(["auto", "always"] as const).map((visibility) => (
        <ScrollArea
          key={visibility}
          orientation="horizontal"
          scrollbarVisibility={visibility}
          showFades
          style={{ ...AREA, blockSize: 96 }}
        >
          <div style={{ display: "flex", gap: 8, padding: 8 }}>{geometryContent}</div>
        </ScrollArea>
      ))}

      <ScrollArea orientation="vertical" showFades style={{ ...AREA, blockSize: 160 }}>
        <div style={{ display: "grid", justifyItems: "start", gap: 8, padding: 8 }}>
          {geometryContent}
        </div>
      </ScrollArea>

      <ScrollArea orientation="both" showFades style={{ ...AREA, blockSize: 160 }}>
        <div
          style={{ display: "grid", justifyItems: "start", gap: 8, padding: 8, inlineSize: 560 }}
        >
          {geometryContent}
        </div>
      </ScrollArea>

      <ScrollArea orientation="both" dir="rtl" showFades style={{ ...AREA, blockSize: 160 }}>
        <div
          style={{ display: "grid", justifyItems: "start", gap: 8, padding: 8, inlineSize: 560 }}
        >
          {geometryContent}
        </div>
      </ScrollArea>

      <ScrollArea orientation="vertical" showFades style={{ ...AREA, blockSize: 160 }}>
        <div style={{ display: "grid", gap: 8, padding: 8 }}>
          <Text>Nested same-axis area</Text>
          <ScrollArea orientation="vertical" showFades style={{ blockSize: 96 }}>
            <div style={{ display: "grid", justifyItems: "start", gap: 8, padding: 8 }}>
              {geometryContent}
            </div>
          </ScrollArea>
          <ScrollArea orientation="horizontal" showFades>
            <div style={{ display: "flex", gap: 8, padding: 8 }}>{geometryContent}</div>
          </ScrollArea>
        </div>
      </ScrollArea>
    </div>
  ),
};
