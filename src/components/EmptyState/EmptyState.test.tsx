import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { EmptyState } from './index';

describe('EmptyState', () => {
  it('renders children', () => {
    render(
      <EmptyState>
        <EmptyState.Title>No results</EmptyState.Title>
      </EmptyState>
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders all compound sub-components', () => {
    render(
      <EmptyState>
        <EmptyState.Icon>ICON</EmptyState.Icon>
        <EmptyState.Title>Empty</EmptyState.Title>
        <EmptyState.Description>Nothing to show</EmptyState.Description>
        <EmptyState.Actions><button>Add item</button></EmptyState.Actions>
      </EmptyState>
    );
    expect(screen.getByText('ICON')).toHaveClass('icon');
    expect(screen.getByText('Empty').tagName).toBe('H3');
    expect(screen.getByText('Nothing to show').tagName).toBe('P');
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(
      <EmptyState size="lg">
        <EmptyState.Title>Large</EmptyState.Title>
      </EmptyState>
    );
    expect(container.firstElementChild).toHaveClass('lg');
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState className="custom">
        <EmptyState.Title>Custom</EmptyState.Title>
      </EmptyState>
    );
    expect(container.firstElementChild).toHaveClass('custom');
  });

  it('defaults to md size', () => {
    const { container } = render(
      <EmptyState>
        <EmptyState.Title>Default</EmptyState.Title>
      </EmptyState>
    );
    expect(container.firstElementChild).toHaveClass('md');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <EmptyState>
        <EmptyState.Icon>ICON</EmptyState.Icon>
        <EmptyState.Title>No items found</EmptyState.Title>
        <EmptyState.Description>Try adjusting your search</EmptyState.Description>
      </EmptyState>
    );
    await expectNoA11yViolations(container);
  });
});
