import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from '../../test/utils';
import { Command } from './index';
import { Dialog } from '../Dialog';

function renderCommand(props: Partial<React.ComponentProps<typeof Command>> = {}) {
  return render(
    <Command {...props}>
      <Command.Input placeholder="Type a command..." />
      <Command.List>
        <Command.Item onItemSelect={() => {}}>Open File</Command.Item>
        <Command.Item onItemSelect={() => {}}>Save Document</Command.Item>
        <Command.Item onItemSelect={() => {}}>Print</Command.Item>
        <Command.Empty>No results found.</Command.Empty>
      </Command.List>
    </Command>
  );
}

describe('Command', () => {
  it('renders input and items', () => {
    renderCommand();

    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
    expect(screen.getByText('Open File')).toBeInTheDocument();
    expect(screen.getByText('Save Document')).toBeInTheDocument();
    expect(screen.getByText('Print')).toBeInTheDocument();
  });

  it('typing filters items', async () => {
    const user = userEvent.setup();
    renderCommand();

    const input = screen.getByPlaceholderText('Type a command...');
    await user.type(input, 'open');

    await waitFor(() => {
      expect(screen.getByText('Open File')).toBeVisible();
      expect(screen.getByText('Save Document')).not.toBeVisible();
      expect(screen.getByText('Print')).not.toBeVisible();
    });
  });

  it('filtered-out items are hidden', async () => {
    const user = userEvent.setup();
    renderCommand();

    const input = screen.getByPlaceholderText('Type a command...');
    await user.type(input, 'save');

    await waitFor(() => {
      expect(screen.getByText('Save Document')).toBeVisible();
      expect(screen.getByText('Open File')).not.toBeVisible();
    });
  });

  it('empty state shows when no matches', async () => {
    const user = userEvent.setup();
    renderCommand();

    const input = screen.getByPlaceholderText('Type a command...');
    await user.type(input, 'zzzzz');

    await waitFor(() => {
      expect(screen.getByText('No results found.')).toBeInTheDocument();
    });
  });

  it('groups auto-hide when all children filtered', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Group heading="Files">
            <Command.Item onItemSelect={() => {}}>Open File</Command.Item>
          </Command.Group>
          <Command.Group heading="Edit">
            <Command.Item onItemSelect={() => {}}>Copy</Command.Item>
            <Command.Item onItemSelect={() => {}}>Paste</Command.Item>
          </Command.Group>
          <Command.Empty>No results.</Command.Empty>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'copy');

    await waitFor(() => {
      // "Files" group should be hidden since "Open File" doesn't match "copy"
      const filesGroup = screen.getByText('Files').closest('[role="group"]');
      expect(filesGroup).toHaveStyle({ display: 'none' });

      // "Edit" group should be visible since "Copy" matches
      const editGroup = screen.getByText('Edit').closest('[role="group"]');
      expect(editGroup).not.toHaveStyle({ display: 'none' });
    });
  });

  it('custom filter function works', async () => {
    const user = userEvent.setup();
    const customFilter = vi.fn((value: string, search: string) => {
      // Only match exact start
      return value.toLowerCase().startsWith(search.toLowerCase()) ? 1 : 0;
    });

    render(
      <Command filter={customFilter}>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Item onItemSelect={() => {}}>Apple</Command.Item>
          <Command.Item onItemSelect={() => {}}>Banana</Command.Item>
          <Command.Item onItemSelect={() => {}}>Apricot</Command.Item>
          <Command.Empty>No results.</Command.Empty>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'ap');

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeVisible();
      expect(screen.getByText('Apricot')).toBeVisible();
      expect(screen.getByText('Banana')).not.toBeVisible();
    });
  });

  it('ArrowDown/ArrowUp navigates items', async () => {
    const user = userEvent.setup();
    renderCommand();

    const input = screen.getByPlaceholderText('Type a command...');
    input.focus();

    await user.keyboard('{ArrowDown}');

    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem).toBeTruthy();
      expect(activeItem?.textContent).toBe('Open File');
    });

    await user.keyboard('{ArrowDown}');

    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe('Save Document');
    });

    await user.keyboard('{ArrowUp}');

    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe('Open File');
    });
  });

  it('Enter selects active item (calls onItemSelect)', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();

    render(
      <Command>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Item onItemSelect={onItemSelect}>First</Command.Item>
          <Command.Item onItemSelect={() => {}}>Second</Command.Item>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    input.focus();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onItemSelect).toHaveBeenCalledTimes(1);
  });

  it('click selects item', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();

    render(
      <Command>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Item onItemSelect={onItemSelect}>Click Me</Command.Item>
        </Command.List>
      </Command>
    );

    await user.click(screen.getByText('Click Me'));
    expect(onItemSelect).toHaveBeenCalledTimes(1);
  });

  it('disabled items are skipped in keyboard nav', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Item onItemSelect={() => {}}>First</Command.Item>
          <Command.Item disabled onItemSelect={() => {}}>Disabled</Command.Item>
          <Command.Item onItemSelect={() => {}}>Third</Command.Item>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    input.focus();

    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe('First');
    });

    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      // Skips "Disabled", goes to "Third"
      expect(activeItem?.textContent).toBe('Third');
    });
  });

  it('Home/End jump to first/last', async () => {
    const user = userEvent.setup();
    renderCommand();

    const input = screen.getByPlaceholderText('Type a command...');
    input.focus();

    await user.keyboard('{End}');
    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe('Print');
    });

    await user.keyboard('{Home}');
    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe('Open File');
    });
  });

  it('loop={false} stops at boundaries', async () => {
    const user = userEvent.setup();
    render(
      <Command loop={false}>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Item onItemSelect={() => {}}>First</Command.Item>
          <Command.Item onItemSelect={() => {}}>Last</Command.Item>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    input.focus();

    // Navigate to last
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');

    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe('Last');
    });

    // Try to go past last — should stay on Last
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      const activeItem = document.querySelector('[data-active="true"]');
      expect(activeItem?.textContent).toBe('Last');
    });
  });

  it('search value controlled mode', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(
      <Command search="open" onSearchChange={onSearchChange}>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Item onItemSelect={() => {}}>Open File</Command.Item>
          <Command.Item onItemSelect={() => {}}>Save</Command.Item>
          <Command.Empty>No results.</Command.Empty>
        </Command.List>
      </Command>
    );

    await waitFor(() => {
      expect(screen.getByText('Open File')).toBeVisible();
      expect(screen.getByText('Save')).not.toBeVisible();
    });

    // Type in input triggers onSearchChange
    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'x');
    expect(onSearchChange).toHaveBeenCalled();
  });

  it('items with keywords match on keywords', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Item keywords={['shortcut', 'hotkey']} onItemSelect={() => {}}>
            Keyboard Settings
          </Command.Item>
          <Command.Item onItemSelect={() => {}}>Display Settings</Command.Item>
          <Command.Empty>No results.</Command.Empty>
        </Command.List>
      </Command>
    );

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'hotkey');

    await waitFor(() => {
      expect(screen.getByText('Keyboard Settings')).toBeVisible();
      expect(screen.getByText('Display Settings')).not.toBeVisible();
    });
  });

  it('compose inside Dialog (command palette usage)', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <Dialog.Trigger>Open Palette</Dialog.Trigger>
        <Dialog.Content size="sm">
          <Command>
            <Command.Input placeholder="Search commands..." />
            <Command.List>
              <Command.Item onItemSelect={() => {}}>New File</Command.Item>
              <Command.Item onItemSelect={() => {}}>Open Recent</Command.Item>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /open palette/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search commands...')).toBeInTheDocument();
      expect(screen.getByText('New File')).toBeInTheDocument();
      expect(screen.getByText('Open Recent')).toBeInTheDocument();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = renderCommand();

    await expectNoA11yViolations(container);
  });
});
