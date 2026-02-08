import { describe, it, expect, vi } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
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

  it('has no accessibility violations', async () => {
    const { container } = render(<Link href="/page">Accessible link</Link>);
    await expectNoA11yViolations(container);
  });
});
