import type { Meta, StoryObj } from "@storybook/react";
import { Combobox } from ".";
import { Field } from "../Field";
import { Stack } from "../Stack";
import { RENDER_STATES } from "../../storybook/render-states";

/**
 * Searchable select that filters a dropdown of options as you type.
 * Compose Combobox.Input and Combobox.Content with Combobox.Item children,
 * inside a Field for the label, description and error. With no match the
 * list names the query; `loading` says Searching… while options load.
 */
const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component: "Searchable select that filters options as you type.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Field height on the shared control track: 24, 28, 32 or 40",
    },
    multiple: { control: "boolean", description: "Allow multiple selections" },
    autoHighlight: {
      control: "boolean",
      description: "Auto-highlight first match while filtering",
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    invalid: { control: "boolean" },
    loading: { control: "boolean" },
  },
  args: {
    size: "md",
    placeholder: "Select a fruit",
    children: null,
  },
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

const fruits = (
  <>
    <Combobox.Item value="apple">Apple</Combobox.Item>
    <Combobox.Item value="banana">Banana</Combobox.Item>
    <Combobox.Item value="orange">Orange</Combobox.Item>
    <Combobox.Item value="grape">Grape</Combobox.Item>
    <Combobox.Item value="mango">Mango</Combobox.Item>
  </>
);

export const Default: Story = {
  render: (args) => (
    <Field>
      <Field.Label>Fruit</Field.Label>
      <Combobox {...args}>
        <Combobox.Input />
        <Combobox.Content>{fruits}</Combobox.Content>
      </Combobox>
    </Field>
  ),
};

export const Multiple: Story = {
  args: { multiple: true, placeholder: "Select fruits…" },
  render: (args) => (
    <Field>
      <Field.Label>Fruits</Field.Label>
      <Combobox
        multiple
        size={args.size}
        placeholder={args.placeholder}
        defaultValue={["apple", "mango"]}
      >
        <Combobox.Input />
        <Combobox.Content>{fruits}</Combobox.Content>
      </Combobox>
    </Field>
  ),
};

export const WithDescription: Story = {
  args: { placeholder: "Search assignees…" },
  render: (args) => (
    <Field>
      <Field.Label>Assignee</Field.Label>
      <Combobox {...args}>
        <Combobox.Input />
        <Combobox.Content>
          <Combobox.Item value="alice">Alice Johnson</Combobox.Item>
          <Combobox.Item value="bob">Bob Chen</Combobox.Item>
          <Combobox.Item value="carol">Carol Smith</Combobox.Item>
        </Combobox.Content>
      </Combobox>
      <Field.Description>Type to filter the list of available assignees.</Field.Description>
    </Field>
  ),
};

export const WithGroups: Story = {
  args: { placeholder: "Search countries…" },
  render: (args) => (
    <Field>
      <Field.Label>Country</Field.Label>
      <Combobox {...args}>
        <Combobox.Input />
        <Combobox.Content>
          <>
            <Combobox.Group>
              <Combobox.GroupLabel>North America</Combobox.GroupLabel>
              <Combobox.Item value="us">United States</Combobox.Item>
              <Combobox.Item value="ca">Canada</Combobox.Item>
            </Combobox.Group>
            <Combobox.Group>
              <Combobox.GroupLabel>Europe</Combobox.GroupLabel>
              <Combobox.Item value="uk">United Kingdom</Combobox.Item>
              <Combobox.Item value="de">Germany</Combobox.Item>
            </Combobox.Group>
            <Combobox.Empty>No matching country</Combobox.Empty>
          </>
        </Combobox.Content>
      </Combobox>
    </Field>
  ),
};

export const Invalid: Story = {
  args: { placeholder: "Search reviewers…" },
  render: (args) => (
    <Field invalid>
      <Field.Label>Reviewer</Field.Label>
      <Combobox {...args} invalid>
        <Combobox.Input />
        <Combobox.Content>
          <Combobox.Item value="alice">Alice</Combobox.Item>
          <Combobox.Item value="bob">Bob</Combobox.Item>
        </Combobox.Content>
      </Combobox>
      <Field.Error match>Choose a reviewer.</Field.Error>
    </Field>
  ),
};

export const Loading: Story = {
  args: { placeholder: "Search repositories…", loading: true, defaultOpen: true },
  render: (args) => (
    <Field>
      <Field.Label>Repository</Field.Label>
      <Combobox {...args}>
        <Combobox.Input />
        <Combobox.Content>{null}</Combobox.Content>
      </Combobox>
    </Field>
  ),
};

export const ReadOnly: Story = {
  render: (args) => (
    <Field>
      <Field.Label>Fruit</Field.Label>
      <Combobox size={args.size} readOnly defaultValue="mango">
        <Combobox.Input />
        <Combobox.Content>{fruits}</Combobox.Content>
      </Combobox>
    </Field>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="md">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Combobox key={size} {...args} size={size}>
          <Combobox.Input aria-label={`Fruit, ${size}`} />
          <Combobox.Content>{fruits}</Combobox.Content>
        </Combobox>
      ))}
    </Stack>
  ),
};
