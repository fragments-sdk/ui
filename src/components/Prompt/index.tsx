'use client';

import * as React from 'react';
import styles from './Prompt.module.scss';
import '../../styles/globals.scss';
import { Loading } from '../Loading';

// ============================================
// Types
// ============================================

export type PromptVariant = 'default' | 'fixed' | 'sticky';

export interface PromptProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSubmit' | 'defaultValue'> {
  children: React.ReactNode;
  /** Controlled input value */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Callback when form is submitted */
  onSubmit?: (value: string) => void;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Disable the entire prompt */
  disabled?: boolean;
  /** Show loading state (disables submit) */
  loading?: boolean;
  /** Minimum number of rows */
  minRows?: number;
  /** Maximum number of rows */
  maxRows?: number;
  /** Enable auto-resize based on content */
  autoResize?: boolean;
  /** Submit on Enter key (Shift+Enter for newline) */
  submitOnEnter?: boolean;
  /** Visual variant - "fixed" for bottom-fixed elevated prompt */
  variant?: PromptVariant;
}

export interface PromptTextareaProps {
  /** Override placeholder from context */
  placeholder?: string;
  className?: string;
}

export interface PromptToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export interface PromptActionsProps {
  children?: React.ReactNode;
  className?: string;
}

export interface PromptInfoProps {
  children: React.ReactNode;
  className?: string;
}

export interface PromptActionButtonProps {
  children: React.ReactNode;
  /** Accessible label for the button */
  'aria-label': string;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  className?: string;
}

export interface PromptModeButtonProps {
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether this mode is currently active */
  active?: boolean;
  /** Disabled state */
  disabled?: boolean;
  className?: string;
}

export interface PromptUsageProps {
  children: React.ReactNode;
  className?: string;
}

export interface PromptSubmitProps {
  /** Custom submit icon/content */
  children?: React.ReactNode;
  /** Override aria-label */
  'aria-label'?: string;
  className?: string;
}

// ============================================
// Icons
// ============================================

function ArrowUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z" />
    </svg>
  );
}

// ============================================
// Context
// ============================================

interface PromptContextValue {
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  loading: boolean;
  minRows: number;
  maxRows: number;
  autoResize: boolean;
  submitOnEnter: boolean;
  handleSubmit: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const PromptContext = React.createContext<PromptContextValue | null>(null);

function usePromptContext() {
  const context = React.useContext(PromptContext);
  if (!context) {
    throw new Error('Prompt compound components must be used within a Prompt');
  }
  return context;
}

// ============================================
// Hooks
// ============================================

function useControllableState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (value: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = React.useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  return [value, setValue];
}

// ============================================
// Components
// ============================================

function PromptRoot({
  children,
  value: controlledValue,
  defaultValue = '',
  onChange,
  onSubmit,
  placeholder = 'Ask, Search or Chat...',
  disabled = false,
  loading = false,
  minRows = 1,
  maxRows = 8,
  autoResize = true,
  submitOnEnter = true,
  variant = 'default',
  className,
  ...htmlProps
}: PromptProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useControllableState(
    controlledValue,
    defaultValue,
    onChange
  );

  const handleSubmit = React.useCallback(() => {
    if (disabled || loading || !value.trim()) return;
    onSubmit?.(value);
  }, [disabled, loading, value, onSubmit]);

  const contextValue: PromptContextValue = {
    value,
    setValue,
    placeholder,
    disabled,
    loading,
    minRows,
    maxRows,
    autoResize,
    submitOnEnter,
    handleSubmit,
    textareaRef,
  };

  const classes = [
    styles.prompt,
    variant === 'fixed' && styles.fixed,
    variant === 'sticky' && styles.sticky,
    disabled && styles.disabled,
    loading && styles.loading,
    className,
  ].filter(Boolean).join(' ');

  return (
    <PromptContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        className={classes}
        data-disabled={disabled || undefined}
        data-loading={loading || undefined}
        data-variant={variant}
      >
        {children}
      </div>
    </PromptContext.Provider>
  );
}

function PromptTextarea({ placeholder: overridePlaceholder, className }: PromptTextareaProps) {
  const {
    value,
    setValue,
    placeholder,
    disabled,
    loading,
    minRows,
    maxRows,
    autoResize,
    submitOnEnter,
    handleSubmit,
    textareaRef,
  } = usePromptContext();

  const lineHeight = 1.5;
  const padding = 12; // top + bottom padding in pixels

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate min and max heights based on rows
    const computedStyle = window.getComputedStyle(textarea);
    const fontSize = parseFloat(computedStyle.fontSize);
    const minHeight = minRows * fontSize * lineHeight + padding;
    const maxHeight = maxRows * fontSize * lineHeight + padding;

    // Set the height, clamped to min/max
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [textareaRef, autoResize, minRows, maxRows]);

  React.useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const classes = [styles.textarea, className].filter(Boolean).join(' ');

  return (
    <textarea
      ref={textareaRef}
      className={classes}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={overridePlaceholder ?? placeholder}
      disabled={disabled || loading}
      rows={minRows}
      aria-label={overridePlaceholder ?? placeholder}
    />
  );
}

function PromptToolbar({ children, className }: PromptToolbarProps) {
  const classes = [styles.toolbar, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

function PromptActions({ children, className }: PromptActionsProps) {
  if (!children) return null;
  const classes = [styles.actions, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

function PromptInfo({ children, className }: PromptInfoProps) {
  const classes = [styles.info, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

function PromptActionButton({
  children,
  'aria-label': ariaLabel,
  onClick,
  disabled: buttonDisabled,
  className,
}: PromptActionButtonProps) {
  const { disabled, loading } = usePromptContext();
  const isDisabled = disabled || loading || buttonDisabled;

  const classes = [styles.actionButton, className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

function PromptModeButton({
  children,
  onClick,
  active = false,
  disabled: buttonDisabled,
  className,
}: PromptModeButtonProps) {
  const { disabled, loading } = usePromptContext();
  const isDisabled = disabled || loading || buttonDisabled;

  const classes = [
    styles.modeButton,
    active && styles.modeButtonActive,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function PromptUsage({ children, className }: PromptUsageProps) {
  const classes = [styles.usage, className].filter(Boolean).join(' ');
  return <span className={classes}>{children}</span>;
}

function PromptSubmit({
  children,
  'aria-label': ariaLabel = 'Submit',
  className,
}: PromptSubmitProps) {
  const { disabled, loading, handleSubmit, value } = usePromptContext();
  const isDisabled = disabled || loading || !value.trim();

  const classes = [
    styles.submit,
    loading && styles.submitLoading,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={handleSubmit}
      disabled={isDisabled}
      aria-label={ariaLabel}
    >
      {loading ? (
        <Loading
          size="sm"
          variant="spinner"
          color="current"
          label="Submitting"
          className={styles.submitSpinner}
        />
      ) : (
        children ?? <ArrowUpIcon />
      )}
    </button>
  );
}

// ============================================
// Export compound component
// ============================================

export const Prompt = Object.assign(PromptRoot, {
  Textarea: PromptTextarea,
  Toolbar: PromptToolbar,
  Actions: PromptActions,
  Info: PromptInfo,
  ActionButton: PromptActionButton,
  ModeButton: PromptModeButton,
  Usage: PromptUsage,
  Submit: PromptSubmit,
});

export {
  PromptRoot,
  PromptTextarea,
  PromptToolbar,
  PromptActions,
  PromptInfo,
  PromptActionButton,
  PromptModeButton,
  PromptUsage,
  PromptSubmit,
};

// Export hook for external use
export { usePromptContext };
