import type { Meta, StoryObj } from "@storybook/react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from ".";

/**
 * Single-line text input with built-in label, helper text, and validation states.
 * Supports controlled/uncontrolled values, adornments, and a keyboard shortcut hint.
 */
const meta = {
  title: "Forms/Input",
  component: Input,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component: "Text input field for single-line user data entry.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["number", "text", "email", "password", "tel", "url"],
      description: "HTML input type for validation and keyboard",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size variant",
    },
    shortcutBehavior: {
      control: "select",
      options: ["display-only", "focus-input"],
      description: "Whether the shortcut hint is visual only or registers a hotkey",
    },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    success: { control: "boolean" },
    required: { control: "boolean" },
    withFieldWrapper: { control: "boolean" },
  },
  args: {
    label: "Name",
    placeholder: "Enter your name",
    type: "text",
    size: "md",
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Name", placeholder: "Enter your name" },
};

export const Email: Story = {
  args: { label: "Email", type: "email", placeholder: "user@example.com" },
};

export const WithHelper: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Create a password",
    helperText: "Must be at least 8 characters",
  },
};

export const ErrorState: Story = {
  args: {
    label: "Email",
    type: "email",
    value: "invalid-email",
    error: true,
    helperText: "Please enter a valid email address",
  },
};

export const Disabled: Story = {
  args: { label: "Username", value: "readonly-user", disabled: true },
};

export const Required: Story = {
  args: {
    label: "Email",
    type: "email",
    placeholder: "user@example.com",
    required: true,
  },
};

export const SearchWithShortcut: Story = {
  args: {
    "aria-label": "Search findings",
    placeholder: "Search findings...",
    shortcut: "⌘K",
    shortcutBehavior: "focus-input",
    startAdornment: <MagnifyingGlass aria-hidden="true" />,
    withFieldWrapper: false,
    rootProps: { style: { maxWidth: 420 } },
  },
};
