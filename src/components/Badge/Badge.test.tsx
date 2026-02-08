import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Badge } from './index';

describe('Badge', () => {
  it('renders with children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('success');
  });

  it('applies size classes', () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('sm');
  });

  it('renders dot with aria-hidden', () => {
    const { container } = render(<Badge dot>Status</Badge>);
    const dot = container.querySelector('.dot');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders icon with aria-hidden', () => {
    const { container } = render(<Badge icon={<svg data-testid="icon" />}>Info</Badge>);
    const iconWrapper = container.querySelector('.icon');
    expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders remove button with aria-label', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Badge onRemove={onRemove}>Tag</Badge>);
    const removeBtn = screen.getByRole('button', { name: 'Remove Tag' });
    expect(removeBtn).toBeInTheDocument();
    await user.click(removeBtn);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('sets role="status" and aria-label for status variants', () => {
    const { container } = render(<Badge variant="error">Failed</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveAttribute('role', 'status');
    expect(badge).toHaveAttribute('aria-label', 'error: Failed');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Badge>Accessible</Badge>);
    await expectNoA11yViolations(container);
  });
});
