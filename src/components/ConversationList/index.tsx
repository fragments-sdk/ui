"use client";

import * as React from "react";
import styles from "./ConversationList.module.scss";
import { Loading } from "../Loading";

// ============================================
// Types
// ============================================

export type AutoScrollBehavior = boolean | "smart";

export interface ConversationListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Message components */
  children: React.ReactNode;
  /** Show avatars for messages and typing indicators in this conversation */
  showAvatars?: boolean;
  /** Auto-scroll behavior: true (always), false (never), or 'smart' (only when near bottom) */
  autoScroll?: AutoScrollBehavior;
  /** Callback when user scrolls to top (for loading history) */
  onScrollTop?: (event?: React.UIEvent<HTMLDivElement>) => void;
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
  showAvatars: boolean;
}

const ConversationListContext = React.createContext<ConversationListContextValue | null>(null);

export function useOptionalConversationList() {
  return React.useContext(ConversationListContext);
}

export function useConversationList() {
  const context = useOptionalConversationList();
  if (!context) {
    throw new Error("useConversationList must be used within a ConversationList");
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
    return "Today";
  }
  if (dateOnly.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
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

  const classes = [styles.dateSeparator, className].filter(Boolean).join(" ");

  return (
    <div {...htmlProps} className={classes} role="separator">
      <span className={styles.dateSeparatorLine} />
      <span className={styles.dateSeparatorText}>{formatted}</span>
      <span className={styles.dateSeparatorLine} />
    </div>
  );
}

function TypingIndicator({
  name = "Assistant",
  avatar,
  className,
  ...htmlProps
}: TypingIndicatorProps) {
  const showAvatar = (useOptionalConversationList()?.showAvatars ?? true) && Boolean(avatar);
  const classes = [styles.typingIndicator, !showAvatar && styles.withoutAvatar, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div {...htmlProps} className={classes} role="status" aria-label={`${name} is typing`}>
      {showAvatar && <div className={styles.typingAvatar}>{avatar}</div>}
      <div className={styles.typingContent}>
        <Loading
          size="sm"
          variant="dots"
          color="muted"
          label=""
          role="presentation"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

function ConversationListRoot({
  children,
  showAvatars = true,
  autoScroll = "smart",
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
  const userOnScroll = htmlProps.onScroll;

  // Check if user is near the bottom
  const checkIsNearBottom = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight <= scrollBottomThreshold;
  }, [scrollBottomThreshold]);

  // Scroll to bottom
  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  // Handle scroll events
  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      userOnScroll?.(event);
      if (event.defaultPrevented) return;

      const container = containerRef.current;
      if (!container) return;

      // Update near-bottom status for smart scroll
      isNearBottomRef.current = checkIsNearBottom();

      // Check for scroll-to-top (history loading)
      if (onScrollTop && container.scrollTop <= scrollTopThreshold) {
        onScrollTop(event);
      }
    },
    [checkIsNearBottom, onScrollTop, scrollTopThreshold, userOnScroll]
  );

  // Keep the reader at the newest content as the conversation grows.
  //
  // Child count is the wrong signal for this. A list whose messages are wrapped
  // in a single element — a measured column, a virtualiser, a fragment the
  // caller maps into — never changes count, so the list would pin once on mount
  // and never again. And even when the count does change, the height keeps
  // moving afterwards: markdown reflows, images decode, syntax highlighting
  // lands, a streaming reply grows a character at a time. Rendered height is
  // what actually moves the bottom of the list, so that is what this watches.
  React.useEffect(() => {
    const content = contentRef.current;
    if (!content || !autoScroll) return;

    // Instant, not smooth: while a reply streams this fires on every frame of
    // growth, and overlapping smooth scrolls fight each other into a stutter.
    // The context's scrollToBottom() stays smooth for deliberate jumps.
    const observer = new ResizeObserver(() => {
      if (autoScroll === true || isNearBottomRef.current) scrollToBottom("instant");
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [autoScroll, scrollToBottom]);

  const contextValue = React.useMemo<ConversationListContextValue>(
    () => ({
      scrollToBottom,
      showAvatars,
    }),
    [scrollToBottom, showAvatars]
  );

  const hasChildren = React.Children.count(children) > 0;

  const classes = [styles.conversationList, className].filter(Boolean).join(" ");

  return (
    <ConversationListContext.Provider value={contextValue}>
      <div {...htmlProps} ref={containerRef} className={classes} onScroll={handleScroll}>
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

export { ConversationListRoot, DateSeparator, TypingIndicator };
