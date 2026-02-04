'use client';

import * as React from 'react';
import styles from './Message.module.scss';
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error';

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Message role determines styling and alignment */
  role: MessageRole;
  /** Message content */
  children: React.ReactNode;
  /** Message status */
  status?: MessageStatus;
  /** When the message was sent */
  timestamp?: Date;
  /** Custom avatar override */
  avatar?: React.ReactNode;
  /** Hover actions (copy, regenerate) */
  actions?: React.ReactNode;
}

export interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface MessageActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface MessageTimestampProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Date to format */
  date?: Date;
  /** Custom format function */
  format?: (date: Date) => string;
}

export interface MessageAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

// ============================================
// Context
// ============================================

interface MessageContextValue {
  role: MessageRole;
  status: MessageStatus;
  timestamp?: Date;
}

const MessageContext = React.createContext<MessageContextValue | null>(null);

function useMessageContext() {
  const context = React.useContext(MessageContext);
  if (!context) {
    throw new Error('Message compound components must be used within a Message');
  }
  return context;
}

// ============================================
// Helper Functions
// ============================================

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ============================================
// Icons
// ============================================

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function AssistantIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

// ============================================
// Sub-components
// ============================================

function MessageContent({ children, className, ...htmlProps }: MessageContentProps) {
  const { status } = useMessageContext();

  const classes = [
    styles.content,
    status === 'streaming' && styles.streaming,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

function MessageActions({ children, className, ...htmlProps }: MessageActionsProps) {
  const classes = [styles.actions, className].filter(Boolean).join(' ');

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
  const { timestamp } = useMessageContext();
  const dateToFormat = date ?? timestamp;

  if (!dateToFormat) return null;

  const formatted = customFormat ? customFormat(dateToFormat) : formatTimestamp(dateToFormat);

  const classes = [styles.timestamp, className].filter(Boolean).join(' ');

  return (
    <span {...htmlProps} className={classes}>
      {formatted}
    </span>
  );
}

function MessageAvatar({ children, className, ...htmlProps }: MessageAvatarProps) {
  const { role } = useMessageContext();

  const classes = [
    styles.avatar,
    styles[`avatar${role.charAt(0).toUpperCase() + role.slice(1)}`],
    className,
  ].filter(Boolean).join(' ');

  const defaultIcon = role === 'user'
    ? <UserIcon />
    : role === 'assistant'
      ? <AssistantIcon />
      : <SystemIcon />;

  return (
    <div {...htmlProps} className={classes}>
      {children ?? defaultIcon}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

function MessageRoot({
  role,
  children,
  status = 'complete',
  timestamp,
  avatar,
  actions,
  className,
  ...htmlProps
}: MessageProps) {
  const contextValue: MessageContextValue = {
    role,
    status,
    timestamp,
  };

  const classes = [
    styles.message,
    styles[role],
    status === 'error' && styles.error,
    status === 'sending' && styles.sending,
    className,
  ].filter(Boolean).join(' ');

  return (
    <MessageContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        className={classes}
        data-role={role}
        data-status={status}
      >
        {avatar !== undefined ? avatar : <MessageAvatar />}
        <div className={styles.body}>
          {children}
          {actions && <MessageActions>{actions}</MessageActions>}
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
});

export {
  MessageRoot,
  MessageContent,
  MessageActions,
  MessageTimestamp,
  MessageAvatar,
};

export { useMessageContext };
