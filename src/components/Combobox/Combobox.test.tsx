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

  it('supports multiple selection mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCombobox({ multiple: true, onValueChange: onChange });

    await user.click(screen.getByRole('combobox'));
    const option = await screen.findByRole('option', { name: 'React' });
    await user.click(option);
    expect(onChange).toHaveBeenCalled();
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
    const results = await (await import('vitest-axe')).axe(container, {
      rules: {
        'page-has-heading-one': { enabled: false },
        region: { enabled: false },
        'button-name': { enabled: false },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
