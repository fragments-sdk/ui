import * as React from 'react';
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

  it('applies semantic color classes', () => {
    const { rerender } = render(<Text color="warning">Over budget</Text>);
    expect(screen.getByText('Over budget')).toHaveClass('color-warning');

    rerender(<Text color="danger">Expired</Text>);
    expect(screen.getByText('Expired')).toHaveClass('color-danger');

    rerender(<Text color="success">Passing</Text>);
    expect(screen.getByText('Passing')).toHaveClass('color-success');
  });

  it('applies md size class (alias for base)', () => {
    render(<Text size="md">Medium text</Text>);
    expect(screen.getByText('Medium text')).toHaveClass('size-md');
  });

  it('applies section-label variant class', () => {
    render(<Text variant="section-label">Label</Text>);
    expect(screen.getByText('Label')).toHaveClass('variant-section-label');
  });

  it.each([
    'caption',
    'ui-compact',
    'ui-standard',
    'body-compact',
    'body-relaxed',
    'title-sm',
    'title-md',
    'title-lg',
    'code',
  ] as const)('applies the semantic %s role deterministically', (role) => {
    render(<Text role={role}>{role}</Text>);
    expect(screen.getByText(role)).toHaveClass(`role-${role}`);
  });

  it('warns and ignores legacy type selectors when an untyped spread supplies a role', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const UnsafeText = Text as React.ComponentType<Record<string, unknown>>;

    render(<UnsafeText role="body-relaxed" size="lg">Semantic copy</UnsafeText>);

    expect(screen.getByText('Semantic copy')).toHaveClass('role-body-relaxed');
    expect(screen.getByText('Semantic copy')).not.toHaveClass('size-lg');
    expect(warning).toHaveBeenCalledOnce();
    warning.mockRestore();
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
