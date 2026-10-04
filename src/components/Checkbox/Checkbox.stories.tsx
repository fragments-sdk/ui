import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from ".";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Binary toggle for form fields that require explicit submission.
 * Supports controlled and uncontrolled use, an indeterminate state, read-only,
 * invalid with a message, and the outline choice card. One box size.
 * Prefer Switch for immediate-effect settings.
 */
const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  tags: ["autodocs", "canonical"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Binary toggle for form fields requiring explicit submission.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [undefined, "outline"],
      description: "Omit for the inline checkbox; outline renders a full-width choice card",
    },
    indeterminate: { control: "boolean", description: "Partial selection state" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    invalid: { control: "boolean", description: "Danger edge plus errorMessage" },
  },
  args: { label: "Accept terms and conditions" },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Accept terms and conditions" },
};

export const Checked: Story = {
  args: { defaultChecked: true, label: "Subscribe to newsletter" },
};

export const WithHelperText: Story = {
  args: {
    label: "Email notifications",
    helperText: "Receive email updates about your account activity",
  },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: "Select all" },
};

export const Invalid: Story = {
  args: {
    label: "I accept the terms",
    invalid: true,
    errorMessage: "Accept the terms to continue.",
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultChecked: true, label: "Managed by your organisation" },
};

export const OutlineCard: Story = {
  args: {
    variant: "outline",
    defaultChecked: true,
    label: "Weekly summary",
    helperText: "One email on Monday morning.",
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultChecked: true, label: "Disabled checked" },
};
