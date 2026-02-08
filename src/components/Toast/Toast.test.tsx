import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, userEvent, act, waitFor, expectNoA11yViolations } from '../../test/utils';
import { Toast, useToast, ToastProvider } from './index';

// Helper component to trigger toasts via the hook
function ToastTrigger({
  variant,
  title = 'Test Toast',
  description,
  duration,
  action,
}: {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}) {
  const { toast } = useToast();
  return (
    <button
      onClick={() => toast({ title, description, variant, duration, action })}
    >
      Show Toast
    </button>
  );
}

function renderWithProvider(
  ui: React.ReactElement,
  providerProps: Partial<React.ComponentProps<typeof ToastProvider>> = {}
) {
  return render(
    <ToastProvider {...providerProps}>
      {ui}
    </ToastProvider>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a toast when triggered via useToast hook', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider(<ToastTrigger title="Hello Toast" />);

    await user.click(screen.getByRole('button', { name: /show toast/i }));

    await waitFor(() => {
      expect(screen.getByText('Hello Toast')).toBeInTheDocument();
    });
  });

  it('renders title and description', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider(
      <ToastTrigger title="Title" description="Description text" />
    );

    await user.click(screen.getByRole('button', { name: /show toast/i }));

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });
  });

  it('uses role="alert" for error variant', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider(<ToastTrigger variant="error" title="Error!" />);

    await user.click(screen.getByRole('button', { name: /show toast/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('uses role="alert" for warning variant', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider(<ToastTrigger variant="warning" title="Warning!" />);

    await user.click(screen.getByRole('button', { name: /show toast/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('uses role="status" for default/success/info variants', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider(<ToastTrigger variant="success" title="Success!" />);

    await user.click(screen.getByRole('button', { name: /show toast/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  it('dismiss button has aria-label', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider(<ToastTrigger title="Dismissable" />);

    await user.click(screen.getByRole('button', { name: /show toast/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /dismiss notification/i })).toBeInTheDocument();
    });
  });

  it('dismisses when dismiss button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider(<ToastTrigger title="To Dismiss" duration={0} />);

    await user.click(screen.getByRole('button', { name: /show toast/i }));

    await waitFor(() => {
      expect(screen.getByText('To Dismiss')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /dismiss notification/i }));

    await waitFor(() => {
      expect(screen.queryByText('To Dismiss')).not.toBeInTheDocument();
    });
  });

  it('auto-dismisses after duration', async () => {
    renderWithProvider(
      <ToastTrigger title="Auto Dismiss" duration={3000} />,
      { duration: 3000 }
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(screen.getByRole('button', { name: /show toast/i }));

    await waitFor(() => {
      expect(screen.getByText('Auto Dismiss')).toBeInTheDocument();
    });

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Auto Dismiss')).not.toBeInTheDocument();
    });
  });

  it('renders action button when action is provided', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProvider(
      <ToastTrigger
        title="With Action"
        duration={0}
        action={{ label: 'Undo', onClick }}
      />
    );

    await user.click(screen.getByRole('button', { name: /show toast/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /undo/i }));
    expect(onClick).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = renderWithProvider(
      <ToastTrigger title="Accessible Toast" variant="info" />
    );

    await user.click(screen.getByRole('button', { name: /show toast/i }));

    await waitFor(() => {
      expect(screen.getByText('Accessible Toast')).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
  });
});
