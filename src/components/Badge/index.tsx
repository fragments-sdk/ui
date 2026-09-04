"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import styles from "./Badge.module.scss";

/**
 * Badge for status indicators, labels, and counts.
 * @see https://usefragments.com/components/badge
 */
export type BadgeVariant = "soft" | "outline" | "ghost";
export type BadgeTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** Chrome family.
   *
   * - `soft` (default): tinted pill for tags, counts, or state.
   * - `outline`: hairline-bordered, transparent — metadata pills inside
   *   dense rows. Pair with `dotColor`.
   * - `ghost`: transparent filter-pill chrome for toolbar filters. Pair with
   *   `active` to mark the selected one.
   * @default "soft"
   * @see https://usefragments.com/components/badge#variants */
  variant?: BadgeVariant;
  /** Colour. `neutral` is the plain badge; the semantic tones paint the
   * shared status ramp.
   * @default "neutral" */
  tone?: BadgeTone;
  /** Badge size.
   * @default "md" */
  size?: "sm" | "md" | "lg";
  /** Show a status dot before the label */
  dot?: boolean;
  /** Breathe the status dot, for a state that is still happening rather than
   * one that has settled. Respects `prefers-reduced-motion`. */
  dotPulse?: boolean;
  /** Color for the leading status dot. Accepts any CSS color including CSS
   * custom properties. */
  dotColor?: string;
  /** Icon element rendered before the label */
  icon?: React.ReactNode;
  /** Marks `variant="ghost"` as the currently selected filter. Has no effect
   * on other variants. */
  active?: boolean;
  /** Makes the badge removable. Called when dismiss button is clicked. */
  onRemove?: () => void;
  /** Announce badge content as status to assistive tech (opt-in).
   * @default false */
  announce?: boolean;
}

const TONE_CLASS: Record<BadgeTone, string | undefined> = {
  neutral: undefined,
  accent: styles.toneAccent,
  info: styles.toneInfo,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
};

const BadgeRoot = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    children,
    variant = "soft",
    tone = "neutral",
    size = "md",
    dot = false,
    dotPulse = false,
    dotColor,
    icon,
    active = false,
    onRemove,
    announce = false,
    className,
    style,
    "aria-label": ariaLabel,
    role,
    ...htmlProps
  },
  ref
) {
  const classes = [
    styles.badge,
    styles[size],
    styles[variant],
    TONE_CLASS[tone],
    active && variant === "ghost" && styles.active,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const resolvedStyle = dotColor
    ? ({ ...style, "--fui-badge-dot-color": dotColor } as React.CSSProperties)
    : style;

  // For status badges, include the status in the aria-label if not provided
  const effectiveAriaLabel =
    ariaLabel ||
    (announce && tone !== "neutral"
      ? `${tone}: ${typeof children === "string" ? children : ""}`
      : undefined);

  return (
    <span
      ref={ref}
      {...htmlProps}
      className={classes}
      style={resolvedStyle}
      role={role ?? (announce ? "status" : undefined)}
      aria-label={effectiveAriaLabel}
    >
      {dot && (
        <span
          className={[styles.dot, dotPulse && styles.dotPulse].filter(Boolean).join(" ")}
          aria-hidden="true"
        />
      )}
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {onRemove && (
        <BaseButton
          onClick={onRemove}
          aria-label={`Remove ${typeof children === "string" ? children : "badge"}`}
          className={styles.remove}
        >
          &times;
        </BaseButton>
      )}
    </span>
  );
});

export const Badge = Object.assign(BadgeRoot, {
  Root: BadgeRoot,
});
