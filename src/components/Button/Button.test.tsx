import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Button } from './index';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="primary">Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('primary');

    rerender(<Button variant="danger">Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('danger');
  });

  it('applies size classes', () => {
    render(<Button size="lg">Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('lg');
  });

  it('renders as an anchor when as="a"', () => {
    render(<Button as="a" href="/test">Link</Button>);
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toHaveAttribute('href', '/test');
  });

  it('supports disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it('resolves variant="outline" to "outlined"', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('outlined');
  });

  it('renders as child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('button');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Accessible</Button>);
    await expectNoA11yViolations(container);
  });
});
