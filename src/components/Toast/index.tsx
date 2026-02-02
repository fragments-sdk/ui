import * as React from 'react';
import styles from './Toast.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProps extends Omit<ToastData, 'id'>, Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Callback when toast should be dismissed */
  onDismiss?: () => void;
}

export interface ToastProviderProps {
  /** Position of the toast container */
  position?: ToastPosition;
  /** Default duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Maximum number of toasts to show */
  max?: number;
  /** Children */
  children: React.ReactNode;
}

// ============================================
// Context
// ============================================

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

// ============================================
// Hook to use toast
// ============================================

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const toast = React.useCallback((options: Omit<ToastData, 'id'>) => {
    return context.addToast(options);
  }, [context]);

  const success = React.useCallback((title: string, description?: string) => {
    return context.addToast({ title, description, variant: 'success' });
  }, [context]);

  const error = React.useCallback((title: string, description?: string) => {
    return context.addToast({ title, description, variant: 'error' });
  }, [context]);

  const warning = React.useCallback((title: string, description?: string) => {
    return context.addToast({ title, description, variant: 'warning' });
  }, [context]);

  const info = React.useCallback((title: string, description?: string) => {
    return context.addToast({ title, description, variant: 'info' });
  }, [context]);

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss: context.removeToast,
    dismissAll: context.clearToasts,
  };
}

// ============================================
// Icons
// ============================================

function SuccessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const variantIcons: Record<ToastVariant, React.ComponentType | null> = {
  default: null,
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

// ============================================
// Toast Component
// ============================================

function ToastItem({
  id,
  title,
  description,
  variant = 'default',
  action,
  onDismiss,
  className,
  ...htmlProps
}: ToastProps & { id?: string }) {
  const Icon = variantIcons[variant];
  const uniqueId = React.useId();
  const titleId = title ? `toast-title-${id || uniqueId}` : undefined;
  const descId = description ? `toast-desc-${id || uniqueId}` : undefined;

  const toastClasses = [
    styles.toast,
    styles[variant],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      {...htmlProps}
      className={toastClasses}
      role="alert"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      {Icon && (
        <span className={styles.icon}>
          <Icon />
        </span>
      )}
      <div className={styles.content}>
        {title && <div id={titleId} className={styles.title}>{title}</div>}
        {description && <div id={descId} className={styles.description}>{description}</div>}
      </div>
      {action && (
        <button
          type="button"
          className={styles.action}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          className={styles.close}
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

// ============================================
// Toast Container
// ============================================

function ToastContainer({
  toasts,
  position,
  onDismiss,
}: {
  toasts: ToastData[];
  position: ToastPosition;
  onDismiss: (id: string) => void;
}) {
  const containerClasses = [
    styles.container,
    styles[position.replace('-', '')],
  ].filter(Boolean).join(' ');

  // Always render the container for screen reader live region to work properly
  // The live region must exist before announcements are made
  return (
    <div
      className={containerClasses}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

// ============================================
// Toast Provider
// ============================================

let toastCounter = 0;

export function ToastProvider({
  position = 'bottom-right',
  duration = 5000,
  max = 5,
  children,
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${++toastCounter}`;
    const toastDuration = toast.duration ?? duration;

    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id }];
      // Limit to max toasts
      return newToasts.slice(-max);
    });

    // Auto-dismiss
    if (toastDuration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toastDuration);
    }

    return id;
  }, [duration, max]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast, clearToasts }),
    [toasts, addToast, removeToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        position={position}
        onDismiss={removeToast}
      />
    </ToastContext.Provider>
  );
}

// ============================================
// Export Toast as compound component
// ============================================

export const Toast = Object.assign(ToastItem, {
  Provider: ToastProvider,
});
