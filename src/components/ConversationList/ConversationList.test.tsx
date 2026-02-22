import { describe, it, expect, vi, beforeAll } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { ConversationList } from './index';

// jsdom does not implement scrollTo
beforeAll(() => {
  Element.prototype.scrollTo = vi.fn();
});

describe('ConversationList', () => {
  it('renders children as messages', () => {
    render(
      <ConversationList>
        <div>Message 1</div>
        <div>Message 2</div>
      </ConversationList>
    );
    expect(screen.getByText('Message 1')).toBeInTheDocument();
    expect(screen.getByText('Message 2')).toBeInTheDocument();
  });

  it('renders empty state when no children', () => {
    render(
      <ConversationList emptyState={<div>No messages yet</div>}>
        {null}
      </ConversationList>
    );
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });

  it('renders DateSeparator with role="separator"', () => {
    const date = new Date(2025, 0, 15);
    render(
      <ConversationList>
        <ConversationList.DateSeparator date={date} />
        <div>Message</div>
      </ConversationList>
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('renders DateSeparator with custom format function', () => {
    const date = new Date(2025, 0, 15);
    render(
      <ConversationList>
        <ConversationList.DateSeparator date={date} format={() => 'Custom Date'} />
      </ConversationList>
    );
    expect(screen.getByText('Custom Date')).toBeInTheDocument();
  });

  it('renders TypingIndicator with accessible label', () => {
    render(
      <ConversationList>
        <ConversationList.TypingIndicator name="Claude" />
      </ConversationList>
    );
    expect(screen.getByLabelText('Claude is typing')).toBeInTheDocument();
  });

  it('shows loading history spinner when loadingHistory is true', () => {
    render(
      <ConversationList loadingHistory>
        <div>Message</div>
      </ConversationList>
    );
    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  it('composes root onScroll and passes event to onScrollTop', () => {
    const onScroll = vi.fn();
    const onScrollTop = vi.fn();
    const { container } = render(
      <ConversationList onScroll={onScroll} onScrollTop={onScrollTop}>
        <div>Message</div>
      </ConversationList>
    );

    const root = container.firstElementChild as HTMLDivElement;
    Object.defineProperty(root, 'scrollTop', { value: 0, configurable: true });
    Object.defineProperty(root, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(root, 'clientHeight', { value: 500, configurable: true });

    fireEvent.scroll(root);
    expect(onScroll).toHaveBeenCalled();
    expect(onScrollTop).toHaveBeenCalled();
    expect(onScrollTop.mock.calls[0][0]).toBeDefined();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ConversationList>
        <div>Message 1</div>
        <div>Message 2</div>
      </ConversationList>
    );
    await expectNoA11yViolations(container);
  });
});
