import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, CaretDown, Plus } from "@phosphor-icons/react";
import { Button } from ".";
import { ButtonGroup } from "../ButtonGroup";
import { IconButton } from "../IconButton";
import { Stack } from "../Stack";
import { RENDER_STATES } from "../../storybook/render-states";

const VARIANTS = ["solid", "soft", "ghost", "link"] as const;
const SIZES = ["xs", "sm", "md", "lg"] as const;
/** The tone matrix: each variant lists the tones it takes, its default first. */
const LOOKS = [
  { variant: "solid", tone: "accent" },
  { variant: "solid", tone: "danger" },
  { variant: "soft", tone: "neutral" },
  { variant: "soft", tone: "danger" },
  { variant: "ghost", tone: "neutral" },
  { variant: "ghost", tone: "danger" },
  { variant: "link", tone: "accent" },
  { variant: "link", tone: "neutral" },
] as const;

/**
 * The Button is the canonical action primitive. Every CTA, form submit, and
 * row action in the design system routes through it — agents should reuse it
 * rather than hand-rolling a styled `<button>`.
 */
const meta = {
  title: "Forms/Button",
  component: Button,
  tags: ["autodocs", "canonical"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component:
          "Interactive element for user actions and form submissions. Prefer this over a raw <button>.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: VARIANTS,
      description: "Chrome family",
    },
    tone: {
      control: "select",
      options: ["accent", "neutral", "danger"],
      description:
        "Colour: solid takes accent|danger, soft and ghost neutral|danger (ink), link accent|neutral",
    },
    size: {
      control: "select",
      options: SIZES,
      description: "Control height: xs 24, sm 28, md 32, lg 40",
    },
    pending: { control: "boolean", description: "Work is running; presses are ignored" },
    fullWidth: { control: "boolean", description: "Stretch to container width" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "solid",
    size: "md",
    children: "Save changes",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Solid: Story = {
  args: { variant: "solid", children: "Save changes" },
};

export const Soft: Story = {
  args: { variant: "soft", children: "Cancel" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Dismiss" },
};

export const Link: Story = {
  args: { variant: "link", children: "View all →" },
};

export const Danger: Story = {
  args: { variant: "solid", tone: "danger", children: "Delete" },
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" gap="sm" align="center">
      {SIZES.map((size) => (
        <Button key={size} size={size} variant="soft">
          <Plus />
          {size}
        </Button>
      ))}
    </Stack>
  ),
};

export const Pending: Story = {
  args: { pending: true, children: "Saving" },
};

/** `render` swaps the element: an anchor keeps its link role and takes the button's look. */
export const RenderAsLink: Story = {
  render: () => (
    <Stack direction="row" gap="sm" align="center">
      <Button render={<a href="#docs" />}>Read the docs</Button>
      <Button variant="link" render={<a href="#changelog" />}>
        Changelog
        <ArrowRight />
      </Button>
    </Stack>
  ),
};

export const FullWidth: Story = {
  args: { fullWidth: true, children: "Continue" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Unavailable" },
};

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every variant with the tones it takes. Chroma is earned: soft and ghost stay neutral and show danger as ink only.",
      },
    },
  },
  render: () => (
    <Stack gap="md">
      {VARIANTS.map((variant) => (
        <Stack key={variant} direction="row" gap="sm" align="center" wrap>
          {LOOKS.filter((look) => look.variant === variant).map((look) => (
            <Button key={look.tone} {...look}>
              {look.variant} {look.tone}
            </Button>
          ))}
        </Stack>
      ))}
    </Stack>
  ),
};

export const ReferenceChrome: Story = {
  render: () => (
    <Stack direction="row" gap="sm" align="center" wrap>
      <ButtonGroup aria-label="RSVP answer">
        <Button size="lg">Yes</Button>
        <IconButton variant="soft" size="lg" aria-label="More yes options">
          <CaretDown weight="bold" />
        </IconButton>
      </ButtonGroup>

      <Button variant="soft" size="lg">
        No
      </Button>

      <Button variant="soft" size="lg">
        Maybe
      </Button>
    </Stack>
  ),
};
