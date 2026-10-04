import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "../Link";
import { Stack } from "../Stack";
import { EmptyState } from "../EmptyState";
import { Table } from ".";

/**
 * Table is the canonical semantic-HTML table primitive. Reach for it whenever
 * you need to render static tabular data with headers, rows, and footers —
 * agents should compose `Table.Head`/`Table.Body`/`Table.Row` rather than
 * hand-rolling `<table>` markup. For sorting and selection, use DataTable.
 */
const meta = {
  title: "Display/Table",
  component: Table,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "Semantic HTML table with a compound API. Prefer this over a raw <table>; use DataTable when you need sorting or selection.",
      },
    },
  },
  argTypes: {
    bordered: {
      control: "boolean",
      description: "Draw the sheet: surface plane, hairline border, surface radius",
    },
  },
  args: {
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

export const BorderedEdgeCases: Story = {
  args: { bordered: true },
  render: (args) => (
    <Stack gap="md">
      <Table {...args} aria-label="Repository adoption">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Repository</Table.HeaderCell>
            <Table.HeaderCell>State</Table.HeaderCell>
            <Table.HeaderCell>Adoption</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Link href="#">fragments-sdk/a-repository-with-a-deliberately-long-name</Link>
            </Table.Cell>
            <Table.Cell>Enforcing</Table.Cell>
            <Table.Cell>90%</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      <Table {...args} aria-label="Empty repository adoption">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Repository</Table.HeaderCell>
            <Table.HeaderCell>State</Table.HeaderCell>
            <Table.HeaderCell>Adoption</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell colSpan={3}>No repositories to show</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Stack>
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

export const SelectedRow: Story = {
  render: (args) => (
    <Table {...args} aria-label="Repositories">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Repository</Table.HeaderCell>
          <Table.HeaderCell>Findings</Table.HeaderCell>
          <Table.HeaderCell>Verdict</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>web</Table.Cell>
          <Table.Cell tabularNums>12</Table.Cell>
          <Table.Cell>Blocked</Table.Cell>
        </Table.Row>
        <Table.Row selected>
          <Table.Cell>api</Table.Cell>
          <Table.Cell tabularNums>3</Table.Cell>
          <Table.Cell>Passing</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>docs</Table.Cell>
          <Table.Cell tabularNums>0</Table.Cell>
          <Table.Cell>Passing</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};

export const StickyHead: Story = {
  render: (args) => (
    <Table {...args} maxHeight={200} aria-label="Repositories">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Repository</Table.HeaderCell>
          <Table.HeaderCell>Findings</Table.HeaderCell>
          <Table.HeaderCell>Verdict</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {Array.from({ length: 16 }, (_, index) => (
          <Table.Row key={index}>
            <Table.Cell>repo-{index + 1}</Table.Cell>
            <Table.Cell tabularNums>{index % 5}</Table.Cell>
            <Table.Cell>{index % 5 === 0 ? "Passing" : "Blocked"}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
};

export const Empty: Story = {
  render: (args) => (
    <Table {...args} aria-label="Repositories">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Repository</Table.HeaderCell>
          <Table.HeaderCell>Findings</Table.HeaderCell>
          <Table.HeaderCell>Verdict</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Empty colSpan={3}>
          <EmptyState.Title>No repositories yet</EmptyState.Title>
          <EmptyState.Description>
            Connect a repository to see its findings here.
          </EmptyState.Description>
        </Table.Empty>
      </Table.Body>
    </Table>
  ),
};

export const Loading: Story = {
  render: (args) => (
    <Table {...args} aria-label="Repositories">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Repository</Table.HeaderCell>
          <Table.HeaderCell>Findings</Table.HeaderCell>
          <Table.HeaderCell>Verdict</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body aria-busy="true">
        <Table.Loading columns={3} rows={4} />
      </Table.Body>
    </Table>
  ),
};
