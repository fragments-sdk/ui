"use client";

import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import styles from "./Separator.module.scss";

// ============================================
// Types
// ============================================

export type SeparatorGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";

export interface SeparatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Orientation of the separator */
  orientation?: "horizontal" | "vertical";
  /** Breathing room around the rule
   * @default "none" */
  gap?: SeparatorGap;
  /** Softer visual appearance */
  soft?: boolean;
  /** Optional label text (creates a labeled divider) */
  label?: string;
}

// ============================================
// Gap class map
// ============================================

const GAP_CLASS: Record<SeparatorGap, string> = {
  none: styles.gapNone,
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
};

// ============================================
// Component
// ============================================

const SeparatorRoot = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  {
    orientation = "horizontal",
    gap = "none",
    soft = false,
    label,
    className,
    style,
    ...htmlProps
  },
  ref
) {
  // Labeled separator (horizontal only)
  if (label && orientation === "horizontal") {
    const classes = [
      styles.separator,
      styles.withLabel,
      GAP_CLASS[gap],
      soft && styles.soft,
      className,
    ]
      .filter(Boolean)
      .join(" ");

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
    orientation === "horizontal" ? styles.horizontal : styles.vertical,
    GAP_CLASS[gap],
    soft && styles.soft,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <BaseSeparator
      ref={ref}
      orientation={orientation}
      className={classes}
      style={style}
      {...htmlProps}
    >
      <span className={styles.line} aria-hidden="true" />
    </BaseSeparator>
  );
});

export const Separator = Object.assign(SeparatorRoot, {
  Root: SeparatorRoot,
});
