import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Toggle } from './index';

describe('Toggle', () => {
  it('renders a switch role', () => {
    render(<Toggle aria-label="Dark mode" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<Toggle aria-label="Dark mode" />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('renders as checked when checked prop is true', () => {
    render(<Toggle aria-label="Dark mode" checked onChange={() => {}} />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('renders label text', () => {
    render(<Toggle label="Dark mode" />);
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<Toggle label="Notifications" description="Enable push alerts" />);
    expect(screen.getByText('Enable push alerts')).toBeInTheDocument();
  });

  it('disables the switch', () => {
    render(<Toggle aria-label="Dark mode" disabled />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onChange with the new value on click', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Toggle aria-label="Dark mode" onChange={handleChange} />);
    await user.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Toggle aria-label="Accessible toggle" />);
    await expectNoA11yViolations(container);
  });
});
