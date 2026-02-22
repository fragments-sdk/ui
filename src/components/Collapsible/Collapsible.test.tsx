import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Collapsible } from './index';

function renderCollapsible(props: Partial<React.ComponentProps<typeof Collapsible>> = {}) {
  return render(
    <Collapsible {...props}>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Content>Collapsible content here</Collapsible.Content>
    </Collapsible>
  );
}

describe('Collapsible', () => {
  it('renders the trigger', () => {
    renderCollapsible();
    expect(screen.getByRole('button', { name: /toggle/i })).toBeInTheDocument();
  });

  it('opens content when trigger is clicked', async () => {
    const user = userEvent.setup();
    renderCollapsible();

    expect(screen.queryByText('Collapsible content here')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /toggle/i }));
    expect(screen.getByText('Collapsible content here')).toBeInTheDocument();
  });

  it('closes content when trigger is clicked again', async () => {
    const user = userEvent.setup();
    renderCollapsible({ defaultOpen: true });

    expect(screen.getByText('Collapsible content here')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /toggle/i }));
    expect(screen.queryByText('Collapsible content here')).not.toBeInTheDocument();
  });

  it('sets aria-expanded on the trigger', async () => {
    const user = userEvent.setup();
    renderCollapsible();

    const trigger = screen.getByRole('button', { name: /toggle/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('links trigger aria-controls to content id', () => {
    renderCollapsible({ defaultOpen: true });
    const trigger = screen.getByRole('button', { name: /toggle/i });
    const contentId = trigger.getAttribute('aria-controls');
    expect(contentId).toBeTruthy();
    expect(document.getElementById(contentId!)).toBeInTheDocument();
  });

  it('supports controlled open prop', () => {
    const { rerender } = render(
      <Collapsible open={false}>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Content>Content</Collapsible.Content>
      </Collapsible>
    );

    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    rerender(
      <Collapsible open={true}>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Content>Content</Collapsible.Content>
      </Collapsible>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('fires onOpenChange callback', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderCollapsible({ onOpenChange });

    await user.click(screen.getByRole('button', { name: /toggle/i }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    renderCollapsible({ disabled: true });

    const trigger = screen.getByRole('button', { name: /toggle/i });
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    expect(screen.queryByText('Collapsible content here')).not.toBeInTheDocument();
  });

  it('composes child handlers when trigger uses asChild', async () => {
    const user = userEvent.setup();
    const childClick = vi.fn();
    const childKeyDown = vi.fn();

    render(
      <Collapsible>
        <Collapsible.Trigger asChild>
          <button onClick={childClick} onKeyDown={childKeyDown}>Toggle</button>
        </Collapsible.Trigger>
        <Collapsible.Content>Collapsible content here</Collapsible.Content>
      </Collapsible>
    );

    const trigger = screen.getByRole('button', { name: /toggle/i });
    await user.click(trigger);
    expect(childClick).toHaveBeenCalled();
    expect(screen.getByText('Collapsible content here')).toBeInTheDocument();

    await user.keyboard('{Enter}');
    expect(childKeyDown).toHaveBeenCalled();
  });

  it('forwards html props to root, trigger, and content', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible data-testid="root" data-track="collapsible-root">
        <Collapsible.Trigger data-testid="trigger" aria-label="Toggle section">Toggle</Collapsible.Trigger>
        <Collapsible.Content data-testid="content" data-panel="details">
          Collapsible content here
        </Collapsible.Content>
      </Collapsible>
    );

    await user.click(screen.getByTestId('trigger'));

    expect(screen.getByTestId('root')).toHaveAttribute('data-track', 'collapsible-root');
    expect(screen.getByTestId('trigger')).toHaveAttribute('aria-label', 'Toggle section');
    expect(screen.getByTestId('content')).toHaveAttribute('data-panel', 'details');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderCollapsible({ defaultOpen: true });
    await expectNoA11yViolations(container);
  });
});
