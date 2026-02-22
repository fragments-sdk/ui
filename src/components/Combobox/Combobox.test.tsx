import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Combobox } from './index';

function renderCombobox(props: { onValueChange?: (v: string | string[] | null) => void; multiple?: boolean; placeholder?: string } = {}) {
  return render(
    <Combobox
      placeholder={props.placeholder ?? 'Search...'}
      onValueChange={props.onValueChange}
      multiple={props.multiple}
    >
      <Combobox.Input />
      <Combobox.Content>
        <Combobox.Item value="react">React</Combobox.Item>
        <Combobox.Item value="vue">Vue</Combobox.Item>
        <Combobox.Item value="angular">Angular</Combobox.Item>
        <Combobox.Empty>No results found</Combobox.Empty>
      </Combobox.Content>
    </Combobox>
  );
}

describe('Combobox', () => {
  it('renders an input and a trigger button', () => {
    renderCombobox();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows placeholder text', () => {
    renderCombobox({ placeholder: 'Type to search' });
    expect(screen.getByPlaceholderText('Type to search')).toBeInTheDocument();
  });

  it('opens dropdown and shows options when trigger is clicked', async () => {
    const user = userEvent.setup();
    renderCombobox();
    // Click the combobox input to open
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'React' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Vue' })).toBeInTheDocument();
  });

  it('selects an option on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCombobox({ onValueChange: onChange });

    await user.click(screen.getByRole('combobox'));
    const option = await screen.findByRole('option', { name: 'React' });
    await user.click(option);
    expect(onChange).toHaveBeenCalledWith('react');
  });

  it('filters options based on input text', async () => {
    const user = userEvent.setup();
    renderCombobox();

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'rea');
    // React should be visible, Vue/Angular may be filtered out
    expect(await screen.findByRole('option', { name: 'React' })).toBeInTheDocument();
  });

  it('renders groups and group labels', async () => {
    const user = userEvent.setup();
    render(
      <Combobox placeholder="Search">
        <Combobox.Input />
        <Combobox.Content>
          <Combobox.Group>
            <Combobox.GroupLabel>Frameworks</Combobox.GroupLabel>
            <Combobox.Item value="react">React</Combobox.Item>
          </Combobox.Group>
        </Combobox.Content>
      </Combobox>
    );
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Frameworks')).toBeInTheDocument();
  });

  it('forwards html props to item and labels', async () => {
    const user = userEvent.setup();
    render(
      <Combobox placeholder="Search">
        <Combobox.Input />
        <Combobox.Content>
          <Combobox.Group id="framework-group">
            <Combobox.GroupLabel id="framework-group-label">Frameworks</Combobox.GroupLabel>
            <Combobox.Item id="react-option" value="react">React</Combobox.Item>
          </Combobox.Group>
        </Combobox.Content>
      </Combobox>
    );

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'React' })).toHaveAttribute('id', 'react-option');
    expect(screen.getByText('Frameworks')).toHaveAttribute('id', 'framework-group-label');
    expect(screen.getByText('Frameworks').closest('#framework-group')).toBeInTheDocument();
  });

  it('supports multiple selection mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCombobox({ multiple: true, onValueChange: onChange });

    await user.click(screen.getByRole('combobox'));
    const option = await screen.findByRole('option', { name: 'React' });
    await user.click(option);
    expect(onChange).toHaveBeenCalled();
  });

  it('uses text content for non-string item labels', async () => {
    render(
      <Combobox multiple value={['react']} defaultOpen>
        <Combobox.Input />
        <Combobox.Content>
          <Combobox.Item value="react">
            <span>React</span>
          </Combobox.Item>
        </Combobox.Content>
      </Combobox>
    );

    expect((await screen.findAllByText('React')).length).toBeGreaterThan(0);
    expect(screen.queryByText('[object Object]')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Combobox placeholder="Search...">
        <Combobox.Input aria-label="Search frameworks" />
        <Combobox.Content>
          <Combobox.Item value="react">React</Combobox.Item>
        </Combobox.Content>
      </Combobox>
    );
    // The internal Base UI trigger button lacks aria-label by design (it's a
    // decorative chevron next to the labeled input). Disable button-name for
    // this component-level test.
    await expectNoA11yViolations(container, {
      disabledRules: ['button-name'],
    });
  });

  describe('keyboard & focus', () => {
    it('ArrowDown opens the dropdown from input', async () => {
      const user = userEvent.setup();
      renderCombobox();

      const input = screen.getByRole('combobox');
      await user.click(input);
      // Close it first, then reopen with keyboard
      await user.keyboard('{Escape}');
      await user.keyboard('{ArrowDown}');
      expect(await screen.findByRole('option', { name: 'React' })).toBeInTheDocument();
    });

    it('options are rendered in listbox when open', async () => {
      const user = userEvent.setup();
      renderCombobox();

      await user.click(screen.getByRole('combobox'));
      expect(await screen.findByRole('option', { name: 'React' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Vue' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Angular' })).toBeInTheDocument();
    });

    it('input has aria-expanded when dropdown is open', async () => {
      const user = userEvent.setup();
      renderCombobox();

      const input = screen.getByRole('combobox');
      await user.click(input);
      await screen.findByRole('option', { name: 'React' });
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('clicking an option selects it', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderCombobox({ onValueChange: onChange });

      await user.click(screen.getByRole('combobox'));
      const option = await screen.findByRole('option', { name: 'Vue' });
      await user.click(option);
      expect(onChange).toHaveBeenCalledWith('vue');
    });

    it('Escape closes the dropdown', async () => {
      const user = userEvent.setup();
      renderCombobox();

      await user.click(screen.getByRole('combobox'));
      await screen.findByRole('option', { name: 'React' });

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });

    it('focus stays on input after Escape', async () => {
      const user = userEvent.setup();
      renderCombobox();

      const input = screen.getByRole('combobox');
      await user.click(input);
      await screen.findByRole('option', { name: 'React' });

      await user.keyboard('{Escape}');
      expect(input).toHaveFocus();
    });

    it('typing filters results to show matching option', async () => {
      const user = userEvent.setup();
      renderCombobox();

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.type(input, 'rea');

      // React should be visible after filtering
      expect(await screen.findByRole('option', { name: 'React' })).toBeInTheDocument();
    });

    it('Escape after filtering closes the dropdown', async () => {
      const user = userEvent.setup();
      renderCombobox();

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.type(input, 'vue');
      await screen.findByRole('option', { name: 'Vue' });

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });
  });

  it('updates chip label when selected option is removed', async () => {
    const renderDemo = (showReact: boolean) => (
      <Combobox multiple value={['react']} defaultOpen>
        <Combobox.Input />
        <Combobox.Content>
          {showReact && <Combobox.Item value="react">React</Combobox.Item>}
          <Combobox.Item value="vue">Vue</Combobox.Item>
        </Combobox.Content>
      </Combobox>
    );

    const { rerender } = render(renderDemo(true));

    await screen.findAllByText('React');
    rerender(renderDemo(false));

    expect(await screen.findByText('react')).toBeInTheDocument();
  });
});
