import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Message } from './index';

describe('Message', () => {
  it('renders with data-role attribute', () => {
    const { container } = render(
      <Message role="user">
        <Message.Content>Hello</Message.Content>
      </Message>
    );
    expect(container.firstElementChild).toHaveAttribute('data-role', 'user');
  });

  it('renders content text', () => {
    render(
      <Message role="assistant">
        <Message.Content>Response text</Message.Content>
      </Message>
    );
    expect(screen.getByText('Response text')).toBeInTheDocument();
  });

  it('renders default avatar based on role', () => {
    const { container } = render(
      <Message role="user">
        <Message.Content>Hi</Message.Content>
      </Message>
    );
    // Default avatar renders an SVG
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('sets data-status attribute', () => {
    const { container } = render(
      <Message role="assistant" status="streaming">
        <Message.Content>Streaming...</Message.Content>
      </Message>
    );
    expect(container.firstElementChild).toHaveAttribute('data-status', 'streaming');
  });

  it('renders timestamp sub-component', () => {
    const date = new Date('2025-01-15T10:00:00');
    render(
      <Message role="user" timestamp={date}>
        <Message.Content>Timed</Message.Content>
        <Message.Timestamp />
      </Message>
    );
    // Timestamp renders a formatted date string in a span with class "timestamp"
    const timestampEl = document.querySelector('.timestamp');
    expect(timestampEl).toBeInTheDocument();
    expect(timestampEl!.textContent).toBeTruthy();
  });

  it('renders actions sub-component', () => {
    render(
      <Message role="assistant">
        <Message.Content>Done</Message.Content>
        <Message.Actions><button>Copy</button></Message.Actions>
      </Message>
    );
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Message role="user">
        <Message.Content>Accessible message</Message.Content>
      </Message>
    );
    await expectNoA11yViolations(container);
  });
});
