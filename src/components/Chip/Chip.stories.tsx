import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Hash, User } from "@phosphor-icons/react";
import { Stack } from "../Stack";
import { Chip } from ".";

/**
 * A compact value: a tag, a filter or an applied selection. One look, never
 * toned; a static tag renders a span, a selectable chip a toggle button.
 */
const meta = {
  title: "Forms/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A compact value: 24 high, the band fill with one hairline, the control radius, truncated.",
      },
    },
  },
  argTypes: {
    selected: { control: "boolean", description: "Selected state; makes the chip a toggle" },
    disabled: { control: "boolean" },
  },
  args: { children: "Design" },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A static tag: a span, no button. */
export const Tag: Story = {
  args: { children: "Design" },
};

export const WithIcon: Story = {
  render: () => (
    <Stack direction="row" gap="xs">
      <Chip icon={<Hash />}>release</Chip>
      <Chip icon={<User />}>Ada Lovelace</Chip>
    </Stack>
  ),
};

/** Selected is the selection: the wash with the ring as its edge. */
export const Selectable: Story = {
  render: function SelectableStory() {
    const [selected, setSelected] = useState(true);
    return (
      <Stack direction="row" gap="xs">
        <Chip selected={selected} onClick={() => setSelected((value) => !value)}>
          Open
        </Chip>
        <Chip selected={false}>Closed</Chip>
      </Stack>
    );
  },
};

export const Removable: Story = {
  render: function RemovableStory() {
    const [tags, setTags] = useState(["design", "frontend", "a11y"]);
    return (
      <Stack direction="row" gap="xs">
        {tags.map((tag) => (
          <Chip key={tag} onRemove={() => setTags((all) => all.filter((t) => t !== tag))}>
            {tag}
          </Chip>
        ))}
      </Stack>
    );
  },
};

export const Group: Story = {
  render: function GroupStory() {
    const [value, setValue] = useState<string[]>(["open"]);
    return (
      <Chip.Group aria-label="Status filters" value={value} onValueChange={setValue}>
        <Chip value="open">Open</Chip>
        <Chip value="draft">Draft</Chip>
        <Chip value="merged">Merged</Chip>
      </Chip.Group>
    );
  },
};

export const Truncated: Story = {
  render: () => (
    <div style={{ maxInlineSize: 160 }}>
      <Chip onRemove={() => {}}>packages/engine/src/compiler/core/loader.ts</Chip>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, selected: false, children: "Unavailable" },
};
