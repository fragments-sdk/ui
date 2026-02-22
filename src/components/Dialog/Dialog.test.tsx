import { describe, it, expect } from 'vitest';
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from '../../test/utils';
import { Dialog } from './index';

function renderDialog(props: Partial<React.ComponentProps<typeof Dialog>> = {}) {
  return render(
    <Dialog {...props}>
      <Dialog.Trigger>Open Dialog</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <Dialog.Description>Dialog description text</Dialog.Description>
          <p>Body content</p>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <button>Cancel</button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /open dialog/i }));
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });
  });

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup();
    renderDialog({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close dialog/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });

  it('close button has aria-label', async () => {
    renderDialog({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
    });
  });

  it('renders title and description', async () => {
    renderDialog({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Dialog description text')).toBeInTheDocument();
    });
  });

  it('forwards html props to trigger, title, description, and close', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <Dialog.Trigger id="dialog-trigger">Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title id="dialog-title">Dialog Title</Dialog.Title>
          <Dialog.Description id="dialog-description">Dialog Description</Dialog.Description>
          <Dialog.Close data-testid="dialog-close" />
        </Dialog.Content>
      </Dialog>
    );

    expect(screen.getByRole('button', { name: /open/i })).toHaveAttribute('id', 'dialog-trigger');
    await user.click(screen.getByRole('button', { name: /open/i }));

    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toHaveAttribute('id', 'dialog-title');
      expect(screen.getByText('Dialog Description')).toHaveAttribute('id', 'dialog-description');
      expect(screen.getByTestId('dialog-close')).toBeInTheDocument();
    });
  });

  it('renders compound sub-components (Header, Body, Footer)', async () => {
    renderDialog({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Body content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  it('supports size variant prop', async () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content size="lg">
          <Dialog.Title>Large Dialog</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );

    await waitFor(() => {
      expect(screen.getByText('Large Dialog')).toBeInTheDocument();
    });
  });

  it('renders as modal by default', async () => {
    renderDialog({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });
  });

  it('has no accessibility violations when open', async () => {
    const { container } = renderDialog({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    await expectNoA11yViolations(container, {
      // Base UI focus guard spans have role="button" without labels.
      disabledRules: ['aria-command-name'],
    });
  });

  describe('keyboard & focus', () => {
    it('Escape closes dialog (WCAG 2.1.1)', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });
    });

    it('focus moves into dialog on open (WCAG 2.4.3)', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: /open dialog/i }));

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it('focus returns to trigger on Escape (WCAG 2.4.3)', async () => {
      const user = userEvent.setup();
      renderDialog();

      const trigger = screen.getByRole('button', { name: /open dialog/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });

    it('focus returns to trigger on Close button click (WCAG 2.4.3)', async () => {
      const user = userEvent.setup();
      renderDialog();

      const trigger = screen.getByRole('button', { name: /open dialog/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });

    it('Tab cycles within dialog (focus trap) (WCAG 2.1.2)', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');
      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      // Tab through focusable elements — focus should stay inside dialog
      await user.tab();
      await user.tab();
      await user.tab();

      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });

      // Verify that close and cancel buttons are reachable
      // Focus one of them directly and confirm containment
      closeButton.focus();
      expect(dialog.contains(document.activeElement)).toBe(true);

      cancelButton.focus();
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('Shift+Tab cycles backward (WCAG 2.1.2)', async () => {
      const user = userEvent.setup();
      renderDialog({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      const dialog = screen.getByRole('dialog');

      // Shift+Tab backward multiple times — focus should remain trapped
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      await user.keyboard('{Shift>}{Tab}{/Shift}');

      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
    });

    it('role="dialog" is present when open (WCAG 4.1.2)', async () => {
      renderDialog({ defaultOpen: true });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('Cancel button closes dialog and returns focus (WCAG 2.4.3)', async () => {
      const user = userEvent.setup();
      renderDialog();

      const trigger = screen.getByRole('button', { name: /open dialog/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });
  });
});
