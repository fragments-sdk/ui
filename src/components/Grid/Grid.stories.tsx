import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { Text } from "../Text";
import { Grid } from ".";

/**
 * Grid lays items out in equal tracks. A count gives that many tracks; with
 * `minChildWidth` the count becomes a ceiling that drops tracks as the grid
 * itself narrows; `"auto"` fits as many tracks as the width allows. Use
 * Grid.Item with colSpan for asymmetric layouts.
 */
const cell: CSSProperties = {
  padding: "var(--fui-raw-space-12)",
  background: "var(--fui-bg-secondary)",
  borderRadius: "var(--fui-radius-control)",
};

// A plain wrapper, so the args that carry a cell stay acyclic (Text carries a
// `.Root` part).
function Cell({ children }: { children: string }) {
  return (
    <Text as="div" style={cell}>
      {children}
    </Text>
  );
}

// Twelve tracks fit a phone canvas only without inline padding.
const narrowCell: CSSProperties = { ...cell, paddingInline: 0, textAlign: "center" };

const meta = {
  title: "Layout/Grid",
  component: Grid,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component: "Grid layout for arranging items in equal tracks with consistent spacing.",
      },
    },
  },
  argTypes: {
    columns: { control: "select", options: [1, 2, 3, 4, 6, 12, "auto"] },
    gap: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
      description: "Gap between grid items",
    },
    alignItems: {
      control: "select",
      options: ["start", "center", "end", "stretch"],
      description: "Block-axis alignment of items within their cells",
    },
    justifyItems: {
      control: "select",
      options: ["start", "center", "end", "stretch"],
      description: "Inline-axis alignment of items within their cells",
    },
  },
  args: {
    columns: 3,
    gap: "md",
    children: (
      <>
        <Cell>Item 1</Cell>
        <Cell>Item 2</Cell>
        <Cell>Item 3</Cell>
      </>
    ),
  },
} satisfies Meta<typeof Grid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ColumnCounts: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {([1, 2, 3, 4, 6, 12] as const).map((columns) => (
        <Grid key={columns} columns={columns} gap="sm">
          {Array.from({ length: columns }, (_, index) => (
            <Text key={index} as="div" style={narrowCell}>
              {index + 1}
            </Text>
          ))}
        </Grid>
      ))}
    </div>
  ),
};

function CappedCards() {
  return (
    <Grid columns={3} minChildWidth="10rem" gap="md">
      <Cell>Card 1</Cell>
      <Cell>Card 2</Cell>
      <Cell>Card 3</Cell>
    </Grid>
  );
}

// Up to three tracks, never thinner than 10rem: three at 600, two at 380,
// one at 200. The viewport never changes.
export const CappedColumns: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 24 }}>
      {[600, 380, 200].map((width) => (
        <div key={width} style={{ inlineSize: width, maxInlineSize: "100%" }}>
          <CappedCards />
        </div>
      ))}
    </div>
  ),
};

export const AutoFill: Story = {
  args: {
    columns: "auto",
    minChildWidth: "var(--fui-layout-measure-compact-content)",
    gap: "md",
    children: (
      <>
        <Cell>Card 1</Cell>
        <Cell>Card 2</Cell>
        <Cell>Card 3</Cell>
        <Cell>Card 4</Cell>
      </>
    ),
  },
};

export const WithSpanning: Story = {
  render: () => (
    <Grid columns={4} gap="md">
      <Grid.Item colSpan={2}>
        <Cell>Spans 2 cols</Cell>
      </Grid.Item>
      <Cell>1 col</Cell>
      <Cell>1 col</Cell>
      <Grid.Item colSpan="full">
        <Cell>Full width</Cell>
      </Grid.Item>
    </Grid>
  ),
};

export const Subgrid: Story = {
  render: () => (
    <Grid columns={3} gap="md">
      {["Short", "A much longer title that wraps", "Mid title"].map((title) => (
        <Grid.Item key={title} rowSpan={2} subgrid="rows" style={{ ...cell, gap: 8 }}>
          <Text strong>{title}</Text>
          <Text>Body lines sit on one shared row line.</Text>
        </Grid.Item>
      ))}
    </Grid>
  ),
};
