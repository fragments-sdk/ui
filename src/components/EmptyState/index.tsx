import * as React from 'react';
import styles from './EmptyState.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export interface EmptyStateIconProps {
  children: React.ReactNode;
  className?: string;
}

export interface EmptyStateTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface EmptyStateDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export interface EmptyStateActionsProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================
// Context
// ============================================

interface EmptyStateContextValue {
  size: 'sm' | 'md' | 'lg';
}

const EmptyStateContext = React.createContext<EmptyStateContextValue | null>(null);

function useEmptyStateContext() {
  const context = React.useContext(EmptyStateContext);
  if (!context) {
    throw new Error('EmptyState compound components must be used within an EmptyState');
  }
  return context;
}

// ============================================
// Components
// ============================================

function EmptyStateRoot({
  children,
  size = 'md',
  className,
  ...htmlProps
}: EmptyStateProps) {
  const classes = [styles.emptyState, styles[size], className]
    .filter(Boolean)
    .join(' ');

  const contextValue: EmptyStateContextValue = { size };

  return (
    <EmptyStateContext.Provider value={contextValue}>
      <div {...htmlProps} className={classes}>{children}</div>
    </EmptyStateContext.Provider>
  );
}

function EmptyStateIcon({ children, className }: EmptyStateIconProps) {
  const classes = [styles.icon, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

function EmptyStateTitle({ children, className }: EmptyStateTitleProps) {
  const classes = [styles.title, className].filter(Boolean).join(' ');
  return <h3 className={classes}>{children}</h3>;
}

function EmptyStateDescription({ children, className }: EmptyStateDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(' ');
  return <p className={classes}>{children}</p>;
}

function EmptyStateActions({ children, className }: EmptyStateActionsProps) {
  const classes = [styles.actions, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
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
