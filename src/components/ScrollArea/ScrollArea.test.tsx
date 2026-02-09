import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollArea } from '.';

describe('ScrollArea', () => {
  it('renders children', () => {
    render(<ScrollArea>Test content</ScrollArea>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('sets data-orientation attribute', () => {
    const { container } = render(
      <ScrollArea orientation="horizontal">Content</ScrollArea>
    );
    expect(container.firstChild).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('defaults to vertical orientation', () => {
    const { container } = render(<ScrollArea>Content</ScrollArea>);
    expect(container.firstChild).toHaveAttribute('data-orientation', 'vertical');
  });

  it('passes through HTML attributes', () => {
    render(
      <ScrollArea data-testid="scroll-area" style={{ height: '200px' }}>
        Content
      </ScrollArea>
    );
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ScrollArea className="custom-class">Content</ScrollArea>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
