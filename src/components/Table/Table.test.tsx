import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Table } from './index';

describe('Table', () => {
  it('renders a table with semantic structure', () => {
    render(
      <Table aria-label="People">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Age</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Alice</Table.Cell>
            <Table.Cell>30</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('adds scope="col" to header cells by default', () => {
    render(
      <Table aria-label="Test">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Col 1</Table.HeaderCell>
            <Table.HeaderCell>Col 2</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>A</Table.Cell>
            <Table.Cell>B</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveAttribute('scope', 'col');
    expect(headers[1]).toHaveAttribute('scope', 'col');
  });

  it('renders visible caption', () => {
    render(
      <Table aria-label="Test">
        <Table.Caption>My Table</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>A</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>1</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(screen.getByText('My Table')).toBeInTheDocument();
  });

  it('renders visually hidden caption', () => {
    render(
      <Table aria-label="Test">
        <Table.Caption hidden>Hidden Caption</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>A</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>1</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    const caption = screen.getByText('Hidden Caption');
    expect(caption).toBeInTheDocument();
    expect(caption.className).toContain('captionHidden');
  });

  it('applies striped class', () => {
    const { container } = render(
      <Table striped aria-label="Test">
        <Table.Body>
          <Table.Row><Table.Cell>A</Table.Cell></Table.Row>
          <Table.Row><Table.Cell>B</Table.Cell></Table.Row>
        </Table.Body>
      </Table>
    );

    expect(container.querySelector('.striped')).toBeInTheDocument();
  });

  it('applies bordered class', () => {
    const { container } = render(
      <Table bordered aria-label="Test">
        <Table.Body>
          <Table.Row><Table.Cell>A</Table.Cell></Table.Row>
        </Table.Body>
      </Table>
    );

    expect(container.querySelector('.bordered')).toBeInTheDocument();
  });

  it('applies sm size class', () => {
    const { container } = render(
      <Table size="sm" aria-label="Test">
        <Table.Body>
          <Table.Row><Table.Cell>A</Table.Cell></Table.Row>
        </Table.Body>
      </Table>
    );

    expect(container.querySelector('.sm')).toBeInTheDocument();
  });

  it('applies selected state on Row', () => {
    render(
      <Table aria-label="Test">
        <Table.Body>
          <Table.Row selected><Table.Cell>Selected row</Table.Cell></Table.Row>
        </Table.Body>
      </Table>
    );

    const row = screen.getByRole('row');
    expect(row).toHaveAttribute('data-selected');
    expect(row.className).toContain('selected');
  });

  it('forwards HTML attributes to sub-components', () => {
    render(
      <Table aria-label="Test" data-testid="root">
        <Table.Head data-testid="head">
          <Table.Row data-testid="header-row">
            <Table.HeaderCell data-testid="header-cell">H</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body data-testid="body">
          <Table.Row data-testid="body-row">
            <Table.Cell data-testid="cell">C</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer data-testid="footer">
          <Table.Row data-testid="footer-row">
            <Table.Cell data-testid="footer-cell">F</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );

    expect(screen.getByTestId('root')).toBeInTheDocument();
    expect(screen.getByTestId('head')).toBeInTheDocument();
    expect(screen.getByTestId('body')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('header-row')).toBeInTheDocument();
    expect(screen.getByTestId('body-row')).toBeInTheDocument();
    expect(screen.getByTestId('footer-row')).toBeInTheDocument();
    expect(screen.getByTestId('header-cell')).toBeInTheDocument();
    expect(screen.getByTestId('cell')).toBeInTheDocument();
    expect(screen.getByTestId('footer-cell')).toBeInTheDocument();
  });

  it('renders tfoot element', () => {
    const { container } = render(
      <Table aria-label="Test">
        <Table.Body>
          <Table.Row><Table.Cell>A</Table.Cell></Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row><Table.Cell>Total</Table.Cell></Table.Row>
        </Table.Footer>
      </Table>
    );

    expect(container.querySelector('tfoot')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Table aria-label="People">
        <Table.Caption>Team Members</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Role</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Alice</Table.Cell>
            <Table.Cell>Engineer</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Bob</Table.Cell>
            <Table.Cell>Designer</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    await expectNoA11yViolations(container);
  });
});
