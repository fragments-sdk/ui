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
  onPause,
  onResume,
  className,
  ...htmlProps
}: ToastProps & {
  id?: string;
  onPause?: () => void;
  onResume?: () => void;
}) {
  const Icon = variantIcons[variant];
  const uniqueId = React.useId();
  const toastRef = React.useRef<HTMLDivElement>(null);
  const titleId = title ? `toast-title-${id || uniqueId}` : undefined;
  const descId = description ? `toast-desc-${id || uniqueId}` : undefined;
  const liveRole = variant === 'error' || variant === 'warning' ? 'alert' : 'status';

  const toastClasses = [
    styles.toast,
    styles[variant],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={toastRef}
      {...htmlProps}
      className={toastClasses}
      role={liveRole}
      aria-atomic="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onMouseEnter={onPause}
      onMouseLeave={() => {
        requestAnimationFrame(() => {
          if (!toastRef.current?.contains(document.activeElement)) {
            onResume?.();
          }
        });
      }}
      onFocusCapture={onPause}
      onBlurCapture={() => {
        requestAnimationFrame(() => {
          if (!toastRef.current?.contains(document.activeElement)) {
            onResume?.();
          }
        });
      }}
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
  onPause,
  onResume,
}: {
  toasts: ToastData[];
  position: ToastPosition;
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}) {
  const containerClasses = [
    styles.container,
    styles[position.replace('-', '')],
  ].filter(Boolean).join(' ');

  // Always render the container for screen reader live region to work properly
  // The live region must exist before announcements are made
  return (
    <div className={containerClasses} role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onDismiss={() => onDismiss(toast.id)}
          onPause={() => onPause(toast.id)}
          onResume={() => onResume(toast.id)}
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
  duration = 8000,
  max = 5,
  children,
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);
  const timeoutRef = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const remainingRef = React.useRef(new Map<string, number>());
  const startTimeRef = React.useRef(new Map<string, number>());

  const clearRemovalTimer = React.useCallback((id: string) => {
    const timeout = timeoutRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRef.current.delete(id);
    }
  }, []);

  const scheduleRemoval = React.useCallback(
    (id: string, delay: number) => {
      if (delay <= 0) return;
      clearRemovalTimer(id);
      remainingRef.current.set(id, delay);
      startTimeRef.current.set(id, Date.now());

      const timeout = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        clearRemovalTimer(id);
        remainingRef.current.delete(id);
        startTimeRef.current.delete(id);
      }, delay);

      timeoutRef.current.set(id, timeout);
    },
    [clearRemovalTimer]
  );

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${++toastCounter}`;
    const toastDuration = toast.duration ?? (toast.action ? 0 : duration);

    setToasts((prev) => {
      const nextToasts = [...prev, { ...toast, id }];
      const overflowCount = Math.max(0, nextToasts.length - max);

      if (overflowCount > 0) {
        const removedToasts = nextToasts.slice(0, overflowCount);
        removedToasts.forEach((removedToast) => {
          clearRemovalTimer(removedToast.id);
          remainingRef.current.delete(removedToast.id);
          startTimeRef.current.delete(removedToast.id);
        });
      }

      return overflowCount > 0 ? nextToasts.slice(overflowCount) : nextToasts;
    });

    // Auto-dismiss
    if (toastDuration > 0) {
      scheduleRemoval(id, toastDuration);
    }

    return id;
  }, [clearRemovalTimer, duration, max, scheduleRemoval]);

  const removeToast = React.useCallback((id: string) => {
    clearRemovalTimer(id);
    remainingRef.current.delete(id);
    startTimeRef.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, [clearRemovalTimer]);

  const pauseToast = React.useCallback((id: string) => {
    const remaining = remainingRef.current.get(id);
    if (remaining === undefined) return;

    const startedAt = startTimeRef.current.get(id);
    if (startedAt) {
      const elapsed = Date.now() - startedAt;
      remainingRef.current.set(id, Math.max(remaining - elapsed, 0));
    }
    clearRemovalTimer(id);
  }, [clearRemovalTimer]);

  const resumeToast = React.useCallback((id: string) => {
    const remaining = remainingRef.current.get(id);
    if (remaining === undefined || remaining <= 0) return;
    scheduleRemoval(id, remaining);
  }, [scheduleRemoval]);

  const clearToasts = React.useCallback(() => {
    timeoutRef.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    timeoutRef.current.clear();
    remainingRef.current.clear();
    startTimeRef.current.clear();
    setToasts([]);
  }, []);

  React.useEffect(
    () => () => {
      timeoutRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      timeoutRef.current.clear();
      remainingRef.current.clear();
      startTimeRef.current.clear();
    },
    []
  );

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
        onPause={pauseToast}
        onResume={resumeToast}
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
