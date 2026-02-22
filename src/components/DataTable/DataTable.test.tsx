import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { DataTable, createColumns } from './index';

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

describe('DataTable', () => {
  it('renders a table element with column headers', () => {
    render(<DataTable columns={columns} data={data} aria-label="People" />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveAttribute('scope', 'col');
    expect(headers[0]).toHaveTextContent('Name');
    expect(headers[1]).toHaveTextContent('Age');
  });

  it('renders data rows', () => {
    render(<DataTable columns={columns} data={data} aria-label="People" />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 3 data rows
    expect(rows).toHaveLength(4);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders caption when provided', () => {
    render(<DataTable columns={columns} data={data} caption="People Table" aria-label="People" />);
    expect(screen.getByText('People Table')).toBeInTheDocument();
  });

  it('shows empty state message when data is empty', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="Nothing here"
        caption="People Table"
        aria-label="People"
      />
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /people/i })).toBeInTheDocument();
    expect(screen.getByText('People Table')).toBeInTheDocument();
  });

  it('defaults to "No data available" empty message', () => {
    render(<DataTable columns={columns} data={[]} aria-label="People" />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('supports sortable columns with aria-sort', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={data} sortable aria-label="People" />);
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
    render(<DataTable columns={columns} data={data} onRowClick={handleClick} aria-label="People" />);
    const rows = screen.getAllByRole('row');
    // rows[0] is header, rows[1] is first data row
    await user.click(rows[1]);
    expect(handleClick).toHaveBeenCalledWith(data[0]);
  });

  it('applies striped class when striped prop is true', () => {
    const { container } = render(<DataTable columns={columns} data={data} striped aria-label="People" />);
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
      <DataTable
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
    render(<DataTable columns={columns} data={data} onRowClick={handleClick} aria-label="People" />);
    const rows = screen.getAllByRole('row');
    rows[1].focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledWith(data[0]);
  });

  it('renders checkbox column when showCheckbox and selectable', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        showCheckbox
        getRowId={(row) => row.id}
        aria-label="People"
      />
    );
    // 2 data columns + 1 checkbox column = 3 headers
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);

    // "Select all" checkbox in header
    const selectAll = screen.getByRole('checkbox', { name: 'Select all rows' });
    expect(selectAll).toBeInTheDocument();

    // Individual row checkboxes
    const rowCheckboxes = screen.getAllByRole('checkbox', { name: /Select row/ });
    expect(rowCheckboxes).toHaveLength(3);

    // Click a row checkbox toggles selection
    await user.click(rowCheckboxes[0]);
    expect(rowCheckboxes[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('does not render checkbox column when only showCheckbox without selectable', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        showCheckbox
        aria-label="People"
      />
    );
    // Should only have the 2 data columns
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.queryByLabelText('Select all rows')).not.toBeInTheDocument();
  });

  it('renders expandable sub-rows with expand/collapse buttons', async () => {
    type Node = { id: string; name: string; children?: Node[] };
    const treeData: Node[] = [
      {
        id: '1', name: 'Parent',
        children: [
          { id: '1.1', name: 'Child A' },
          { id: '1.2', name: 'Child B' },
        ],
      },
      { id: '2', name: 'Standalone' },
    ];
    const treeCols = createColumns<Node>([
      { key: 'name', header: 'Name' },
    ]);

    const user = userEvent.setup();
    render(
      <DataTable
        columns={treeCols}
        data={treeData}
        getSubRows={(row) => row.children}
        getRowId={(row) => row.id}
        aria-label="Tree"
      />
    );

    // Initially only top-level rows visible (1 header + 2 data)
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Standalone')).toBeInTheDocument();

    // Expand button present for parent row
    const expandBtn = screen.getByLabelText('Expand row');
    expect(expandBtn).toHaveAttribute('aria-expanded', 'false');

    // Click expand to show children
    await user.click(expandBtn);
    expect(screen.getAllByRole('row')).toHaveLength(5); // 1 header + 2 top + 2 children
    expect(screen.getByText('Child A')).toBeInTheDocument();
    expect(screen.getByText('Child B')).toBeInTheDocument();

    // Button now shows "Collapse row"
    const collapseBtn = screen.getByLabelText('Collapse row');
    expect(collapseBtn).toHaveAttribute('aria-expanded', 'true');

    // Child rows have data-depth attribute
    const childRows = screen.getAllByRole('row').filter(r => r.getAttribute('data-depth'));
    expect(childRows).toHaveLength(2);
    expect(childRows[0]).toHaveAttribute('data-depth', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DataTable columns={columns} data={data} caption="People Table" aria-label="People" />
    );
    await expectNoA11yViolations(container);
  });
});
