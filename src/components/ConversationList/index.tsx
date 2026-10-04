"use client";

import * as React from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Loading } from "../Loading";
import styles from "./ConversationList.module.scss";

// ============================================
// Types
// ============================================

/** `"smart"` follows new content while the reader is at the end; `false` never moves the reader. */
export type AutoScrollBehavior = "smart" | false;

/** Where earlier messages stand: nothing to show, loading, or failed. */
export type ConversationHistory = "idle" | "loading" | "error";

export interface ConversationListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Messages, events and the thinking indicator. */
  children: React.ReactNode;
  /** Accessible name of the log. @default "Conversation" */
  label?: string;
  /** Follow new content while the reader is at the end. @default "smart" */
  autoScroll?: AutoScrollBehavior;
  /** Called when the reader reaches the top, to load earlier messages. */
  onScrollTop?: () => void;
  /** Where earlier messages stand. @default "idle" */
  history?: ConversationHistory;
  /** Retry loading earlier messages after `history="error"`. */
  onRetryHistory?: () => void;
  /** What shows when there are no messages. */
  emptyState?: React.ReactNode;
}

export interface ConversationListEventProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A date for a day break; formatted as Today, Yesterday or the date. */
  date?: Date;
  /** Custom date format. */
  format?: (date: Date) => string;
  /** What happened (a model switch, a joined user). Wins over `date`. */
  children?: React.ReactNode;
}

// ============================================
// Context
// ============================================

interface ConversationListContextValue {
  /** Scroll to the newest content and follow it again. */
  scrollToBottom: () => void;
}

const ConversationListContext = React.createContext<ConversationListContextValue | null>(null);

export function useConversationList() {
  const context = React.useContext(ConversationListContext);
  if (!context) {
    throw new Error("useConversationList must be used within a ConversationList");
  }
  return context;
}

// ============================================
// Helpers
// ============================================

/** How close to the end still counts as "at the end". */
const FOLLOW_DISTANCE = 64;

function formatEventDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (day.getTime() === today.getTime()) return "Today";
  if (day.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

interface Anchor {
  element: Element;
  offset: number;
}

/**
 * Chat scrolling: follow the end while the reader is there, hold the reader's
 * place (anchored to the first visible item) when they scroll up, count what
 * arrives meanwhile, and keep the anchor when earlier messages are prepended or
 * the space around the log changes.
 */
function useChatScroll(autoScroll: AutoScrollBehavior) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const following = React.useRef(autoScroll === "smart");
  const anchor = React.useRef<Anchor | null>(null);
  const measured = React.useRef({ scrollHeight: 0, clientHeight: 0 });
  const [away, setAway] = React.useState(false);
  const [unread, setUnread] = React.useState(0);

  const remember = React.useCallback(() => {
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;
    measured.current = { scrollHeight: scroller.scrollHeight, clientHeight: scroller.clientHeight };
    const top = scroller.getBoundingClientRect().top;
    const first = Array.from(content.children).find(
      (child) => child.getBoundingClientRect().bottom > top
    );
    anchor.current = first
      ? { element: first, offset: first.getBoundingClientRect().top - top }
      : null;
  }, []);

  const settle = React.useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (following.current) {
      scroller.scrollTop = scroller.scrollHeight;
    } else if (anchor.current?.element.isConnected) {
      const top = scroller.getBoundingClientRect().top;
      const now = anchor.current.element.getBoundingClientRect().top - top;
      scroller.scrollTop += now - anchor.current.offset;
    }
    remember();
  }, [remember]);

  const scrollToBottom = React.useCallback(() => {
    following.current = true;
    setAway(false);
    setUnread(0);
    settle();
  }, [settle]);

  const onScroll = React.useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const { scrollHeight, clientHeight } = measured.current;
    if (scroller.scrollHeight !== scrollHeight || scroller.clientHeight !== clientHeight) {
      // The layout moved, not the reader.
      settle();
      return;
    }
    const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    const atEnd = distance < FOLLOW_DISTANCE;
    following.current = autoScroll === "smart" && atEnd;
    setAway(!atEnd);
    if (atEnd) setUnread(0);
    remember();
  }, [autoScroll, remember, settle]);

  React.useEffect(() => {
    following.current = autoScroll === "smart" && following.current;
  }, [autoScroll]);

  React.useLayoutEffect(() => {
    settle();
  });

  React.useEffect(() => {
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;
    const resize = new ResizeObserver(() => settle());
    resize.observe(scroller);
    resize.observe(content);
    const mutation = new MutationObserver((records) => {
      if (following.current) return;
      let added = 0;
      for (const record of records) {
        if (record.target !== content || record.nextSibling !== null) continue;
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) added += 1;
        });
      }
      if (added > 0) setUnread((count) => count + added);
    });
    mutation.observe(content, { childList: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, [settle]);

  return { scrollerRef, contentRef, onScroll, scrollToBottom, away, unread };
}

// ============================================
// Parts
// ============================================

function ConversationListEvent({
  date,
  format: customFormat,
  children,
  className,
  ...htmlProps
}: ConversationListEventProps) {
  const classes = [styles.event, className].filter(Boolean).join(" ");
  let text: React.ReactNode = children;
  if (text == null && date) {
    text = (
      <time dateTime={date.toISOString()}>
        {customFormat ? customFormat(date) : formatEventDate(date)}
      </time>
    );
  }
  return (
    <div {...htmlProps} className={classes}>
      <span className={styles.eventLine} aria-hidden="true" />
      <span className={styles.eventText}>{text}</span>
      <span className={styles.eventLine} aria-hidden="true" />
    </div>
  );
}

// ============================================
// Root
// ============================================

function ConversationListRoot({
  children,
  label = "Conversation",
  autoScroll = "smart",
  onScrollTop,
  history = "idle",
  onRetryHistory,
  emptyState,
  className,
  onScroll: userOnScroll,
  ...htmlProps
}: ConversationListProps) {
  const { scrollerRef, contentRef, onScroll, scrollToBottom, away, unread } =
    useChatScroll(autoScroll);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    userOnScroll?.(event);
    onScroll();
    const scroller = scrollerRef.current;
    if (onScrollTop && history === "idle" && scroller && scroller.scrollTop <= FOLLOW_DISTANCE) {
      onScrollTop();
    }
  };

  const contextValue = React.useMemo(() => ({ scrollToBottom }), [scrollToBottom]);
  const hasChildren = React.Children.count(children) > 0;
  const classes = [styles.root, className].filter(Boolean).join(" ");
  const jumpLabel =
    unread > 0 ? `${unread} new ${unread === 1 ? "message" : "messages"}` : "Jump to latest";

  return (
    <ConversationListContext.Provider value={contextValue}>
      <div className={classes}>
        {/* Earlier messages: in flow above the log, so the row is on screen while the log
            holds its place at the end, never scrolled out of view above it. */}
        {history === "loading" && (
          <div className={styles.history} role="status">
            <Loading
              delay={0}
              inline
              label="Loading history…"
              aria-hidden="true"
              role="presentation"
            />
            <span>Loading history…</span>
          </div>
        )}
        {history === "error" && (
          <div className={styles.historyError}>
            <span className={styles.historyErrorIcon} aria-hidden="true">
              <Icon icon={WarningCircle} size="md" />
            </span>
            <p className={styles.historyErrorWords}>Couldn&apos;t load earlier messages.</p>
            {onRetryHistory && (
              <div className={styles.historyErrorActions}>
                <Button variant="soft" size="sm" onClick={onRetryHistory}>
                  Retry
                </Button>
              </div>
            )}
          </div>
        )}
        <div
          {...htmlProps}
          ref={scrollerRef}
          className={styles.scroller}
          role="log"
          aria-live="polite"
          aria-label={label}
          tabIndex={0}
          onScroll={handleScroll}
        >
          <div ref={contentRef} className={styles.content}>
            {hasChildren ? children : emptyState}
          </div>
        </div>
        {autoScroll === "smart" && away && (
          <div className={styles.jump}>
            <Button variant="soft" size="sm" onClick={scrollToBottom}>
              {jumpLabel}
            </Button>
          </div>
        )}
      </div>
    </ConversationListContext.Provider>
  );
}

// ============================================
// Export compound component
// ============================================

export const ConversationList = Object.assign(ConversationListRoot, {
  Event: ConversationListEvent,
});
