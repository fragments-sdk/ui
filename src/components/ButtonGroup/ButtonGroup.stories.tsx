import type { Meta, StoryObj } from "@storybook/react";
import { CaretDown } from "@phosphor-icons/react";
import { ButtonGroup } from ".";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Menu } from "../Menu";
import { Stack } from "../Stack";

/**
 * ButtonGroup fuses two actions into one control: a split button. Spacing
 * between separate buttons belongs to Stack (`direction="row"`, `justify="end"`).
 */
const meta = {
  title: "Forms/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Fuses a Button and an IconButton menu trigger into a split button. Named with aria-label.",
      },
    },
  },
  args: {
    "aria-label": "Save options",
    children: null,
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The split button: the main verb, then a menu of its variations. */
export const SplitButton: Story = {
  render: () => (
    <ButtonGroup aria-label="Save options">
      <Button variant="soft">Save</Button>
      <Menu>
        <Menu.Trigger
          render={
            <IconButton variant="soft" aria-label="More save options">
              <CaretDown />
            </IconButton>
          }
        />
        <Menu.Content>
          <Menu.Item>Save as draft</Menu.Item>
          <Menu.Item>Save and close</Menu.Item>
        </Menu.Content>
      </Menu>
    </ButtonGroup>
  ),
};

/** One hairline divides every pair, so ghost and soft halves never fuse into a blob. */
export const Variants: Story = {
  render: () => (
    <Stack direction="row" gap="md" align="center">
      <ButtonGroup aria-label="Deploy options">
        <Button>Deploy</Button>
        <IconButton variant="soft" aria-label="More deploy options">
          <CaretDown />
        </IconButton>
      </ButtonGroup>
      <ButtonGroup aria-label="Export options">
        <Button variant="soft">Export</Button>
        <IconButton variant="soft" aria-label="More export options">
          <CaretDown />
        </IconButton>
      </ButtonGroup>
      <ButtonGroup aria-label="Filter options">
        <Button variant="ghost">Filter</Button>
        <IconButton aria-label="More filter options">
          <CaretDown />
        </IconButton>
      </ButtonGroup>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" gap="md" align="center">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <ButtonGroup key={size} aria-label={`Save options (${size})`}>
          <Button variant="soft" size={size}>
            Save
          </Button>
          <IconButton variant="soft" size={size} aria-label="More save options">
            <CaretDown />
          </IconButton>
        </ButtonGroup>
      ))}
    </Stack>
  ),
};

/** A verb cluster is a Stack, not a ButtonGroup: right-aligned, at most two buttons. */
export const ClusterIsAStack: Story = {
  render: () => (
    <Stack direction="row" gap="sm" justify="end">
      <Button variant="soft">Cancel</Button>
      <Button>Save</Button>
    </Stack>
  ),
};
