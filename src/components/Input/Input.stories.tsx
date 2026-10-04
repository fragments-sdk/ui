import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Input } from ".";
import { Field } from "../Field";
import { Stack } from "../Stack";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Single-line text field on the band. Label, description and error come from
 * Field. `type="search"` adds a leading glyph, a clear button, Escape to clear
 * then leave, and a live match count.
 */
const meta = {
  title: "Forms/Input",
  component: Input,
  tags: ["autodocs", "canonical"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Text input field for single-line user data entry.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search"],
      description: "Native input type; search adds clear, Escape and the count slot",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Field height on the shared control track: 24, 28, 32 or 40",
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    invalid: { control: "boolean" },
  },
  args: {
    placeholder: "Ada Lovelace",
    type: "text",
    size: "md",
  },
  render: (args) => (
    <Field>
      <Field.Label>Name</Field.Label>
      <Input {...args} />
    </Field>
  ),
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  render: (args) => (
    <Field>
      <Field.Label>Password</Field.Label>
      <Input {...args} type="password" placeholder={undefined} />
      <Field.Description>At least 8 characters.</Field.Description>
    </Field>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <Field invalid>
      <Field.Label>Email</Field.Label>
      <Input {...args} type="email" defaultValue="invalid-email" />
      <Field.Error match>Enter a valid email address.</Field.Error>
    </Field>
  ),
};

export const Required: Story = {
  render: (args) => (
    <Field>
      <Field.Label>
        Email <Field.Required />
      </Field.Label>
      <Input {...args} type="email" placeholder="user@example.com" required />
    </Field>
  ),
};

export const ReadOnly: Story = {
  args: { defaultValue: "acme/web", readOnly: true },
};

export const Disabled: Story = {
  render: (args) => (
    <Field disabled>
      <Field.Label>Username</Field.Label>
      <Input {...args} defaultValue="ada.lovelace" disabled />
    </Field>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="column" gap="md">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Input key={size} {...args} aria-label={`Size ${size}`} size={size} placeholder={size} />
      ))}
    </Stack>
  ),
};

export const Adornments: Story = {
  render: (args) => (
    <Field>
      <Field.Label>Price</Field.Label>
      <Input {...args} startAdornment="$" endAdornment="USD" placeholder="0.00" />
    </Field>
  ),
};

export const Search: Story = {
  render: (args) => {
    const items = ["Button", "Card", "Checkbox", "Combobox", "Dialog", "Input", "Select", "Tabs"];
    function Demo() {
      const [query, setQuery] = React.useState("");
      const matches = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
      return (
        <Stack gap="sm" style={{ maxInlineSize: 360 }}>
          <Input
            {...args}
            type="search"
            aria-label="Filter components"
            placeholder="Filter"
            shortcut="/"
            value={query}
            onValueChange={setQuery}
            count={`${matches.length} of ${items.length}`}
          />
          <span>{matches.join(", ") || "No match"}</span>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const ShortcutHint: Story = {
  args: {
    type: "search",
    "aria-label": "Search findings",
    placeholder: "Search findings",
    shortcut: "⌘K",
  },
  render: (args) => <Input {...args} />,
};
