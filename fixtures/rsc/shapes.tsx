// One shape per compound: what /server/<Name> and /control/<Name> render.
// No directive: the server route renders it as a server module, the control as a client module.
// A shape is valid when its control route renders; the runner fails any control that does not.
// The icon package main entry creates a context at import, so a server module uses its /ssr entry.
import { Heart } from "@phosphor-icons/react/ssr";
import {
  Accordion,
  Chart,
  CodeBlock,
  Combobox,
  Command,
  ConversationList,
  DataTable,
  Editor,
  Field,
  Header,
  Icon,
  Input,
  Markdown,
  Menu,
  Message,
  NumberField,
  Prompt,
  Select,
  Table,
  Tabs,
  Textarea,
  Tooltip,
} from "@usefragments/ui";
import { DataTableVirtual } from "@usefragments/ui/data-table-virtual";
import type { ComponentType, ReactNode } from "react";
import type { Compound } from "./.output/compounds.generated";

type Part = ComponentType<{ children?: ReactNode }>;
type Row = { id: string; name: string };

const rows: Row[] = [
  { id: "1", name: "Ada" },
  { id: "2", name: "Grace" },
];

/** Compounds whose parts need props, values or a particular nesting to render. */
const shapes: Record<string, () => ReactNode> = {
  Accordion: () => (
    <Accordion type="single" collapsible defaultValue="one">
      <Accordion.Item value="one">
        <Accordion.Trigger>Accordion.Trigger</Accordion.Trigger>
        <Accordion.Content>Accordion.Content</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
  Chart: () => (
    <Chart config={{ value: { label: "Value" } }} summary="Chart.Root">
      <Chart.Legend />
    </Chart>
  ),
  CodeBlock: () => <CodeBlock code="const answer = 42;" language="ts" />,
  Combobox: () => (
    <Combobox placeholder="Combobox.Input">
      <Combobox.Input />
      <Combobox.Content>
        <Combobox.Item value="one">Combobox.Item</Combobox.Item>
      </Combobox.Content>
    </Combobox>
  ),
  Command: () => (
    <Command>
      <Command.Input placeholder="Command.Input" />
      <Command.List>
        <Command.Item>Command.Item</Command.Item>
        <Command.Empty>Command.Empty</Command.Empty>
      </Command.List>
    </Command>
  ),
  ConversationList: () => (
    <ConversationList>
      <ConversationList.Event date={new Date(Date.UTC(2026, 0, 15))} />
      <Message from="user">
        <Message.Content>ConversationList</Message.Content>
      </Message>
    </ConversationList>
  ),
  DataTable: () => (
    <DataTable<Row>
      columns={[{ accessorKey: "name", header: "Name" }]}
      data={rows}
      getRowId={(row) => row.id}
    />
  ),
  DataTableVirtual: () => (
    <DataTableVirtual<Row>
      caption="DataTableVirtual"
      header={
        <Table.Row>
          <DataTableVirtual.HeaderCell>Name</DataTableVirtual.HeaderCell>
        </Table.Row>
      }
      virtualRows={rows.map((item, index) => ({ index, item, key: item.id }))}
      paddingTop={0}
      paddingBottom={0}
      colSpan={1}
      renderRow={(row) => (
        <DataTableVirtual.Row key={row.key}>
          <DataTableVirtual.Cell>{row.item.name}</DataTableVirtual.Cell>
        </DataTableVirtual.Row>
      )}
    />
  ),
  Editor: () => <Editor placeholder="Editor" />,
  Field: () => (
    <Field name="email">
      <Field.Label>Field.Label</Field.Label>
      <Field.Control>
        <Input type="email" aria-label="Email" />
      </Field.Control>
      <Field.Description>Field.Description</Field.Description>
    </Field>
  ),
  Header: () => (
    <Header>
      <Header.SkipLink />
      <Header.Trigger />
      <Header.Brand href="/">Header.Brand</Header.Brand>
      <Header.Nav>
        <Header.NavItem href="/" active>
          Header.NavItem
        </Header.NavItem>
      </Header.Nav>
      <Header.Actions>Header.Actions</Header.Actions>
    </Header>
  ),
  Icon: () => <Icon icon={Heart} aria-label="Icon" />,
  Markdown: () => <Markdown content="Markdown" />,
  Menu: () => (
    <Menu>
      <Menu.Trigger>Menu.Trigger</Menu.Trigger>
      <Menu.Content>
        <Menu.Item>Menu.Item</Menu.Item>
        <Menu.Separator />
      </Menu.Content>
    </Menu>
  ),
  Message: () => (
    <Message from="assistant">
      <Message.Content>Message.Content</Message.Content>
    </Message>
  ),
  NumberField: () => <NumberField aria-label="NumberField" />,
  Prompt: () => (
    <Prompt>
      <Prompt.Textarea />
      <Prompt.Toolbar>
        <Prompt.Actions>
          <Prompt.Submit />
        </Prompt.Actions>
      </Prompt.Toolbar>
    </Prompt>
  ),
  Select: () => (
    <Select placeholder="Select.Trigger">
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="one">Select.Item</Select.Item>
      </Select.Content>
    </Select>
  ),
  Tabs: () => (
    <Tabs defaultValue="one">
      <Tabs.List>
        <Tabs.Tab value="one">Tabs.Tab</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="one">Tabs.Panel</Tabs.Panel>
    </Tabs>
  ),
  Textarea: () => <Textarea aria-label="Textarea" />,
  Tooltip: () => (
    <Tooltip content="Tooltip">
      <button type="button">Tooltip</button>
    </Tooltip>
  ),
};

/** Without a shape, a compound renders its root with each component part inside. */
export function renderShape(name: string, compound: Compound): ReactNode {
  const shape = shapes[name];
  if (shape) return shape();
  const Root = compound.root as Part & Record<string, Part>;
  return (
    <Root>
      {compound.parts
        .filter((part) => /^[A-Z]/.test(part))
        .map((part) => {
          const Child = Root[part];
          return <Child key={part}>{`${name}.${part}`}</Child>;
        })}
    </Root>
  );
}
