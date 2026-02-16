'use client';

import * as React from 'react';
import { Card } from '../../components/Card';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { Avatar } from '../../components/Avatar';

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
  /** Formatted timestamp string */
  time: string;
  /** Avatar image URL */
  avatar?: string;
  /** Fallback initials for the avatar */
  initials?: string;
}

export interface ActivityFeedProps {
  /** List of activity items to display */
  items: ActivityFeedItem[];
  /** Optional title for the card header */
  title?: string;
  /** Additional CSS class name */
  className?: string;
}

// ============================================
// Component
// ============================================

export const ActivityFeed = React.forwardRef<HTMLDivElement, ActivityFeedProps>(
  function ActivityFeed({ items, title = 'Recent Activity', className }, ref) {
    return (
      <Card className={className}>
        <Card.Header>
          <Card.Title>{title}</Card.Title>
        </Card.Header>
        <Card.Body>
          <div ref={ref}>
            <Stack gap="sm">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: 'var(--fui-space-3)',
                    alignItems: 'flex-start',
                    paddingBottom:
                      index < items.length - 1
                        ? 'var(--fui-space-3)'
                        : undefined,
                    borderBottom:
                      index < items.length - 1
                        ? '1px solid var(--fui-border)'
                        : undefined,
                  }}
                >
                  <Avatar
                    src={item.avatar}
                    name={item.user}
                    initials={item.initials}
                    size="sm"
                  />
                  <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm">
                      <Text as="span" weight="medium">
                        {item.user}
                      </Text>{' '}
                      {item.action}
                    </Text>
                    <Text size="xs" color="tertiary">
                      {item.time}
                    </Text>
                  </Stack>
                </div>
              ))}
              {items.length === 0 && (
                <Text size="sm" color="tertiary">
                  No recent activity.
                </Text>
              )}
            </Stack>
          </div>
        </Card.Body>
      </Card>
    );
  }
);
