"use client";

import * as React from "react";
import { Alert } from "../../components/Alert";
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import styles from "./ActivityFeed.module.scss";

// ============================================
// Types
// ============================================

export interface ActivityFeedItem {
  /** Unique identifier for the activity */
  id: string;
  /** User who performed the action */
  user: string;
  /** Description of the action */
  action: string;
  /** Formatted timestamp string, as shown */
  time: string;
  /** Machine-readable timestamp for the `<time>` element */
  dateTime?: string;
  /** Avatar image URL */
  avatar?: string;
  /** Fallback initials for the avatar */
  initials?: string;
}

export interface ActivityFeedProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** List of activity items to display */
  items: ActivityFeedItem[];
  /** Card title
   * @default "Recent activity" */
  title?: string;
  /** Shows skeleton rows in the loaded shape */
  loading?: boolean;
  /** Replaces the list with a danger alert holding this message */
  error?: React.ReactNode;
  /** Offers Retry on the error alert */
  onRetry?: () => void;
  /** Rows shown before "Show more"
   * @default 5 */
  limit?: number;
  /** Words under the empty state title */
  emptyMessage?: React.ReactNode;
}

const DEFAULT_LIMIT = 5;
const SKELETON_ROWS = 3;

// ============================================
// Component
// ============================================

export const ActivityFeed = React.forwardRef<HTMLDivElement, ActivityFeedProps>(
  function ActivityFeed(
    {
      items,
      title = "Recent activity",
      loading = false,
      error,
      onRetry,
      limit = DEFAULT_LIMIT,
      emptyMessage = "Actions people take show up here.",
      className,
      ...htmlProps
    },
    ref
  ) {
    const [expanded, setExpanded] = React.useState(false);
    const shown = expanded ? items : items.slice(0, limit);
    const hidden = items.length - shown.length;

    let body: React.ReactNode;
    if (error) {
      body = (
        <Alert tone="danger">
          <Alert.Icon />
          <Alert.Body>
            <Alert.Content>{error}</Alert.Content>
            {onRetry && (
              <Alert.Actions>
                <Alert.Action onClick={onRetry}>Retry</Alert.Action>
              </Alert.Actions>
            )}
          </Alert.Body>
        </Alert>
      );
    } else if (loading) {
      body = (
        <ul className={styles.list} aria-busy="true" aria-label="Loading activity">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <li key={index} className={styles.row}>
              <Skeleton shape="rect" className={styles.avatarSkeleton} />
              <div className={styles.text}>
                <Skeleton shape="text" width="70%" />
                <Skeleton shape="text" width="30%" />
              </div>
            </li>
          ))}
        </ul>
      );
    } else if (items.length === 0) {
      body = (
        <EmptyState size="sm">
          <EmptyState.Title as="p">No activity yet</EmptyState.Title>
          <EmptyState.Description>{emptyMessage}</EmptyState.Description>
        </EmptyState>
      );
    } else {
      body = (
        <>
          <ul className={styles.list}>
            {shown.map((item) => (
              <li key={item.id} className={styles.row}>
                <Avatar src={item.avatar} name={item.user} initials={item.initials} size="xs" />
                <div className={styles.text}>
                  <p className={styles.line}>
                    <span className={styles.actor}>{item.user}</span> {item.action}
                  </p>
                  <time className={styles.time} dateTime={item.dateTime}>
                    {item.time}
                  </time>
                </div>
              </li>
            ))}
          </ul>
          {items.length > limit && (
            <div className={styles.more}>
              <Button variant="ghost" size="sm" onClick={() => setExpanded((open) => !open)}>
                {expanded ? "Show less" : `Show ${hidden} more`}
              </Button>
            </div>
          )}
        </>
      );
    }

    return (
      <div ref={ref} {...htmlProps} className={[styles.root, className].filter(Boolean).join(" ")}>
        <Card>
          <Card.Header>
            <Card.Title>{title}</Card.Title>
          </Card.Header>
          <Card.Body>{body}</Card.Body>
        </Card>
      </div>
    );
  }
);
