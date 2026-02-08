import { describe, it, expect, vi, beforeAll } from 'vitest';
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
