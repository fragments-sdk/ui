'use client';

import * as React from 'react';
import styles from './ConversationList.module.scss';
import { Loading } from '../Loading';

// ============================================
// Types
// ============================================

export type AutoScrollBehavior = boolean | 'smart';

export interface ConversationListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Message components */
  children: React.ReactNode;
  /** Auto-scroll behavior: true (always), false (never), or 'smart' (only when near bottom) */
  autoScroll?: AutoScrollBehavior;
  /** Callback when user scrolls to top (for loading history) */
  onScrollTop?: () => void;
  /** Show loading spinner at top when loading history */
  loadingHistory?: boolean;
  /** Content to show when conversation is empty */
  emptyState?: React.ReactNode;
  /** Threshold in pixels from top to trigger onScrollTop */
  scrollTopThreshold?: number;
  /** Threshold in pixels from bottom for smart auto-scroll */
  scrollBottomThreshold?: number;
}

export interface DateSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Date to display */
  date: Date;
  /** Custom format function */
  format?: (date: Date) => string;
}

export interface TypingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Who is typing */
  name?: string;
  /** Custom avatar */
  avatar?: React.ReactNode;
}

// ============================================
// Context
// ============================================

interface ConversationListContextValue {
  scrollToBottom: () => void;
}

const ConversationListContext = React.createContext<ConversationListContextValue | null>(null);

export function useConversationList() {
  const context = React.useContext(ConversationListContext);
  if (!context) {
    throw new Error('useConversationList must be used within a ConversationList');
  }
  return context;
}

// ============================================
// Helper Functions
// ============================================

function formatDateSeparator(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateOnly.getTime() === today.getTime()) {
    return 'Today';
  }
  if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}


// ============================================
// Sub-components
// ============================================

function DateSeparator({
  date,
  format: customFormat,
  className,
  ...htmlProps
}: DateSeparatorProps) {
  const formatted = customFormat ? customFormat(date) : formatDateSeparator(date);

  const classes = [styles.dateSeparator, className].filter(Boolean).join(' ');

  return (
    <div {...htmlProps} className={classes} role="separator">
      <span className={styles.dateSeparatorLine} />
      <span className={styles.dateSeparatorText}>{formatted}</span>
      <span className={styles.dateSeparatorLine} />
    </div>
  );
}

function TypingIndicator({
  name = 'Assistant',
  avatar,
  className,
  ...htmlProps
}: TypingIndicatorProps) {
  const classes = [styles.typingIndicator, className].filter(Boolean).join(' ');

  return (
    <div {...htmlProps} className={classes} aria-label={`${name} is typing`}>
      {avatar && <div className={styles.typingAvatar}>{avatar}</div>}
      <div className={styles.typingContent}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

function ConversationListRoot({
  children,
  autoScroll = 'smart',
  onScrollTop,
  loadingHistory = false,
  emptyState,
  scrollTopThreshold = 50,
  scrollBottomThreshold = 100,
  className,
  ...htmlProps
}: ConversationListProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isNearBottomRef = React.useRef(true);
  const prevChildrenCountRef = React.useRef(0);

  // Check if user is near the bottom
  const checkIsNearBottom = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight <= scrollBottomThreshold;
  }, [scrollBottomThreshold]);

  // Scroll to bottom
  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  // Handle scroll events
  const handleScroll = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Update near-bottom status for smart scroll
    isNearBottomRef.current = checkIsNearBottom();

    // Check for scroll-to-top (history loading)
    if (onScrollTop && container.scrollTop <= scrollTopThreshold) {
      onScrollTop();
    }
  }, [checkIsNearBottom, onScrollTop, scrollTopThreshold]);

  // Auto-scroll on new messages
  React.useEffect(() => {
    const childrenCount = React.Children.count(children);
    const hasNewMessages = childrenCount > prevChildrenCountRef.current;
    prevChildrenCountRef.current = childrenCount;

    if (!hasNewMessages) return;

    if (autoScroll === true) {
      scrollToBottom();
    } else if (autoScroll === 'smart' && isNearBottomRef.current) {
      scrollToBottom();
    }
  }, [children, autoScroll, scrollToBottom]);

  // Initial scroll to bottom
  React.useEffect(() => {
    if (autoScroll) {
      scrollToBottom('instant');
    }
  }, [autoScroll, scrollToBottom]);

  const contextValue: ConversationListContextValue = {
    scrollToBottom,
  };

  const hasChildren = React.Children.count(children) > 0;

  const classes = [
    styles.conversationList,
    className,
  ].filter(Boolean).join(' ');

  return (
    <ConversationListContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        ref={containerRef}
        className={classes}
        onScroll={handleScroll}
      >
        {loadingHistory && (
          <div className={styles.loadingHistory}>
            <Loading size="md" variant="spinner" color="muted" label="Loading history" />
            <span>Loading history...</span>
          </div>
        )}

        <div ref={contentRef} className={styles.content}>
          {hasChildren ? children : emptyState}
        </div>
      </div>
    </ConversationListContext.Provider>
  );
}

// ============================================
// Export compound component
// ============================================

export const ConversationList = Object.assign(ConversationListRoot, {
  DateSeparator,
  TypingIndicator,
});

export {
  ConversationListRoot,
  DateSeparator,
  TypingIndicator,
};
