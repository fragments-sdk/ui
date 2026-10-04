import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../Text";
import { Stack } from ".";

// A demo pane: the tinted block each child sits in. A plain wrapper, so the
// args that carry it stay acyclic (Text carries a `.Root` part).
const PANE = { padding: 8, background: "var(--fui-bg-secondary)" } as const;

function Pane({ children }: { children: string }) {
  return (
    <Text as="div" style={PANE}>
      {children}
    </Text>
  );
}

/**
 * Stack is a flexbox layout primitive for arranging children in rows or
 * columns on the one layout gap scale. `collapseBelow` folds a row into a
 * column when the Stack itself gets narrow; `divided` draws a Separator
 * between children.
 */
const meta = {
  title: "Layout/Stack",
  component: Stack,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component: "Flexbox layout component for arranging children in rows or columns.",
      },
    },
  },
  argTypes: {
    direction: { control: "select", options: ["row", "column"] },
    gap: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl"] },
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch", "baseline"],
      description: "Cross-axis alignment",
    },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between"],
      description: "Main-axis alignment",
    },
    as: {
      control: "select",
      options: [
        "div",
        "section",
        "nav",
        "article",
        "aside",
        "header",
        "footer",
        "main",
        "ul",
        "ol",
      ],
      description: "HTML element to render",
    },
    wrap: { control: "boolean", description: "Allow items to wrap" },
    divided: { control: "boolean", description: "A Separator between children" },
  },
  args: {
    direction: "column",
    gap: "md",
    children: (
      <>
        <Pane>Item 1</Pane>
        <Pane>Item 2</Pane>
        <Pane>Item 3</Pane>
      </>
    ),
  },
} satisfies Meta<typeof Stack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: { direction: "column", gap: "sm" },
};

export const Horizontal: Story = {
  args: { direction: "row", gap: "sm" },
};

export const Gaps: Story = {
  render: (args) => (
    <Stack gap="lg">
      {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((gap) => (
        <Stack key={gap} {...args} direction="row" gap={gap} />
      ))}
    </Stack>
  ),
};

export const Divided: Story = {
  args: { direction: "column", gap: "md", divided: true },
};

export const DividedRow: Story = {
  args: { direction: "row", gap: "md", divided: true },
};

export const DividedList: Story = {
  args: {
    as: "ul",
    gap: "sm",
    divided: true,
    children: (
      <>
        <li>Checkout</li>
        <li>Billing</li>
        <li>Settings</li>
      </>
    ),
  },
};

function CollapsingPair() {
  return (
    <Stack collapseBelow="24rem" gap="sm">
      <Pane>First name</Pane>
      <Pane>Last name</Pane>
    </Stack>
  );
}

// The same Stack in a wide and a narrow pane: side by side at 560, a column
// at 280. The viewport never changes; on a phone canvas both panes fold.
export const CollapseBelow: Story = {
  render: () => (
    <Stack gap="lg">
      <div style={{ inlineSize: 560, maxInlineSize: "100%" }}>
        <CollapsingPair />
      </div>
      <div style={{ inlineSize: 280, maxInlineSize: "100%" }}>
        <CollapsingPair />
      </div>
    </Stack>
  ),
};

export const SemanticElement: Story = {
  args: { as: "nav", direction: "row", gap: "md" },
};
