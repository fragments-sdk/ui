import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from ".";
import { Field } from "../Field";
import { Stack } from "../Stack";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Textarea is the canonical multi-line text input. It grows with its text from
 * `minRows` to `maxRows`, then scrolls; `maxLength` shows a counter. Label,
 * description and error come from Field.
 */
const meta = {
  title: "Forms/Textarea",
  component: Textarea,
  tags: ["autodocs", "canonical"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component:
          "Multi-line text input for longer form content. Compose it in a Field for the label, description and error. Prefer this over a raw <textarea>.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Type size, inset and one-row height on the shared control ladder",
    },
    resize: {
      control: "select",
      options: ["none", "vertical"],
      description: "Whether the person can drag the height",
    },
    minRows: { control: "number" },
    maxRows: { control: "number" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    invalid: { control: "boolean" },
  },
  args: {
    placeholder: "What does this change do?",
    size: "md",
    minRows: 3,
  },
  render: (args) => (
    <Field>
      <Field.Label>Description</Field.Label>
      <Textarea {...args} />
    </Field>
  ),
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCounter: Story = {
  render: (args) => (
    <Field>
      <Field.Label>Bio</Field.Label>
      <Textarea {...args} placeholder={undefined} maxLength={200} />
      <Field.Description>Shown on your profile.</Field.Description>
    </Field>
  ),
};

export const OverTheLimit: Story = {
  render: (args) => (
    <Field invalid>
      <Field.Label>Summary</Field.Label>
      <Textarea
        {...args}
        invalid
        maxLength={40}
        defaultValue="This summary runs well past the forty character limit."
      />
      <Field.Error match>Shorten the summary to 40 characters.</Field.Error>
    </Field>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <Field invalid>
      <Field.Label>Comments</Field.Label>
      <Textarea {...args} />
      <Field.Error match>Add a comment.</Field.Error>
    </Field>
  ),
};

export const GrowToCeiling: Story = {
  args: { minRows: 1, maxRows: 6 },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: "Moves the billing page onto the shared layout." },
};

export const Disabled: Story = {
  render: (args) => (
    <Field disabled>
      <Field.Label>Notes</Field.Label>
      <Textarea {...args} disabled />
    </Field>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="md">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Textarea key={size} {...args} aria-label={`Size ${size}`} size={size} minRows={1} />
      ))}
    </Stack>
  ),
};
