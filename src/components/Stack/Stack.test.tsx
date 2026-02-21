import { describe, it, expect, vi } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Stack } from './index';

describe('Stack', () => {
  it('renders children in a div by default', () => {
    render(<Stack><span>A</span><span>B</span></Stack>);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('applies direction class', () => {
    const { container } = render(<Stack direction="row"><span>A</span></Stack>);
    expect(container.firstChild).toHaveClass('row');
  });

  it('applies gap class', () => {
    const { container } = render(<Stack gap="lg"><span>A</span></Stack>);
    expect(container.firstChild).toHaveClass('gap-lg');
  });

  it('applies alignment and justify classes', () => {
    const { container } = render(
      <Stack align="center" justify="between"><span>A</span></Stack>
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('align-center');
    expect(el).toHaveClass('justify-between');
  });

  it('renders as a different element via "as" prop', () => {
    render(<Stack as="nav"><span>Item</span></Stack>);
    const nav = screen.getByText('Item').parentElement!;
    expect(nav.tagName).toBe('NAV');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Stack ref={ref}><span>A</span></Stack>);
    expect(ref).toHaveBeenCalled();
  });

  it('applies inline style for numeric gap values', () => {
    const { container } = render(<Stack gap={4}><span>A</span></Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gap).toBe('var(--fui-space-4)');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Stack><span>A</span><span>B</span></Stack>);
    await expectNoA11yViolations(container);
  });
});
