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
   *
   * - `default` / semantic / `outline`: pill-shaped status badges for
   *   tags, counts, or state.
   * - `label`: small hairline-bordered label (20px tall, 5px radius) for
   *   metadata pills inside dense dashboard rows. Pair with `dotColor`.
   * - `dim`: transparent filter-pill chrome (24px tall, 5px radius) used
   *   for toolbar filter chips. Pair with `active` to mark the selected one.
   * @default "default"
   * @see https://usefragments.com/components/badge#variants */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'label' | 'dim';
  /** Badge size.
   * @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Show a status dot before the label */
  dot?: boolean;
  /** Color for the leading status dot. Applies to `variant="label"` (and the
   * generic `dot` prop). Accepts any CSS color including CSS custom properties. */
  dotColor?: string;
  /** Icon element rendered before the label */
  icon?: React.ReactNode;
  /** Marks `variant="dim"` as the currently selected filter. Has no effect on
   * other variants. */
  active?: boolean;
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
      dotColor,
      icon,
      active = false,
      onRemove,
      announce = false,
      className,
      style,
      'aria-label': ariaLabel,
      role,
      ...htmlProps
    },
    ref
  ) {
    const classes = [
      styles.badge,
      styles[size],
      styles[variant],
      active && variant === 'dim' && styles.active,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const resolvedStyle = dotColor
      ? ({ ...style, '--fui-badge-dot-color': dotColor } as React.CSSProperties)
      : style;

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
        style={resolvedStyle}
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
