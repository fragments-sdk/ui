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

  it('renders helperText (preferred API)', () => {
    render(<Switch label="Notifications" helperText="Enable push alerts" />);
    expect(screen.getByText('Enable push alerts')).toBeInTheDocument();
  });

  it('associates helper text via aria-describedby', () => {
    render(<Switch label="Notifications" helperText="Enable push alerts" />);
    expect(screen.getByRole('switch')).toHaveAccessibleDescription('Enable push alerts');
  });

  it('prefers helperText over description when both are provided', () => {
    render(
      <Switch
        label="Notifications"
        helperText="Preferred helper text"
        description="Legacy description text"
      />
    );
    expect(screen.getByText('Preferred helper text')).toBeInTheDocument();
    expect(screen.queryByText('Legacy description text')).not.toBeInTheDocument();
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

  it('calls onCheckedChange alias when toggled', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch aria-label="Dark mode" onCheckedChange={handleChange} />);
    await user.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe(true);
  });

  it('prefers onCheckedChange over onChange when both provided', async () => {
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch aria-label="Test" onChange={onChange} onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Switch aria-label="Accessible switch" />);
    await expectNoA11yViolations(container);
  });
});
