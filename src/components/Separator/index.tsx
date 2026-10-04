import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import styles from "./Separator.module.scss";

// ============================================
// Types
// ============================================

export type SeparatorOrientation = "horizontal" | "vertical";

/**
 * How far a vertical rule runs. `full` stretches across the parent's cross
 * axis; `control` stops at the compact control height with a small margin on
 * each side, the toolbar divider.
 */
export type SeparatorLength = "full" | "control";

export interface SeparatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Direction of the rule
   * @default "horizontal" */
  orientation?: SeparatorOrientation;
  /** How far a vertical rule runs; ignored on horizontal rules
   * @default "full" */
  length?: SeparatorLength;
  /** Words that sit between two horizontal rules. The label is a sibling of
   * the rule, never inside it. */
  label?: React.ReactNode;
}

// ============================================
// Component
// ============================================

const SeparatorRoot = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = "horizontal", length = "full", label, className, ...htmlProps },
  ref
) {
  if (label != null && label !== false && orientation === "horizontal") {
    return (
      <div
        ref={ref}
        className={[styles.labelled, className].filter(Boolean).join(" ")}
        {...htmlProps}
      >
        <BaseSeparator orientation="horizontal" className={styles.rule} />
        <span className={styles.label}>{label}</span>
        <span className={styles.rule} aria-hidden="true" />
      </div>
    );
  }

  const classes = [
    styles.rule,
    orientation === "vertical" ? styles.vertical : styles.horizontal,
    orientation === "vertical" && length === "control" && styles.control,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <BaseSeparator ref={ref} orientation={orientation} className={classes} {...htmlProps} />;
});

export const Separator = Object.assign(SeparatorRoot, {
  Root: SeparatorRoot,
});
