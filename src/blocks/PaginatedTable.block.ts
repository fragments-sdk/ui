import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Paginated Table',
  description: 'Data table with pagination controls at the bottom',
  category: 'dashboard',
  components: ['Card', 'Table', 'Pagination'],
  tags: ['table', 'pagination', 'data', 'dashboard', 'list'],
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
  <Card.Footer>
    <Pagination totalPages={10} defaultPage={1}>
      <Pagination.Previous />
      <Pagination.Items />
      <Pagination.Next />
    </Pagination>
  </Card.Footer>
</Card>
`.trim(),
});
