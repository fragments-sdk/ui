'use client';

import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import styles from './Badge.module.scss';

/**
 * Badge for status indicators, labels, and counts.
 * @see https://usefragments.com/components/badge
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** Visual style variant.
   * @default "default"
   * @see https://usefragments.com/components/badge#variants */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  /** Badge size.
   * @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Show a status dot before the label */
  dot?: boolean;
  /** Icon element rendered before the label */
  icon?: React.ReactNode;
  /** Makes the badge removable. Called when dismiss button is clicked. */
  onRemove?: () => void;
  /** Announce badge content as status to assistive tech (opt-in).
   * @default false */
  announce?: boolean;
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
      announce = false,
      className,
      'aria-label': ariaLabel,
      role,
      ...htmlProps
    },
    ref
  ) {
    const classes = [styles.badge, styles[size], styles[variant], className]
      .filter(Boolean)
      .join(' ');

    // For status badges, include the status in the aria-label if not provided
    const effectiveAriaLabel = ariaLabel || (
      announce && variant !== 'default' && variant !== 'outline'
        ? `${variant}: ${typeof children === 'string' ? children : ''}`
        : undefined
    );

    return (
      <span
        ref={ref}
        {...htmlProps}
        className={classes}
        role={role ?? (announce ? 'status' : undefined)}
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
