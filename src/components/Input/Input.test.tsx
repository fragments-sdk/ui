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

  it('forwards the native focus and blur events', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    let focusTarget: EventTarget | null = null;
    let blurTarget: EventTarget | null = null;
    const user = userEvent.setup();
    render(
      <>
        <Input
          label="Name"
          onFocus={(event) => {
            focusTarget = event.target;
            handleFocus(event);
          }}
          onBlur={(event) => {
            blurTarget = event.target;
            handleBlur(event);
          }}
        />
        <button type="button">Next</button>
      </>
    );

    await user.click(screen.getByRole('textbox'));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
    expect(focusTarget).toBeInstanceOf(HTMLInputElement);
    expect(blurTarget).toBeInstanceOf(HTMLInputElement);
  });

  it('focuses the input when shortcut key is pressed', () => {
    render(<Input aria-label="Search" shortcut="⌘K" shortcutBehavior="focus-input" />);
    const input = screen.getByRole('textbox');
    expect(document.activeElement).not.toBe(input);

    // Simulate pressing ⌘K (Meta+K)
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
    );

    expect(document.activeElement).toBe(input);
  });

  it('focuses the input when Ctrl+K is pressed (Windows/Linux)', () => {
    render(<Input aria-label="Search" shortcut="⌘K" shortcutBehavior="focus-input" />);
    const input = screen.getByRole('textbox');

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
    );

    expect(document.activeElement).toBe(input);
  });

  it('does not focus when wrong key is pressed', () => {
    render(<Input aria-label="Search" shortcut="⌘K" shortcutBehavior="focus-input" />);
    const input = screen.getByRole('textbox');

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'j', metaKey: true, bubbles: true })
    );

    expect(document.activeElement).not.toBe(input);
  });

  it('applies success class when success is true', () => {
    render(<Input label="Email" success />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('success');
  });

  it('renders startAdornment before the input', () => {
    render(<Input label="Price" startAdornment={<span data-testid="prefix">$</span>} />);
    expect(screen.getByTestId('prefix')).toBeInTheDocument();
  });

  it('renders endAdornment after the input', () => {
    render(<Input label="Weight" endAdornment={<span data-testid="suffix">kg</span>} />);
    expect(screen.getByTestId('suffix')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Input label="Accessible input" />);
    await expectNoA11yViolations(container);
  });
});
