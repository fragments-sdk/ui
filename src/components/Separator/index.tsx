import * as React from 'react';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import styles from './Separator.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface SeparatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Orientation of the separator */
  orientation?: 'horizontal' | 'vertical';
  /** Spacing around the separator */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Softer visual appearance */
  soft?: boolean;
  /** Optional label text (creates a labeled divider) */
  label?: string;
}

// ============================================
// Spacing class map
// ============================================

const spacingClasses = {
  none: styles.spacingNone,
  sm: styles.spacingSm,
  md: styles.spacingMd,
  lg: styles.spacingLg,
};

// ============================================
// Component
// ============================================

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    {
      orientation = 'horizontal',
      spacing = 'none',
      soft = false,
      label,
      className,
      style,
      ...htmlProps
    },
    ref
  ) {
    // Labeled separator (horizontal only)
    if (label && orientation === 'horizontal') {
      const classes = [
        styles.separator,
        styles.withLabel,
        spacingClasses[spacing],
        soft && styles.soft,
        className,
      ].filter(Boolean).join(' ');

      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="horizontal"
          className={classes}
          style={style}
          {...htmlProps}
        >
          <span className={styles.label}>{label}</span>
        </div>
      );
    }

    // Standard separator
    const classes = [
      styles.separator,
      orientation === 'horizontal' ? styles.horizontal : styles.vertical,
      spacingClasses[spacing],
      soft && styles.soft,
      className,
    ].filter(Boolean).join(' ');

    return (
      <BaseSeparator
        ref={ref}
        orientation={orientation}
        className={classes}
        style={style}
        {...htmlProps}
      />
    );
  }
);
