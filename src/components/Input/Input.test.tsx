import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Input } from './index';

describe('Input', () => {
  it('renders a textbox', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label via Field.Label when label prop is provided', () => {
    render(<Input label="Email" />);
    const input = screen.getByRole('textbox');
    expect(screen.getByText('Email')).toBeInTheDocument();
    // Field.Label associates via htmlFor — input should be labelled
    expect(input).toHaveAccessibleName('Email');
  });

  it('associates helperText via aria-describedby', () => {
    render(<Input label="Password" helperText="Must be 8+ characters" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleDescription('Must be 8+ characters');
  });

  it('sets aria-invalid when error is true', () => {
    render(<Input label="Email" error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables the input when disabled prop is true', () => {
    render(<Input label="Name" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders a controlled value', () => {
    render(<Input label="Name" value="hello" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  it('renders shortcut as a kbd element', () => {
    const { container } = render(<Input aria-label="Search" shortcut="⌘K" />);
    const kbd = container.querySelector('kbd');
    expect(kbd).toBeInTheDocument();
    expect(kbd).toHaveTextContent('⌘K');
  });

  it('applies size class', () => {
    render(<Input aria-label="Name" size="sm" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('sm');
  });

  it('forwards ref to the input element', () => {
    const ref = vi.fn<(el: HTMLInputElement | null) => void>();
    render(<Input aria-label="Name" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('calls onChange with the string value', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input label="Name" onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(handleChange).toHaveBeenCalledWith('a');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Input label="Accessible input" />);
    await expectNoA11yViolations(container);
  });
});
