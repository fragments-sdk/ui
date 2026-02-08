import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Table, createColumns } from './index';

type Person = { id: string; name: string; age: number };

const columns = createColumns<Person>([
  { key: 'name', header: 'Name' },
  { key: 'age', header: 'Age' },
]);

const data: Person[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
  { id: '3', name: 'Carol', age: 35 },
];

describe('Table', () => {
  it('renders a table element with column headers', () => {
    render(<Table columns={columns} data={data} aria-label="People" />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveAttribute('scope', 'col');
    expect(headers[0]).toHaveTextContent('Name');
    expect(headers[1]).toHaveTextContent('Age');
  });

  it('renders data rows', () => {
    render(<Table columns={columns} data={data} aria-label="People" />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 3 data rows
    expect(rows).toHaveLength(4);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders caption when provided', () => {
    render(<Table columns={columns} data={data} caption="People Table" aria-label="People" />);
    expect(screen.getByText('People Table')).toBeInTheDocument();
  });

  it('shows empty state message when data is empty', () => {
    render(<Table columns={columns} data={[]} emptyMessage="Nothing here" aria-label="People" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('defaults to "No data available" empty message', () => {
    render(<Table columns={columns} data={[]} aria-label="People" />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('supports sortable columns with aria-sort', async () => {
    const user = userEvent.setup();
    render(<Table columns={columns} data={data} sortable aria-label="People" />);
    const headers = screen.getAllByRole('columnheader');
    // Initially aria-sort="none" for sortable columns
    expect(headers[0]).toHaveAttribute('aria-sort', 'none');

    // Click the sort button inside the first header
    const sortButton = headers[0].querySelector('button')!;
    await user.click(sortButton);
    expect(headers[0]).toHaveAttribute('aria-sort', 'ascending');

    await user.click(sortButton);
    expect(headers[0]).toHaveAttribute('aria-sort', 'descending');
  });

  it('calls onRowClick when a row is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Table columns={columns} data={data} onRowClick={handleClick} aria-label="People" />);
    const rows = screen.getAllByRole('row');
    // rows[0] is header, rows[1] is first data row
    await user.click(rows[1]);
    expect(handleClick).toHaveBeenCalledWith(data[0]);
  });

  it('applies striped class when striped prop is true', () => {
    const { container } = render(<Table columns={columns} data={data} striped aria-label="People" />);
    expect(container.querySelector('.striped')).toBeInTheDocument();
  });

  it('createColumns helper generates proper column defs', () => {
    const cols = createColumns<Person>([
      { key: 'name', header: 'Full Name', width: 200 },
      { key: 'age', header: 'Years', cell: (row) => `${row.age} years` },
    ]);
    expect(cols).toHaveLength(2);
    expect(cols[0].id).toBe('name');
    expect(cols[0].header).toBe('Full Name');
    expect(cols[0].size).toBe(200);
    expect(cols[1].id).toBe('age');
  });

  it('supports row selection', () => {
    render(
      <Table
        columns={columns}
        data={data}
        selectable
        rowSelection={{ '1': true }}
        getRowId={(row) => row.id}
        aria-label="People"
      />
    );
    const rows = screen.getAllByRole('row');
    // First data row (id='1') should have data-selected
    expect(rows[1]).toHaveAttribute('data-selected');
  });

  it('supports keyboard activation of clickable rows', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Table columns={columns} data={data} onRowClick={handleClick} aria-label="People" />);
    const rows = screen.getAllByRole('row');
    rows[1].focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledWith(data[0]);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Table columns={columns} data={data} caption="People Table" aria-label="People" />
    );
    await expectNoA11yViolations(container);
  });
});
