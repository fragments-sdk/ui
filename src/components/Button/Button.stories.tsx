import type { Meta, StoryObj } from "@storybook/react";
import { CaretDown } from "@phosphor-icons/react";
import { Button } from ".";
import { ButtonGroup } from "../ButtonGroup";
import { Stack } from "../Stack";
import { RENDER_STATES } from "../../storybook/render-states";

const VARIANTS = ["solid", "soft", "outline", "ghost", "link"] as const;
const TONES = ["neutral", "accent", "info", "success", "warning", "danger"] as const;

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
      options: TONES,
      description: "Colour; defaults to accent on solid/link and neutral elsewhere",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Control height",
    },
    icon: { control: "boolean", description: "Icon-only square layout" },
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

export const Outline: Story = {
  args: { variant: "outline", children: "View details" },
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

export const Small: Story = {
  args: { size: "sm", children: "Compact" },
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
        story: "Every variant across every tone. Chroma is earned: reach for a tone only when the action carries that meaning.",
      },
    },
  },
  render: () => (
    <Stack gap="md">
      {VARIANTS.map((variant) => (
        <Stack key={variant} direction="row" gap="sm" align="center" wrap>
          {TONES.map((tone) => (
            <Button key={tone} variant={variant} tone={tone}>
              {variant} {tone}
            </Button>
          ))}
        </Stack>
      ))}
    </Stack>
  ),
};

export const ReferenceChrome: Story = {
  render: () => (
    <Stack direction="row" gap="lg" align="center" wrap>
      <ButtonGroup gap="none" role="group" aria-label="RSVP answer">
        <Button variant="solid" size="lg">
          Yes
        </Button>
        <Button variant="solid" size="lg" icon aria-label="More yes options">
          <CaretDown weight="bold" />
        </Button>
      </ButtonGroup>

      <Button variant="soft" size="lg">
        No
      </Button>

      <Button variant="soft" size="lg">
        Maybe
      </Button>

      <Button variant="soft" size="lg">
        Add Note
      </Button>
    </Stack>
  ),
};
