'use client';

import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import styles from './Alert.module.scss';

// ============================================
// Types
// ============================================

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  severity?: AlertSeverity;
}

export interface AlertIconProps {
  children?: React.ReactNode;
  className?: string;
}

export interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface AlertContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface AlertActionsProps {
  children: React.ReactNode;
  className?: string;
}

export interface AlertActionProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export interface AlertCloseProps {
  children?: React.ReactNode;
  className?: string;
}

export interface AlertBodyProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================
// Context
// ============================================

interface AlertContextValue {
  severity: AlertSeverity;
  titleId: string;
  descId: string;
  dismiss: () => void;
}

const AlertContext = React.createContext<AlertContextValue | null>(null);

function useAlertContext() {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('Alert compound components must be used within an Alert');
  }
  return context;
}

// ============================================
// Severity Icons
// ============================================

const severityIcons: Record<AlertSeverity, string> = {
  info: 'i',
  success: '\u2713',
  warning: '!',
  error: '\u2717',
};

// ============================================
// Components
// ============================================

function AlertRoot({
  children,
  severity = 'info',
  className,
  ...htmlProps
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false);
  const titleId = React.useId();
  const descId = React.useId();

  const dismiss = React.useCallback(() => {
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  const classes = [styles.alert, styles[severity], className]
    .filter(Boolean)
    .join(' ');

  const contextValue: AlertContextValue = {
    severity,
    titleId,
    descId,
    dismiss,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        role="alert"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={classes}
      >
        {children}
      </div>
    </AlertContext.Provider>
  );
}

function AlertIcon({ children, className }: AlertIconProps) {
  const { severity } = useAlertContext();
  const classes = [styles.icon, className].filter(Boolean).join(' ');

  return (
    <span className={classes} aria-hidden="true">
      {children ?? severityIcons[severity]}
    </span>
  );
}

function AlertBody({ children, className }: AlertBodyProps) {
  const classes = [styles.body, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

function AlertTitle({ children, className }: AlertTitleProps) {
  const { titleId } = useAlertContext();
  const classes = [styles.title, className].filter(Boolean).join(' ');
  return (
    <div id={titleId} className={classes}>
      {children}
    </div>
  );
}

function AlertContent({ children, className }: AlertContentProps) {
  const { descId } = useAlertContext();
  const classes = [styles.content, className].filter(Boolean).join(' ');
  return (
    <div id={descId} className={classes}>
      {children}
    </div>
  );
}

function AlertActions({ children, className }: AlertActionsProps) {
  const classes = [styles.actions, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

function AlertAction({ children, onClick, className }: AlertActionProps) {
  const classes = [styles.action, className].filter(Boolean).join(' ');
  return (
    <BaseButton onClick={onClick} className={classes}>
      {children}
    </BaseButton>
  );
}

function AlertClose({ children, className }: AlertCloseProps) {
  const { dismiss } = useAlertContext();
  const classes = [styles.close, className].filter(Boolean).join(' ');

  return (
    <BaseButton
      onClick={dismiss}
      aria-label="Dismiss alert"
      className={classes}
    >
      {children ?? '\u00D7'}
    </BaseButton>
  );
}

// ============================================
// Export compound component
// ============================================

export const Alert = Object.assign(AlertRoot, {
  Icon: AlertIcon,
  Body: AlertBody,
  Title: AlertTitle,
  Content: AlertContent,
  Actions: AlertActions,
  Action: AlertAction,
  Close: AlertClose,
});

// Re-export individual components for tree-shaking
export {
  AlertRoot,
  AlertIcon,
  AlertBody,
  AlertTitle,
  AlertContent,
  AlertActions,
  AlertAction,
  AlertClose,
  useAlertContext,
};
