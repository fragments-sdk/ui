import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Card } from './index';

describe('Card', () => {
  it('renders as <article> by default', () => {
    render(<Card>Content</Card>);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renders as <button> when onClick is provided', () => {
    render(<Card onClick={() => {}}>Click me</Card>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Card variant="outlined">Content</Card>);
    expect(screen.getByRole('article')).toHaveClass('outlined');

    rerender(<Card variant="elevated">Content</Card>);
    expect(screen.getByRole('article')).toHaveClass('elevated');
  });

  it('applies padding classes', () => {
    render(<Card padding="lg">Content</Card>);
    expect(screen.getByRole('article')).toHaveClass('paddingLg');
  });

  it('fires onClick callback', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Card onClick={handleClick}>Click me</Card>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders compound sub-components', () => {
    render(
      <Card>
        <Card.Header>Header</Card.Header>
        <Card.Title>Title</Card.Title>
        <Card.Description>Description</Card.Description>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>
    );
    expect(screen.getByText('Header')).toHaveClass('header');
    expect(screen.getByText('Title').tagName).toBe('H3');
    expect(screen.getByText('Description').tagName).toBe('P');
    expect(screen.getByText('Body')).toHaveClass('body');
    expect(screen.getByText('Footer')).toHaveClass('footer');
  });

  it('adds interactive class when onClick is provided', () => {
    render(<Card onClick={() => {}}>Content</Card>);
    expect(screen.getByRole('button')).toHaveClass('interactive');
  });

  it('resolves variant="outline" to "outlined"', () => {
    render(<Card variant="outline">Content</Card>);
    expect(screen.getByRole('article')).toHaveClass('outlined');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <Card.Header>
          <Card.Title>Card Title</Card.Title>
        </Card.Header>
        <Card.Body>Card body content</Card.Body>
      </Card>
    );
    await expectNoA11yViolations(container);
  });
});
