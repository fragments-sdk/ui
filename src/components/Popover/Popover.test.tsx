import { describe, it, expect } from 'vitest';
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from '../../test/utils';
import { Popover } from './index';

function renderPopover(props: Partial<React.ComponentProps<typeof Popover>> = {}) {
  return render(
    <Popover {...props}>
      <Popover.Trigger>Open Popover</Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Popover Title</Popover.Title>
        <Popover.Description>Popover description</Popover.Description>
        <Popover.Body>Body text</Popover.Body>
        <Popover.Footer>Footer content</Popover.Footer>
        <Popover.Close />
      </Popover.Content>
    </Popover>
  );
}

describe('Popover', () => {
  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup();
    renderPopover();

    expect(screen.queryByText('Popover Title')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /open popover/i }));
    await waitFor(() => {
      expect(screen.getByText('Popover Title')).toBeInTheDocument();
    });
  });

  it('renders content sub-components', async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole('button', { name: /open popover/i }));
    await waitFor(() => {
      expect(screen.getByText('Popover Title')).toBeInTheDocument();
      expect(screen.getByText('Popover description')).toBeInTheDocument();
      expect(screen.getByText('Body text')).toBeInTheDocument();
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });

  it('forwards html props to trigger, title, description, and close', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger id="popover-trigger">Open</Popover.Trigger>
        <Popover.Content>
          <Popover.Title id="popover-title">Popover Title</Popover.Title>
          <Popover.Description id="popover-description">Popover Description</Popover.Description>
          <Popover.Close data-testid="popover-close" />
        </Popover.Content>
      </Popover>
    );

    expect(screen.getByRole('button', { name: /open/i })).toHaveAttribute('id', 'popover-trigger');
    await user.click(screen.getByRole('button', { name: /open/i }));

    await waitFor(() => {
      expect(screen.getByText('Popover Title')).toHaveAttribute('id', 'popover-title');
      expect(screen.getByText('Popover Description')).toHaveAttribute('id', 'popover-description');
      expect(screen.getByTestId('popover-close')).toBeInTheDocument();
    });
  });

  it('has a close button with aria-label', async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole('button', { name: /open popover/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /close popover/i })).toBeInTheDocument();
    });
  });

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup();
    renderPopover({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Popover Title')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /close popover/i }));
    await waitFor(() => {
      expect(screen.queryByText('Popover Title')).not.toBeInTheDocument();
    });
  });

  it('supports defaultOpen prop', async () => {
    renderPopover({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Popover Title')).toBeInTheDocument();
    });
  });

  it('renders with arrow when enabled', async () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content arrow>
          <p>With arrow</p>
        </Popover.Content>
      </Popover>
    );

    await waitFor(() => {
      expect(screen.getByText('With arrow')).toBeInTheDocument();
    });
  });

  it('has no accessibility violations when open', async () => {
    const { container } = renderPopover({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Popover Title')).toBeInTheDocument();
    });

    await expectNoA11yViolations(container, {
      // Base UI focus guard spans have role="button" without labels.
      disabledRules: ['aria-command-name'],
    });
  });
});
