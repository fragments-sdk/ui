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

  it('forwards html props to item and group labels', async () => {
    const user = userEvent.setup();
    render(
      <Select placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Group id="fruit-group">
            <Select.GroupLabel id="fruit-group-label">Fruits</Select.GroupLabel>
            <Select.Item id="apple-option" value="apple">Apple</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select>
    );

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Apple' })).toHaveAttribute('id', 'apple-option');
    expect(screen.getByText('Fruits')).toHaveAttribute('id', 'fruit-group-label');
    expect(screen.getByText('Fruits').closest('#fruit-group')).toBeInTheDocument();
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

  describe('keyboard & focus', () => {
    it('ArrowDown opens the dropdown from focused trigger', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.tab(); // focus trigger
      await user.keyboard('{ArrowDown}');
      expect(await screen.findByRole('option', { name: 'Apple' })).toBeInTheDocument();
    });

    it('listbox receives focus when dropdown opens', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));
      const listbox = await screen.findByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });

    it('all options are rendered in the listbox', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));
      expect(await screen.findByRole('option', { name: 'Apple' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Cherry' })).toBeInTheDocument();
    });

    it('clicking an option selects it', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSelect({ onValueChange: onChange });

      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByRole('option', { name: 'Banana' }));
      expect(onChange).toHaveBeenCalledWith('banana');
    });

    it('Escape closes the dropdown', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('option', { name: 'Apple' });

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });

    it('trigger is focusable after closing dropdown', async () => {
      const user = userEvent.setup();
      renderSelect();

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await screen.findByRole('option', { name: 'Apple' });

      await user.keyboard('{Escape}');
      // After closing, the trigger should still be accessible
      expect(trigger).toBeInTheDocument();
      expect(trigger).not.toBeDisabled();
    });

    it('disabled option has aria-disabled attribute', async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole('combobox'));
      const cherry = await screen.findByRole('option', { name: 'Cherry' });
      expect(cherry).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('updates trigger label when selected option is removed', async () => {
    const renderDemo = (showApple: boolean) => (
      <Select value="apple" placeholder="Pick one" defaultOpen>
        <Select.Trigger />
        <Select.Content>
          {showApple && <Select.Item value="apple">Apple</Select.Item>}
          <Select.Item value="banana">Banana</Select.Item>
        </Select.Content>
      </Select>
    );

    const { rerender } = render(renderDemo(true));

    await screen.findByRole('option', { name: 'Apple' });
    expect(screen.getByRole('combobox')).toHaveTextContent('Apple');

    rerender(renderDemo(false));

    expect(await screen.findByRole('combobox')).toHaveTextContent('Pick one');
  });
});
