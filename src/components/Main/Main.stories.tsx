import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../Text";
import { Main } from ".";

const meta = {
  title: "Layout/Main",
  component: Main,
  tags: ["autodocs", "canonical"],
  args: {
    measure: "full",
  },
} satisfies Meta<typeof Main>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderMain: Story["render"] = (args) => (
  <Main {...args}>
    <Main.Header>
      <Text as="h1" size="2xl" weight="semibold">
        Page statement
      </Text>
    </Main.Header>
    <Main.Description>
      <Text color="secondary">Supporting page context.</Text>
    </Main.Description>
    <Main.Content>
      <Text>Page content</Text>
    </Main.Content>
    <Main.Footer>Page actions</Main.Footer>
  </Main>
);

export const Default: Story = { render: renderMain };
export const NarrowMeasure: Story = {
  args: { measure: "narrow" },
  render: renderMain,
};
