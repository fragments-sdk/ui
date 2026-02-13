import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Switch } from './index';

describe('Switch', () => {
  it('renders a switch role', () => {
    render(<Switch aria-label="Dark mode" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<Switch aria-label="Dark mode" />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('renders as checked when checked prop is true', () => {
    render(<Switch aria-label="Dark mode" checked onChange={() => {}} />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('renders label text', () => {
    render(<Switch label="Dark mode" />);
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<Switch label="Notifications" description="Enable push alerts" />);
    expect(screen.getByText('Enable push alerts')).toBeInTheDocument();
  });

  it('disables the switch', () => {
    render(<Switch aria-label="Dark mode" disabled />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onChange with the new value on click', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch aria-label="Dark mode" onChange={handleChange} />);
    await user.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Switch aria-label="Accessible switch" />);
    await expectNoA11yViolations(container);
  });
});
