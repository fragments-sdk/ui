import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { Text } from "../Text";
import { Main } from ".";

/**
 * Main is the page region: the 16 page gutter, the reading measure and the
 * vertical rhythm. Main.Title sets the display role; Main.Description sets
 * 12px ink 2 at the 68-character measure.
 */
const meta = {
  title: "Layout/Main",
  component: Main,
  tags: ["autodocs", "canonical"],
  argTypes: {
    measure: { control: "select", options: ["full", "narrow"] },
    as: { control: "select", options: ["main", "section", "div"] },
  },
  args: {
    measure: "full",
  },
} satisfies Meta<typeof Main>;

export default meta;
// Typed from the component, not the meta: every story renders its own
// children, and JSX stays out of component-level args (Storybook docs).
type Story = StoryObj<typeof Main>;

const renderMain: Story["render"] = (args) => (
  <Main {...args}>
    <Main.Header>
      <Main.Title>Findings</Main.Title>
      <Main.Description>
        <Text as="p" color="secondary">
          Every governance finding raised against this repository, newest first.
        </Text>
      </Main.Description>
    </Main.Header>
    <Main.Content>
      <Text as="p">Page content</Text>
    </Main.Content>
    <Main.Footer>
      <Button variant="soft">Export</Button>
      <Button>Resolve all</Button>
    </Main.Footer>
  </Main>
);

export const Default: Story = { render: renderMain };

export const NarrowMeasure: Story = {
  args: { measure: "narrow" },
  render: renderMain,
};

/** Inside a shell that already has a `<main>`, render a section or a div. */
export const AsSection: Story = {
  args: { as: "section", "aria-label": "Findings" },
  render: renderMain,
};
