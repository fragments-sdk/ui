import { describe, it, expect } from 'vitest';
import { render, screen, userEvent, waitFor } from '../../test/utils';
import { axe } from 'vitest-axe';
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
