import * as React from "react";
import styles from "./EmptyState.module.scss";

// ============================================
// Types
// ============================================

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Padding only: `sm` for a panel or a table body, `md` for a page region.
   * Type and icon never change with size. The state always sits inside
   * whatever already frames it, so it draws no frame of its own.
   * @default "md" */
  size?: "sm" | "md";
}

export interface EmptyStateIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface EmptyStateTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  /** Heading level follows the surrounding outline: `h2` for a page-level
   * state, `h3` under a section heading. Defaults to `h3`. */
  as?: "h2" | "h3" | "h4" | "p";
}

export interface EmptyStateDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export interface EmptyStateActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ============================================
// Components
// ============================================

function EmptyStateRoot({ children, size = "md", className, ...htmlProps }: EmptyStateProps) {
  const classes = [styles.emptyState, styles[size], className].filter(Boolean).join(" ");

  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

function EmptyStateIcon({ children, className, ...htmlProps }: EmptyStateIconProps) {
  const classes = [styles.icon, className].filter(Boolean).join(" ");
  return (
    <div aria-hidden="true" {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

function EmptyStateTitle({
  children,
  className,
  as: Component = "h3",
  ...htmlProps
}: EmptyStateTitleProps) {
  const classes = [styles.title, className].filter(Boolean).join(" ");
  return (
    <Component {...htmlProps} className={classes}>
      {children}
    </Component>
  );
}

function EmptyStateDescription({ children, className, ...htmlProps }: EmptyStateDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(" ");
  return (
    <p {...htmlProps} className={classes}>
      {children}
    </p>
  );
}

function EmptyStateActions({ children, className, ...htmlProps }: EmptyStateActionsProps) {
  const classes = [styles.actions, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

// ============================================
// Export compound component
// ============================================

export const EmptyState = Object.assign(EmptyStateRoot, {
  Icon: EmptyStateIcon,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Actions: EmptyStateActions,
});
