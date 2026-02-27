import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { ColorPicker } from './index';

// Mock react-colorful to avoid canvas rendering issues in jsdom
vi.mock('react-colorful', () => ({
  HexColorPicker: ({ color, onChange }: { color: string; onChange: (c: string) => void }) => (
    <div data-testid="hex-picker" data-color={color} onClick={() => onChange('#ff0000')}>
      Mock Picker
    </div>
  ),
}));

describe('ColorPicker', () => {
  it('renders with a label', () => {
    render(<ColorPicker label="Brand Color" />);
    expect(screen.getByText('Brand Color')).toBeInTheDocument();
  });

  it('renders the color swatch trigger', () => {
    render(<ColorPicker label="Color" />);
    expect(screen.getByRole('button', { name: /edit color color/i })).toBeInTheDocument();
  });

  it('renders the hex input field when showInput is true', () => {
    render(<ColorPicker label="Color" showInput />);
    expect(screen.getByRole('textbox', { name: /hex value/i })).toBeInTheDocument();
  });

  it('hides the hex input when showInput is false', () => {
    render(<ColorPicker label="Color" showInput={false} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('calls onChange when color changes via hex input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ColorPicker label="Color" onChange={handleChange} defaultValue="#000000" />);

    const input = screen.getByRole('textbox', { name: /hex value/i });
    await user.clear(input);
    await user.type(input, '#ff5500');
    expect(handleChange).toHaveBeenCalledWith('#ff5500');
  });

  it('renders description text', () => {
    render(<ColorPicker label="Color" description="Choose a brand color" />);
    expect(screen.getByText('Choose a brand color')).toBeInTheDocument();
  });

  it('renders helperText (preferred API)', () => {
    render(<ColorPicker label="Color" helperText="Choose a brand color" />);
    expect(screen.getByText('Choose a brand color')).toBeInTheDocument();
  });

  it('prefers helperText over description when both are provided', () => {
    render(
      <ColorPicker
        label="Color"
        helperText="Preferred helper text"
        description="Legacy description text"
      />
    );
    expect(screen.getByText('Preferred helper text')).toBeInTheDocument();
    expect(screen.queryByText('Legacy description text')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ColorPicker label="Brand Color" />);
    await expectNoA11yViolations(container);
  });
});
