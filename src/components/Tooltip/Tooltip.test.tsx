import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, userEvent, waitFor, act, expectNoA11yViolations } from '../../test/utils';
import { Tooltip } from './index';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows tooltip content on hover', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByRole('button', { name: /hover me/i }));

    await waitFor(() => {
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });
  });

  it('hides tooltip on unhover', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByRole('button', { name: /hover me/i }));
    await waitFor(() => {
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    await user.unhover(screen.getByRole('button', { name: /hover me/i }));
    await waitFor(() => {
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });
  });

  it('respects delay prop', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Delayed tooltip" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    );

    await user.hover(screen.getByRole('button', { name: /hover me/i }));

    // Tooltip should not be visible immediately
    expect(screen.queryByText('Delayed tooltip')).not.toBeInTheDocument();

    // Advance timers past the delay
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByText('Delayed tooltip')).toBeInTheDocument();
    });
  });

  it('does not render when disabled', () => {
    render(
      <Tooltip content="Hidden tooltip" disabled>
        <button>No tooltip</button>
      </Tooltip>
    );

    // The trigger should just render the child directly
    expect(screen.getByRole('button', { name: /no tooltip/i })).toBeInTheDocument();
  });

  it('supports controlled open state', async () => {
    render(
      <Tooltip content="Controlled tooltip" open={true} delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    await waitFor(() => {
      expect(screen.getByText('Controlled tooltip')).toBeInTheDocument();
    });
  });

  it('has no accessibility violations when open', async () => {
    const { container } = render(
      <Tooltip content="Accessible tooltip" open={true} delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );

    await waitFor(() => {
      expect(screen.getByText('Accessible tooltip')).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
  });
});
