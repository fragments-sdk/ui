import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Textarea } from './index';

describe('Textarea', () => {
  it('renders a textbox', () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a label associated with the textarea', () => {
    render(<Textarea label="Description" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAccessibleName('Description');
  });

  it('applies resize style class', () => {
    render(<Textarea aria-label="Notes" resize="none" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.className).toContain('resize-none');
  });

  it('sets min and max height styles from minRows and maxRows', () => {
    render(<Textarea aria-label="Notes" minRows={2} maxRows={5} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.style.minHeight).toBeTruthy();
    expect(textarea.style.maxHeight).toBeTruthy();
  });

  it('sets aria-invalid when error is true', () => {
    render(<Textarea label="Notes" error />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables the textarea when disabled prop is true', () => {
    render(<Textarea label="Notes" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('associates helperText via aria-describedby', () => {
    render(<Textarea label="Notes" helperText="Optional field" />);
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Optional field');
  });

  it('calls onChange with the string value', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Textarea label="Notes" onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'x');
    expect(handleChange).toHaveBeenCalledWith('x');
  });

  it('forwards the native focus and blur events', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    let focusTarget: EventTarget | null = null;
    let blurTarget: EventTarget | null = null;
    const user = userEvent.setup();
    render(
      <>
        <Textarea
          label="Notes"
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
    expect(focusTarget).toBeInstanceOf(HTMLTextAreaElement);
    expect(blurTarget).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('applies success class when success is true', () => {
    render(<Textarea label="Bio" success />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.className).toContain('success');
  });

  it('renders character counter when showCharCount and maxLength are set', () => {
    render(<Textarea label="Bio" maxLength={100} showCharCount />);
    expect(screen.getByText('0/100')).toBeInTheDocument();
  });

  it('updates character counter on input', async () => {
    const user = userEvent.setup();
    render(<Textarea label="Bio" maxLength={100} showCharCount />);
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(screen.getByText('5/100')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Textarea label="Accessible textarea" />);
    await expectNoA11yViolations(container);
  });
});
