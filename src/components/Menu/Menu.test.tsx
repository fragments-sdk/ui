import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '../../test/utils';
import { axe } from 'vitest-axe';
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

    const results = await axe(container, {
      rules: {
        'page-has-heading-one': { enabled: false },
        region: { enabled: false },
        // Base UI focus guard spans have role="button" without labels
        'aria-command-name': { enabled: false },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
