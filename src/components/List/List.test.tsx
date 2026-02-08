import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { List } from './index';

describe('List', () => {
  it('renders as <ul> by default', () => {
    render(
      <List>
        <List.Item>Item 1</List.Item>
        <List.Item>Item 2</List.Item>
      </List>
    );
    expect(screen.getByRole('list').tagName).toBe('UL');
  });

  it('renders as <ol> when as="ol"', () => {
    render(
      <List as="ol">
        <List.Item>First</List.Item>
      </List>
    );
    expect(screen.getByRole('list').tagName).toBe('OL');
  });

  it('renders list items', () => {
    render(
      <List>
        <List.Item>Alpha</List.Item>
        <List.Item>Beta</List.Item>
        <List.Item>Gamma</List.Item>
      </List>
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Alpha');
  });

  it('renders icon items when variant is "icon"', () => {
    render(
      <List variant="icon">
        <List.Item icon={<span data-testid="star">*</span>}>Starred</List.Item>
      </List>
    );
    expect(screen.getByTestId('star')).toBeInTheDocument();
    expect(screen.getByText('Starred')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <List>
        <List.Item>Item A</List.Item>
        <List.Item>Item B</List.Item>
      </List>
    );
    await expectNoA11yViolations(container);
  });
});
