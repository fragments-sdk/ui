import type { Meta, StoryObj } from "@storybook/react";
import { Image } from ".";

/**
 * Image frames a picture on the band: a pulsing band while it loads, a short
 * fade in, and a built-in fallback (glyph plus the alt words) when it fails.
 * `src` and `alt` are required; `alt` says what the image shows.
 */
const SAMPLE_SRC = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop";

const meta = {
  title: "Display/Image",
  component: Image,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "Frames a picture on the band, with a loading pulse and a built-in error fallback.",
      },
    },
  },
  argTypes: {
    aspectRatio: {
      control: "select",
      options: ["1:1", "4:3", "16:9", "auto"],
      description: "The frame's aspect ratio",
    },
    objectFit: {
      control: "select",
      options: ["cover", "contain"],
      description: "How the image fills the frame",
    },
    radius: {
      control: "select",
      options: ["none", "control", "nested", "surface"],
      description: "Corner role; none leaves the corner to the container",
    },
  },
  args: {
    src: SAMPLE_SRC,
    alt: "Code on a screen",
    width: 300,
  },
} satisfies Meta<typeof Image>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The three frames: square, 4:3 and 16:9. */
export const AspectRatios: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
      <Image {...args} aspectRatio="1:1" width={160} />
      <Image {...args} aspectRatio="4:3" width={200} />
      <Image {...args} aspectRatio="16:9" width={240} />
    </div>
  ),
};

/** `contain` letterboxes on the band; `cover` crops. */
export const Fits: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12 }}>
      <Image {...args} aspectRatio="1:1" width={160} objectFit="cover" />
      <Image {...args} aspectRatio="1:1" width={160} objectFit="contain" />
    </div>
  ),
};

/** The corner roles. */
export const Radii: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12 }}>
      {(["none", "control", "nested", "surface"] as const).map((radius) => (
        <Image key={radius} {...args} aspectRatio="4:3" width={160} radius={radius} />
      ))}
    </div>
  ),
};

/** A broken source shows the built-in fallback: the glyph and the alt words. */
export const Broken: Story = {
  args: {
    src: "https://invalid-url.example/image.jpg",
    alt: "Team photo from the offsite",
    aspectRatio: "4:3",
    width: 240,
    radius: "control",
  },
};
