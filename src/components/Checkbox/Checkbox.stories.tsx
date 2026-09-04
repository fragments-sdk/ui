import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from ".";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Binary toggle for form fields that require explicit submission.
 * Supports controlled and uncontrolled use, an indeterminate state, and
 * sizes sm/md/lg. Prefer Switch for immediate-effect settings.
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
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Checkbox size",
    },
    variant: {
      control: "select",
      options: [undefined, "outline"],
      description: "Omit for the inline checkbox; outline renders a full-width bordered surface",
    },
    indeterminate: { control: "boolean", description: "Partial selection state" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
  args: { size: "md", label: "Accept terms and conditions" },
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

export const Large: Story = {
  args: { size: "lg", label: "Large checkbox" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultChecked: true, label: "Disabled checked" },
};
