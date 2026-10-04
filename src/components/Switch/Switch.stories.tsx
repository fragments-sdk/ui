import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from ".";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Switch is a binary on/off control for settings and preferences. It supports
 * controlled and uncontrolled checked state, an optional label beside the
 * track, helper text, read-only and an invalid message. One 36×18 size.
 */
const meta = {
  title: "Forms/Switch",
  component: Switch,
  tags: ["autodocs", "canonical"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Binary on/off switch for settings and preferences.",
      },
    },
  },
  argTypes: {
    disabled: { control: "boolean", description: "Disable the switch" },
    readOnly: { control: "boolean", description: "Prevent the user from toggling" },
    required: { control: "boolean", description: "Mark the switch as required" },
    invalid: { control: "boolean", description: "Show errorMessage under the label" },
    defaultChecked: { control: "boolean", description: "Default checked state (uncontrolled)" },
  },
  args: { label: "Enable notifications", defaultChecked: false },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Enable notifications" },
};

export const Checked: Story = {
  args: { label: "Auto-save", defaultChecked: true },
};

export const WithHelperText: Story = {
  args: {
    label: "Marketing emails",
    helperText: "Receive occasional product updates and offers.",
  },
};

export const ReadOnly: Story = {
  args: { label: "Managed by your organisation", readOnly: true, defaultChecked: true },
};

export const Invalid: Story = {
  args: {
    label: "Share findings with the team",
    invalid: true,
    errorMessage: "Sharing is off on this plan.",
  },
};

export const IconOnly: Story = {
  args: { label: undefined, "aria-label": "Dark mode" },
};

export const Disabled: Story = {
  args: { label: "Locked setting", disabled: true, defaultChecked: true },
};
