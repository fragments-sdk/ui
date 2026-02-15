'use client';

import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import styles from './Badge.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

const BadgeRoot = React.forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(
    {
      children,
      variant = 'default',
      size = 'md',
      dot = false,
      icon,
      onRemove,
      className,
      'aria-label': ariaLabel,
      ...htmlProps
    },
    ref
  ) {
    const classes = [styles.badge, styles[size], styles[variant], className]
      .filter(Boolean)
      .join(' ');

    // For status badges, include the status in the aria-label if not provided
    const effectiveAriaLabel = ariaLabel || (
      variant !== 'default' && variant !== 'outline'
        ? `${variant}: ${typeof children === 'string' ? children : ''}`
        : undefined
    );

    return (
      <span
        ref={ref}
        {...htmlProps}
        className={classes}
        role={effectiveAriaLabel ? 'status' : undefined}
        aria-label={effectiveAriaLabel}
      >
        {dot && <span className={styles.dot} aria-hidden="true" />}
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <span>{children}</span>
        {onRemove && (
          <BaseButton
            onClick={onRemove}
            aria-label={`Remove ${typeof children === 'string' ? children : 'badge'}`}
            className={styles.remove}
          >
            &times;
          </BaseButton>
        )}
      </span>
    );
  }
);

export const Badge = Object.assign(BadgeRoot, {
  Root: BadgeRoot,
});
