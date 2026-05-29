import type { Meta, StoryObj } from '@storybook/react';
import { Table } from '.';

/**
 * Table is the canonical semantic-HTML table primitive. Reach for it whenever
 * you need to render static tabular data with headers, rows, and footers —
 * agents should compose `Table.Head`/`Table.Body`/`Table.Row` rather than
 * hand-rolling `<table>` markup. For sorting and selection, use DataTable.
 */
const meta = {
  title: 'Display/Table',
  component: Table,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Semantic HTML table with a compound API. Prefer this over a raw <table>; use DataTable when you need sorting or selection.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Table density',
    },
    striped: { control: 'boolean', description: 'Show alternating row backgrounds' },
    bordered: { control: 'boolean', description: 'Wrap table in a bordered container' },
  },
  args: {
    size: 'md',
    striped: false,
    bordered: false,
  },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table {...args} aria-label="Team members">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Role</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Alice Johnson</Table.Cell>
          <Table.Cell>Engineer</Table.Cell>
          <Table.Cell>Active</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Bob Smith</Table.Cell>
          <Table.Cell>Designer</Table.Cell>
          <Table.Cell>Active</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Carol Williams</Table.Cell>
          <Table.Cell>PM</Table.Cell>
          <Table.Cell>Away</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};

export const Striped: Story = {
  args: { striped: true },
  render: (args) => (
    <Table {...args} aria-label="Inventory">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Item</Table.HeaderCell>
          <Table.HeaderCell>Category</Table.HeaderCell>
          <Table.HeaderCell>Qty</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Widget A</Table.Cell>
          <Table.Cell>Hardware</Table.Cell>
          <Table.Cell>120</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Widget B</Table.Cell>
          <Table.Cell>Software</Table.Cell>
          <Table.Cell>85</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Widget C</Table.Cell>
          <Table.Cell>Hardware</Table.Cell>
          <Table.Cell>200</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};

export const Bordered: Story = {
  args: { bordered: true },
  render: (args) => (
    <Table {...args} aria-label="Pricing">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Plan</Table.HeaderCell>
          <Table.HeaderCell>Price</Table.HeaderCell>
          <Table.HeaderCell>Features</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Basic</Table.Cell>
          <Table.Cell>$9/mo</Table.Cell>
          <Table.Cell>5 projects</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Pro</Table.Cell>
          <Table.Cell>$29/mo</Table.Cell>
          <Table.Cell>Unlimited</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};

export const Compact: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <Table {...args} aria-label="Shortcuts">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Key</Table.HeaderCell>
          <Table.HeaderCell>Action</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Ctrl+S</Table.Cell>
          <Table.Cell>Save</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Ctrl+Z</Table.Cell>
          <Table.Cell>Undo</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Ctrl+C</Table.Cell>
          <Table.Cell>Copy</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};

export const WithCaption: Story = {
  render: (args) => (
    <Table {...args} aria-label="Q1 results">
      <Table.Caption>Quarterly Results (Q1 2026)</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Metric</Table.HeaderCell>
          <Table.HeaderCell>Value</Table.HeaderCell>
          <Table.HeaderCell>Change</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Revenue</Table.Cell>
          <Table.Cell>$1.2M</Table.Cell>
          <Table.Cell>+15%</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Users</Table.Cell>
          <Table.Cell>24,500</Table.Cell>
          <Table.Cell>+8%</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};

export const WithFooter: Story = {
  args: { bordered: true },
  render: (args) => (
    <Table {...args} aria-label="Expenses">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Category</Table.HeaderCell>
          <Table.HeaderCell>Amount</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Marketing</Table.Cell>
          <Table.Cell>$12,000</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Engineering</Table.Cell>
          <Table.Cell>$45,000</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Operations</Table.Cell>
          <Table.Cell>$8,000</Table.Cell>
        </Table.Row>
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell>Total</Table.Cell>
          <Table.Cell>$65,000</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table>
  ),
};
