import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { RadioGroup } from './index';

describe('RadioGroup', () => {
  it('renders a radiogroup role', () => {
    render(
      <RadioGroup label="Color">
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders radio items', () => {
    render(
      <RadioGroup label="Color">
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('renders helperText on radio items (preferred API)', () => {
    render(
      <RadioGroup label="Shipping">
        <RadioGroup.Item value="standard" label="Standard" helperText="5-7 business days" />
      </RadioGroup>
    );
    expect(screen.getByText('5-7 business days')).toBeInTheDocument();
  });

  it('selects a radio on click', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup label="Color">
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    const radios = screen.getAllByRole('radio');
    await user.click(radios[1]);
    expect(radios[1]).toBeChecked();
  });

  it('renders the group label', () => {
    render(
      <RadioGroup label="Choose a color">
        <RadioGroup.Item value="red" label="Red" />
      </RadioGroup>
    );
    expect(screen.getByText('Choose a color')).toBeInTheDocument();
  });

  it('sets defaultValue as the initially selected radio', () => {
    render(
      <RadioGroup label="Color" defaultValue="blue">
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[1]).toBeChecked();
  });

  it('disables all items when disabled prop is set', () => {
    render(
      <RadioGroup label="Color" disabled>
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => expect(radio).toHaveAttribute('aria-disabled', 'true'));
  });

  it('disables individual items', () => {
    render(
      <RadioGroup label="Color">
        <RadioGroup.Item value="red" label="Red" disabled />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-disabled', 'true');
    expect(radios[1]).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onValueChange with the selected value', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RadioGroup label="Color" onValueChange={handleChange}>
        <RadioGroup.Item value="red" label="Red" />
        <RadioGroup.Item value="blue" label="Blue" />
      </RadioGroup>
    );
    await user.click(screen.getAllByRole('radio')[0]);
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe('red');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RadioGroup label="Accessible group">
        <RadioGroup.Item value="a" label="Option A" />
        <RadioGroup.Item value="b" label="Option B" />
      </RadioGroup>
    );
    await expectNoA11yViolations(container);
  });
});
