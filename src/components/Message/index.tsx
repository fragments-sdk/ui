"use client";

import * as React from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Markdown } from "../Markdown";
import styles from "./Message.module.scss";

// ============================================
// Types
// ============================================

/** Who wrote the message. Events (a model switch, a joined user) are ConversationList.Event. */
export type MessageFrom = "user" | "assistant";
export type MessageStatus = "pending" | "streaming" | "complete" | "error";

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Who wrote the message: the user's bubble sits at the end, the assistant's reply is flush. */
  from: MessageFrom;
  /** Where the message stands. @default "complete" */
  status?: MessageStatus;
  /** When the message was sent; shown in the meta line. */
  timestamp?: Date;
  /** Opt-in avatar slot, usually `<Message.Avatar>`. No avatar is drawn by default. */
  avatar?: React.ReactNode;
  /** Actions for the message (copy, regenerate), shown on hover or focus where a pointer hovers. */
  actions?: React.ReactNode;
  /** Retry a failed message. With `status="error"` the failure block offers "Try again". */
  onRetry?: () => void;
  children: React.ReactNode;
}

export interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A string from the assistant renders as markdown; from the user it keeps its line breaks. */
  children: React.ReactNode;
}

export interface MessageActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface MessageTimestampProps extends Omit<
  React.TimeHTMLAttributes<HTMLElement>,
  "children"
> {
  /** Date to show. Defaults to the message's `timestamp`. */
  date?: Date;
  /** Custom format function. */
  format?: (date: Date) => string;
}

export interface MessageAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL. */
  src?: string;
  /** Alt text for the image. */
  alt?: string;
  /** Initials or a glyph when there is no image. */
  children?: React.ReactNode;
}

export interface MessageErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** What went wrong. @default "Not sent." for the user, "This reply didn't finish." for the assistant */
  children?: React.ReactNode;
  /** Retry handler; adds the "Try again" action. Defaults to the message's `onRetry`. */
  onRetry?: () => void;
  /** Label of the retry action. @default "Try again" */
  retryLabel?: string;
  /** More actions beside retry (for example "Ask differently"). */
  actions?: React.ReactNode;
}

// ============================================
// Context
// ============================================

interface MessageContextValue {
  from: MessageFrom;
  status: MessageStatus;
  timestamp?: Date;
  onRetry?: () => void;
}

const MessageContext = React.createContext<MessageContextValue | null>(null);

function useMessageContext() {
  const context = React.useContext(MessageContext);
  if (!context) {
    throw new Error("Message compound components must be used within a Message");
  }
  return context;
}

// ============================================
// Helpers
// ============================================

function formatTimestamp(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function hasPart(children: React.ReactNode, part: React.ElementType): boolean {
  let found = false;
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === part) found = true;
  });
  return found;
}

// ============================================
// Parts
// ============================================

function MessageContent({ children, className, ...htmlProps }: MessageContentProps) {
  const { from, status } = useMessageContext();
  const streaming = status === "streaming";
  const classes = [styles.content, className].filter(Boolean).join(" ");

  let body: React.ReactNode = children;
  if (typeof children === "string") {
    body =
      from === "assistant" ? (
        <Markdown content={children} streaming={streaming} />
      ) : (
        <span className={styles.text}>{children}</span>
      );
  }
  const caret = streaming && !(from === "assistant" && typeof children === "string");

  return (
    <div {...htmlProps} className={classes}>
      {body}
      {caret && <span className={styles.caret} aria-hidden="true" />}
    </div>
  );
}

function MessageActions({ children, className, ...htmlProps }: MessageActionsProps) {
  const classes = [styles.actions, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

function MessageTimestamp({
  date,
  format: customFormat,
  className,
  ...htmlProps
}: MessageTimestampProps) {
  const { status, timestamp } = useMessageContext();
  const classes = [styles.timestamp, className].filter(Boolean).join(" ");
  if (status === "pending") {
    return <span className={classes}>Sending…</span>;
  }
  const value = date ?? timestamp;
  if (!value) return null;
  return (
    <time {...htmlProps} className={classes} dateTime={value.toISOString()}>
      {customFormat ? customFormat(value) : formatTimestamp(value)}
    </time>
  );
}

function MessageAvatar({ src, alt = "", children, className, ...htmlProps }: MessageAvatarProps) {
  const [failed, setFailed] = React.useState(false);
  const classes = [styles.avatar, className].filter(Boolean).join(" ");
  return (
    <span {...htmlProps} className={classes}>
      {src && !failed ? (
        <img src={src} alt={alt} className={styles.avatarImage} onError={() => setFailed(true)} />
      ) : (
        children
      )}
    </span>
  );
}

function MessageError({
  children,
  onRetry,
  retryLabel = "Try again",
  actions,
  className,
  ...htmlProps
}: MessageErrorProps) {
  const context = useMessageContext();
  const retry = onRetry ?? context.onRetry;
  const words = children ?? (context.from === "user" ? "Not sent." : "This reply didn't finish.");
  const classes = [styles.error, className].filter(Boolean).join(" ");

  return (
    <div {...htmlProps} className={classes} role="alert">
      <span className={styles.errorIcon} aria-hidden="true">
        <Icon icon={WarningCircle} size="md" />
      </span>
      <p className={styles.errorWords}>{words}</p>
      {(retry || actions) && (
        <div className={styles.errorActions}>
          {retry && (
            <Button variant="soft" size="sm" onClick={retry}>
              {retryLabel}
            </Button>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}

// ============================================
// Root
// ============================================

function MessageRoot({
  from,
  children,
  status = "complete",
  timestamp,
  avatar,
  actions,
  onRetry,
  className,
  ...htmlProps
}: MessageProps) {
  const contextValue = React.useMemo<MessageContextValue>(
    () => ({ from, status, timestamp, onRetry }),
    [from, status, timestamp, onRetry]
  );
  const classes = [styles.message, className].filter(Boolean).join(" ");
  const showError = status === "error" && !hasPart(children, MessageError);
  const showMeta =
    (timestamp !== undefined || status === "pending") && !hasPart(children, MessageTimestamp);

  return (
    <MessageContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        className={classes}
        data-from={from}
        data-status={status}
        data-avatar={avatar ? "" : undefined}
        aria-busy={status === "streaming" || undefined}
      >
        {avatar}
        <div className={styles.body}>
          {children}
          {showError && <MessageError />}
          {(showMeta || actions) && (
            <div className={styles.meta}>
              {showMeta && <MessageTimestamp />}
              {actions && <MessageActions>{actions}</MessageActions>}
            </div>
          )}
        </div>
      </div>
    </MessageContext.Provider>
  );
}

// ============================================
// Export compound component
// ============================================

export const Message = Object.assign(MessageRoot, {
  Content: MessageContent,
  Actions: MessageActions,
  Timestamp: MessageTimestamp,
  Avatar: MessageAvatar,
  Error: MessageError,
});

export { useMessageContext };
