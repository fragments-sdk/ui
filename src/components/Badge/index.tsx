"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { X } from "@phosphor-icons/react";
import styles from "./Badge.module.scss";

/**
 * Badge labels a status, a count or a category: one 20px step, the indicator
 * corner, the tone's soft fill and ink.
 * @see https://usefragments.com/components/badge
 */
export type BadgeTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** Colour. `neutral` is the band with secondary ink; the semantic tones
   * paint the tone's soft fill and ink.
   * @default "neutral" */
  tone?: BadgeTone;
  /** A status dot in the tone's ink before the label. The words still carry
   * the meaning. */
  dot?: boolean;
  /** Icon element rendered before the label */
  icon?: React.ReactNode;
  /** Makes the badge removable. Called when the remove button is pressed.
   * For tags the user added, never for system labels. */
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
    tone = "neutral",
    dot = false,
    icon,
    onRemove,
    announce = false,
    className,
    "aria-label": ariaLabel,
    role,
    ...htmlProps
  },
  ref
) {
  const classes = [styles.badge, TONE_CLASS[tone], className].filter(Boolean).join(" ");
  const text = typeof children === "string" ? children : undefined;

  // An announced status names its tone, so the change is heard, not only seen.
  const effectiveAriaLabel =
    ariaLabel || (announce && tone !== "neutral" && text ? `${tone}: ${text}` : undefined);

  return (
    <span
      ref={ref}
      {...htmlProps}
      className={classes}
      role={role ?? (announce ? "status" : undefined)}
      aria-label={effectiveAriaLabel}
    >
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {onRemove && (
        <BaseButton
          onClick={onRemove}
          aria-label={`Remove ${text ?? "badge"}`}
          className={styles.remove}
        >
          <X aria-hidden="true" weight="bold" />
        </BaseButton>
      )}
    </span>
  );
});

export const Badge = Object.assign(BadgeRoot, {
  Root: BadgeRoot,
});
