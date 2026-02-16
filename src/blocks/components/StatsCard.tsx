'use client';

import * as React from 'react';
import { Card } from '../../components/Card';
import { Stack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { Badge } from '../../components/Badge';

// ============================================
// Types
// ============================================

export interface StatsCardProps {
  /** Metric label displayed above the value */
  title: string;
  /** The primary metric value */
  value: string | number;
  /** Change indicator text (e.g., "+12.5%") */
  change?: string;
  /** Semantic variant for the change badge */
  changeVariant?: 'success' | 'warning' | 'error';
  /** Optional icon rendered in the top-right corner */
  icon?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
}

// ============================================
// Component
// ============================================

export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  function StatsCard(
    { title, value, change, changeVariant = 'success', icon, className },
    ref
  ) {
    return (
      <Card className={className}>
        <Card.Body>
          <div ref={ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Stack gap="xs">
              <Text size="sm" color="tertiary">
                {title}
              </Text>
              <Text as="p" size="2xl" weight="semibold">
                {value}
              </Text>
              {change && (
                <Stack direction="row" gap="xs" align="center">
                  <Badge variant={changeVariant} size="sm">
                    {change}
                  </Badge>
                </Stack>
              )}
            </Stack>
            {icon && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--fui-radius-md)',
                  backgroundColor: 'var(--fui-bg-secondary)',
                  color: 'var(--fui-text-secondary)',
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  }
);
