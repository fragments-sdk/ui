import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Data Table',
  description: 'Table displaying structured data with columns',
  category: 'dashboard',
  components: ['Card', 'Table'],
  tags: ['table', 'data', 'grid', 'dashboard', 'list'],
  code: `
const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'status', header: 'Status' },
];

const data = [
  { name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { name: 'Jane Smith', email: 'jane@example.com', status: 'Pending' },
  { name: 'Bob Wilson', email: 'bob@example.com', status: 'Active' },
];

<Card>
  <Card.Header>
    <Card.Title>Users</Card.Title>
  </Card.Header>
  <Table data={data} columns={columns} />
</Card>
`.trim(),
});
