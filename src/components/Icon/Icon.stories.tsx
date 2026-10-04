import type { Meta, StoryObj } from "@storybook/react";
import { Check, Heart, Info, Star, Warning } from "@phosphor-icons/react";
import { Icon } from ".";

/**
 * Icon sizes any icon component onto the glyph ladder (12, 14, 16, 18, 24)
 * and gives it one ink. Pass any icon component through the required `icon`
 * prop. Icons are decorative by default; pair them with words for meaning.
 */
const meta = {
  title: "Display/Icon",
  component: Icon,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component: "Sizes any icon onto the glyph ladder and gives it one ink.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "A step on the glyph ladder: 12, 14, 16, 18, 24",
    },
    weight: {
      control: "select",
      options: ["regular", "bold", "fill"],
      description: "The glyph weight",
    },
    tone: {
      control: "select",
      options: ["secondary", "tertiary", "accent", "info", "success", "warning", "danger"],
      description: "The glyph ink; omit to inherit currentColor",
    },
  },
  args: {
    icon: Heart,
    size: "md",
    weight: "regular",
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { icon: Heart },
};

/** Every step on the ladder, beside the text it sits with. */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Icon key={size} {...args} icon={Star} size={size} />
      ))}
    </div>
  ),
};

/** The three weights the system draws. */
export const Weights: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {(["regular", "bold", "fill"] as const).map((weight) => (
        <Icon key={weight} {...args} icon={Heart} weight={weight} />
      ))}
    </div>
  ),
};

/** One ink axis: the quiet text inks, the accent ink and the status inks. */
export const Tones: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Icon {...args} icon={Heart} tone="secondary" />
      <Icon {...args} icon={Heart} tone="tertiary" />
      <Icon {...args} icon={Info} tone="accent" />
      <Icon {...args} icon={Info} tone="info" />
      <Icon {...args} icon={Check} tone="success" />
      <Icon {...args} icon={Warning} tone="warning" />
      <Icon {...args} icon={Warning} tone="danger" />
    </div>
  ),
};

/** A labelled icon is announced once, as an image. */
export const Labelled: Story = {
  args: { icon: Warning, tone: "danger", "aria-label": "Failed" },
};
