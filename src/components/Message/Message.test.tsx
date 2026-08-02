import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Message } from './index';

const messageStyles = readFileSync(
  resolve(process.cwd(), 'src/components/Message/Message.module.scss'),
  'utf8'
);

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
    expect(container.querySelector('[class*="avatar"]')).toHaveClass('sm');
  });

  it('uses the public avatar image fallback seam when an image fails', () => {
    const { container } = render(
      <Message role="assistant">
        <Message.Avatar src="/missing.png" alt="Assistant" />
        <Message.Content>Hi</Message.Content>
      </Message>
    );

    expect(container.querySelector('img')).toHaveAttribute('alt', 'Assistant');
    expect(container.querySelector('[class*="avatar"]')).toHaveClass('sm');
  });

  it('marks avatarless assistant and user messages for compact role-aware spacing', () => {
    const { container } = render(
      <>
        <Message role="assistant" avatar={null}>
          <Message.Content>Avatarless assistant</Message.Content>
        </Message>
        <Message role="user" avatar={null}>
          <Message.Content>Avatarless user</Message.Content>
        </Message>
      </>
    );

    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(container.querySelector('[data-role="assistant"]')).toHaveClass('withoutAvatar');
    expect(container.querySelector('[data-role="user"]')).toHaveClass('withoutAvatar');
  });

  it('caps only the user bubble width', () => {
    expect(messageStyles).toMatch(
      /\.user\s*\{[\s\S]*?\.content\s*\{[\s\S]*?max-inline-size:\s*80%;/
    );
    expect(messageStyles.match(/max-inline-size:\s*80%;/g)).toHaveLength(1);
  });

  it('uses neutral message chrome instead of brand accent', () => {
    expect(messageStyles).toContain(
      'background-color: var(--fui-bg-tertiary, $fui-bg-tertiary);'
    );
    expect(messageStyles).toContain(
      'color: var(--fui-text-primary, $fui-text-primary);'
    );
    expect(messageStyles).not.toContain('--fui-color-accent');
    expect(messageStyles).not.toContain('--fui-color-on-accent');
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
