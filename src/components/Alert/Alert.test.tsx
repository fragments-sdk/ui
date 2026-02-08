import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Alert } from './index';

describe('Alert', () => {
  it('renders with role="alert"', () => {
    render(
      <Alert>
        <Alert.Title>Info</Alert.Title>
        <Alert.Content>Details</Alert.Content>
      </Alert>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies severity variant class', () => {
    const { rerender } = render(
      <Alert severity="error">
        <Alert.Title>Error</Alert.Title>
      </Alert>
    );
    expect(screen.getByRole('alert')).toHaveClass('error');

    rerender(
      <Alert severity="success">
        <Alert.Title>Success</Alert.Title>
      </Alert>
    );
    expect(screen.getByRole('alert')).toHaveClass('success');
  });

  it('links title and content via aria-labelledby and aria-describedby', () => {
    render(
      <Alert>
        <Alert.Title>Title</Alert.Title>
        <Alert.Content>Content</Alert.Content>
      </Alert>
    );
    const alertEl = screen.getByRole('alert');
    const titleId = alertEl.getAttribute('aria-labelledby');
    const descId = alertEl.getAttribute('aria-describedby');
    expect(titleId).toBeTruthy();
    expect(descId).toBeTruthy();
    expect(screen.getByText('Title')).toHaveAttribute('id', titleId);
    expect(screen.getByText('Content')).toHaveAttribute('id', descId);
  });

  it('dismisses when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Alert>
        <Alert.Title>Dismissable</Alert.Title>
        <Alert.Close />
      </Alert>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /dismiss alert/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders default severity icon', () => {
    render(
      <Alert severity="success">
        <Alert.Icon />
        <Alert.Title>Done</Alert.Title>
      </Alert>
    );
    // success icon character is checkmark
    expect(screen.getByText('\u2713')).toBeInTheDocument();
  });

  it('renders compound sub-components', () => {
    render(
      <Alert>
        <Alert.Icon />
        <Alert.Body>
          <Alert.Title>Title</Alert.Title>
          <Alert.Content>Description</Alert.Content>
        </Alert.Body>
        <Alert.Actions>
          <Alert.Action onClick={() => {}}>Retry</Alert.Action>
        </Alert.Actions>
      </Alert>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('fires action callback', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();
    render(
      <Alert>
        <Alert.Title>Alert</Alert.Title>
        <Alert.Actions>
          <Alert.Action onClick={handleAction}>Retry</Alert.Action>
        </Alert.Actions>
      </Alert>
    );
    await user.click(screen.getByText('Retry'));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('defaults to info severity', () => {
    render(
      <Alert>
        <Alert.Title>Default</Alert.Title>
      </Alert>
    );
    expect(screen.getByRole('alert')).toHaveClass('info');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Alert severity="warning">
        <Alert.Icon />
        <Alert.Body>
          <Alert.Title>Warning</Alert.Title>
          <Alert.Content>Something happened</Alert.Content>
        </Alert.Body>
        <Alert.Close />
      </Alert>
    );
    await expectNoA11yViolations(container);
  });
});
