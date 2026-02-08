import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Select } from './index';

function renderSelect(props: { onValueChange?: (v: string | null) => void; disabled?: boolean; value?: string; placeholder?: string } = {}) {
  return render(
    <Select
      placeholder={props.placeholder ?? 'Pick one'}
      onValueChange={props.onValueChange}
      disabled={props.disabled}
      value={props.value}
    >
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Item value="banana">Banana</Select.Item>
        <Select.Item value="cherry" disabled>Cherry</Select.Item>
      </Select.Content>
    </Select>
  );
}

describe('Select', () => {
  it('renders a trigger button', () => {
    renderSelect();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows placeholder text when no value selected', () => {
    renderSelect({ placeholder: 'Choose fruit' });
    expect(screen.getByText('Choose fruit')).toBeInTheDocument();
  });

  it('opens dropdown and selects an option on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderSelect({ onValueChange: onChange });

    await user.click(screen.getByRole('combobox'));
    const option = await screen.findByRole('option', { name: 'Apple' });
    await user.click(option);
    expect(onChange).toHaveBeenCalledWith('apple');
  });

  it('renders with a controlled value', async () => {
    const user = userEvent.setup();
    renderSelect({ value: 'banana' });
    // The trigger should display the selected item label
    await user.click(screen.getByRole('combobox'));
    const bananaOption = await screen.findByRole('option', { name: 'Banana' });
    expect(bananaOption).toHaveAttribute('aria-selected', 'true');
  });

  it('disables the trigger when disabled prop is true', () => {
    renderSelect({ disabled: true });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders groups and group labels', async () => {
    const user = userEvent.setup();
    render(
      <Select placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Group>
            <Select.GroupLabel>Fruits</Select.GroupLabel>
            <Select.Item value="apple">Apple</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select>
    );
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Fruits')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Select placeholder="Pick one">
        <Select.Trigger aria-label="Select a fruit" />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
        </Select.Content>
      </Select>
    );
    await expectNoA11yViolations(container);
  });
});
