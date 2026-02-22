import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Link } from './index';

describe('Link', () => {
  it('renders an anchor element', () => {
    render(<Link href="/page">Go</Link>);
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/page');
  });

  it('applies variant and underline classes', () => {
    render(<Link href="#" variant="subtle" underline="always">Styled</Link>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('subtle');
    expect(link).toHaveClass('underline-always');
  });

  it('adds external link attributes', () => {
    render(<Link href="https://example.com" external>External</Link>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Link ref={ref} href="#">Ref</Link>);
    expect(ref).toHaveBeenCalled();
  });

  it('renders as child element when asChild is true', () => {
    render(
      <Link asChild variant="subtle">
        <button type="button">Click me</button>
      </Link>
    );
    const btn = screen.getByRole('button', { name: 'Click me' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveClass('link');
    expect(btn).toHaveClass('subtle');
  });

  it('merges classNames when asChild is true', () => {
    render(
      <Link asChild variant="default">
        <a href="/test" className="custom-class">Test</a>
      </Link>
    );
    const link = screen.getByRole('link', { name: 'Test' });
    expect(link).toHaveClass('link');
    expect(link).toHaveClass('custom-class');
  });

  it('composes child and Link event handlers when asChild is true', async () => {
    const user = userEvent.setup();
    const childClick = vi.fn();
    const parentClick = vi.fn();

    render(
      <Link asChild onClick={parentClick}>
        <button type="button" onClick={childClick}>Composed</button>
      </Link>
    );

    await user.click(screen.getByRole('button', { name: 'Composed' }));
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(parentClick).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Link href="/page">Accessible link</Link>);
    await expectNoA11yViolations(container);
  });
});
