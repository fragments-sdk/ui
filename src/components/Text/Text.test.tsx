import { describe, it, expect, vi } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Text } from './index';

describe('Text', () => {
  it('renders a span by default', () => {
    render(<Text>Hello</Text>);
    const el = screen.getByText('Hello');
    expect(el.tagName).toBe('SPAN');
  });

  it('renders as a different element via "as" prop', () => {
    render(<Text as="h1">Heading</Text>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading');
  });

  it('applies size, weight, and color classes', () => {
    render(<Text size="lg" weight="semibold" color="secondary">Styled</Text>);
    const el = screen.getByText('Styled');
    expect(el).toHaveClass('size-lg');
    expect(el).toHaveClass('weight-semibold');
    expect(el).toHaveClass('color-secondary');
  });

  it('applies bold weight class', () => {
    render(<Text weight="bold">Bold text</Text>);
    expect(screen.getByText('Bold text')).toHaveClass('weight-bold');
  });

  it('applies muted color class (alias for tertiary)', () => {
    render(<Text color="muted">Muted text</Text>);
    expect(screen.getByText('Muted text')).toHaveClass('color-muted');
  });

  it('applies md size class (alias for base)', () => {
    render(<Text size="md">Medium text</Text>);
    expect(screen.getByText('Medium text')).toHaveClass('size-md');
  });

  it('applies section-label variant class', () => {
    render(<Text variant="section-label">Label</Text>);
    expect(screen.getByText('Label')).toHaveClass('variant-section-label');
  });

  it('applies truncate class', () => {
    render(<Text truncate>Long text that should truncate</Text>);
    expect(screen.getByText('Long text that should truncate')).toHaveClass('truncate');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Text ref={ref}>Ref</Text>);
    expect(ref).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Text>Accessible text</Text>);
    await expectNoA11yViolations(container);
  });
});
