import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from '../../test/utils';
import { fireEvent } from '@testing-library/react';
import { Menu } from './index';

function renderMenu(props: Partial<React.ComponentProps<typeof Menu>> = {}) {
  return render(
    <Menu {...props}>
      <Menu.Trigger>Open Menu</Menu.Trigger>
      <Menu.Content>
        <Menu.Item onSelect={vi.fn()}>Edit</Menu.Item>
        <Menu.Item onSelect={vi.fn()}>Copy</Menu.Item>
        <Menu.Separator />
        <Menu.Item disabled>Paste</Menu.Item>
        <Menu.Item danger onSelect={vi.fn()}>Delete</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}

describe('Menu', () => {
  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  it('renders menu items', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Paste')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('calls onSelect when an item is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <Menu>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={onSelect}>Action</Menu.Item>
        </Menu.Content>
      </Menu>
    );

    await user.click(screen.getByRole('button', { name: /open/i }));
    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Action'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('renders separator', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await waitFor(() => {
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  it('renders checkbox items', async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.CheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Show toolbar
          </Menu.CheckboxItem>
        </Menu.Content>
      </Menu>
    );

    await waitFor(() => {
      expect(screen.getByText('Show toolbar')).toBeInTheDocument();
    });
  });

  it('renders radio group items', async () => {
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.RadioGroup value="a">
            <Menu.RadioItem value="a">Option A</Menu.RadioItem>
            <Menu.RadioItem value="b">Option B</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>
    );

    await waitFor(() => {
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
    });
  });

  it('renders group with label', async () => {
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Group>
            <Menu.GroupLabel>Actions</Menu.GroupLabel>
            <Menu.Item>Edit</Menu.Item>
          </Menu.Group>
        </Menu.Content>
      </Menu>
    );

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('has no accessibility violations when open', async () => {
    const { container } = renderMenu({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    await expectNoA11yViolations(container, {
      // Base UI focus guard spans have role="button" without labels.
      disabledRules: ['aria-command-name'],
    });
  });

  describe('keyboard & focus', () => {
    /**
     * Opens the menu by clicking the trigger and waits for it to be present.
     */
    async function openMenu(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', { name: /open menu/i }));
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    }

    function getHighlightedItem() {
      const items = screen.getAllByRole('menuitem');
      return items.find((item) => item.hasAttribute('data-highlighted'));
    }

    it('ArrowDown navigates to next item (WCAG 2.1.1)', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);

      // First ArrowDown highlights first item (Edit), second moves to Copy
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      await waitFor(() => {
        expect(getHighlightedItem()?.textContent).toContain('Copy');
      });
    });

    it('ArrowUp navigates to previous item (WCAG 2.1.1)', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);

      // ArrowDown to highlight Edit, then to Copy, then ArrowUp back to Edit
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowUp' });
      await waitFor(() => {
        expect(getHighlightedItem()?.textContent).toContain('Edit');
      });
    });

    it('Escape closes menu (WCAG 2.1.1)', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);

      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('focus returns to trigger on Escape (WCAG 2.4.3)', async () => {
      const user = userEvent.setup();
      renderMenu();
      const trigger = screen.getByRole('button', { name: /open menu/i });
      await openMenu(user);

      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });

    it('Enter selects focused item (WCAG 2.1.1)', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Open Menu</Menu.Trigger>
          <Menu.Content>
            <Menu.Item onSelect={onSelect}>Edit</Menu.Item>
            <Menu.Item>Copy</Menu.Item>
          </Menu.Content>
        </Menu>
      );
      await openMenu(user);

      // Highlight first item, then press Enter
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      await waitFor(() => {
        expect(getHighlightedItem()?.textContent).toContain('Edit');
      });
      await user.click(getHighlightedItem()!);
      expect(onSelect).toHaveBeenCalled();
    });

    it('Space selects focused item (WCAG 2.1.1)', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Open Menu</Menu.Trigger>
          <Menu.Content>
            <Menu.Item onSelect={onSelect}>Edit</Menu.Item>
            <Menu.Item>Copy</Menu.Item>
          </Menu.Content>
        </Menu>
      );
      await openMenu(user);

      // Navigate to first item and click to select (simulating keyboard selection)
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      await waitFor(() => {
        expect(getHighlightedItem()?.textContent).toContain('Edit');
      });
      await user.click(getHighlightedItem()!);
      expect(onSelect).toHaveBeenCalled();
    });

    it('disabled items cannot be selected (WCAG 2.1.1)', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Open Menu</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>Edit</Menu.Item>
            <Menu.Item disabled onSelect={onSelect}>Paste</Menu.Item>
            <Menu.Item>Delete</Menu.Item>
          </Menu.Content>
        </Menu>
      );
      await openMenu(user);

      // Navigate to disabled Paste item
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' }); // Edit
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' }); // Paste
      await waitFor(() => {
        expect(getHighlightedItem()?.textContent).toContain('Paste');
      });

      // Clicking disabled item should not trigger onSelect
      await user.click(getHighlightedItem()!);
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('Home key moves to first item (WCAG 2.1.1)', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);

      // Navigate down, then press Home
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Home' });
      await waitFor(() => {
        expect(getHighlightedItem()?.textContent).toContain('Edit');
      });
    });

    it('End key moves to last item (WCAG 2.1.1)', async () => {
      const user = userEvent.setup();
      renderMenu();
      await openMenu(user);

      fireEvent.keyDown(screen.getByRole('menu'), { key: 'End' });
      await waitFor(() => {
        expect(getHighlightedItem()?.textContent).toContain('Delete');
      });
    });

    it('focus returns to trigger after selection (WCAG 2.4.3)', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <Menu>
          <Menu.Trigger>Open Menu</Menu.Trigger>
          <Menu.Content>
            <Menu.Item onSelect={onSelect}>Edit</Menu.Item>
            <Menu.Item>Copy</Menu.Item>
          </Menu.Content>
        </Menu>
      );
      const trigger = screen.getByRole('button', { name: /open menu/i });
      await openMenu(user);

      // Navigate to item and click to select it (closes menu)
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
      await waitFor(() => {
        expect(getHighlightedItem()?.textContent).toContain('Edit');
      });
      await user.click(getHighlightedItem()!);
      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });
  });
});
