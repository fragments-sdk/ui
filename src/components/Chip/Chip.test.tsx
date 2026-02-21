import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Chip } from './index';

describe('Chip', () => {
  it('renders with correct text', () => {
    render(<Chip>Tag</Chip>);
    expect(screen.getByRole('button', { name: 'Tag' })).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Chip variant="outlined">Outlined</Chip>);
    expect(screen.getByRole('button', { name: 'Outlined' })).toHaveClass('outlined');
  });

  it('sets aria-pressed for selected state', () => {
    const { rerender } = render(<Chip selected>Active</Chip>);
    expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true');

    rerender(<Chip selected={false}>Active</Chip>);
    expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders remove button with aria-label when onRemove is provided', () => {
    const handleRemove = vi.fn();
    render(<Chip onRemove={handleRemove}>Removable</Chip>);
    expect(screen.getByRole('button', { name: /remove removable/i })).toBeInTheDocument();
  });

  it('fires onRemove when remove button is clicked', async () => {
    const handleRemove = vi.fn();
    const user = userEvent.setup();
    render(<Chip onRemove={handleRemove}>Delete me</Chip>);
    await user.click(screen.getByRole('button', { name: /remove delete me/i }));
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('fires onClick callback', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Chip onClick={handleClick}>Clickable</Chip>);
    await user.click(screen.getByRole('button', { name: 'Clickable' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('resolves variant="outline" to "outlined"', () => {
    render(<Chip variant="outline">Outline</Chip>);
    expect(screen.getByRole('button', { name: 'Outline' })).toHaveClass('outlined');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Chip>Accessible chip</Chip>);
    await expectNoA11yViolations(container);
  });
});
