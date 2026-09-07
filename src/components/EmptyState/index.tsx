"use client";

import * as React from "react";
import styles from "./EmptyState.module.scss";

// ============================================
// Types
// ============================================

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Chrome. `outline` draws the dashed hairline that marks a reserved-but-empty
   * region. Default `ghost` keeps the state inside whatever already frames it
   * (a Card, a table body) so the frame is never doubled.
   * @default "ghost" */
  variant?: "ghost" | "outline";
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
// Context
// ============================================

interface EmptyStateContextValue {
  size: "sm" | "md" | "lg";
}

const EmptyStateContext = React.createContext<EmptyStateContextValue | null>(null);

function useEmptyStateContext() {
  const context = React.useContext(EmptyStateContext);
  if (!context) {
    throw new Error("EmptyState compound components must be used within an EmptyState");
  }
  return context;
}

// ============================================
// Components
// ============================================

function EmptyStateRoot({
  children,
  size = "md",
  variant = "ghost",
  className,
  ...htmlProps
}: EmptyStateProps) {
  const classes = [
    styles.emptyState,
    styles[size],
    variant === "outline" ? styles.outline : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contextValue: EmptyStateContextValue = { size };

  return (
    <EmptyStateContext.Provider value={contextValue}>
      <div {...htmlProps} className={classes}>
        {children}
      </div>
    </EmptyStateContext.Provider>
  );
}

function EmptyStateIcon({ children, className, ...htmlProps }: EmptyStateIconProps) {
  const classes = [styles.icon, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} className={classes}>
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

// Re-export individual components for tree-shaking
export {
  EmptyStateRoot,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  useEmptyStateContext,
};
