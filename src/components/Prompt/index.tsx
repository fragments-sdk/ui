'use client';

import * as React from 'react';
import styles from './Prompt.module.scss';
import { Loading } from '../Loading';
import { Select, type SelectOption, type SelectValue } from '../Select';

// ============================================
// Types
// ============================================

export type PromptVariant = 'default' | 'fixed' | 'sticky';

export type PromptAppearance = 'panel' | 'seamless';

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
  /** Files added to the prompt, by any of the three routes people actually
   * use: the attach button, a paste, or a drop anywhere on the card. Providing
   * it is what turns all three on. */
  onFiles?: (files: File[]) => void;
  /** `accept` for the attach button's picker, e.g. `"image/*"`. */
  accept?: string;
  /** Visual variant - "fixed" for bottom-fixed elevated prompt */
  variant?: PromptVariant;
  /** How the card is divided up. `panel` keeps the toolbar as a filled footer
   * under a rule; `seamless` makes the whole card one writing surface with the
   * controls floating on it — the shape most agent composers use.
   * @default "panel" */
  appearance?: PromptAppearance;
}

export interface PromptTextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'defaultValue' | 'onChange' | 'rows' | 'disabled' | 'children'
> {
  /** Override placeholder from context */
  placeholder?: string;
  /** Composed with internal state update logic */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  /** Composed with internal submit-on-enter logic */
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  /** Composed with the prompt's paste-to-attach behaviour */
  onPaste?: React.ClipboardEventHandler<HTMLTextAreaElement>;
}

export interface PromptToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export interface PromptTabsProps {
  children: React.ReactNode;
  className?: string;
}

export interface PromptTabProps {
  children: React.ReactNode;
  /** Whether this tab is currently active */
  active?: boolean;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
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
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Disabled state */
  disabled?: boolean;
  className?: string;
}

export interface PromptModeButtonProps {
  children: React.ReactNode;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Whether this mode is currently active */
  active?: boolean;
  /** Disabled state */
  disabled?: boolean;
  className?: string;
}

/** One thing attached to the prompt, as the strip needs to render it. */
export interface PromptAttachment {
  id: string;
  name: string;
  /** Size in bytes. Shown beside the name when known. */
  size?: number;
  /** Object URL or data URI. An image gets a thumbnail instead of an icon. */
  previewUrl?: string;
}

export interface PromptAttachmentsProps {
  items: PromptAttachment[];
  /** Omit to render the strip read-only. */
  onRemove?: (id: string) => void;
  className?: string;
}

export interface PromptAttachProps {
  /** Accessible name.
   * @default "Attach files" */
  'aria-label'?: string;
  /** Custom glyph. Defaults to a plus. */
  children?: React.ReactNode;
  /** Overrides the prompt's own `accept` for this control. */
  accept?: string;
  /** @default true */
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface PromptSelectProps {
  /** Leading glyph — says what the choice is about, so the visible text can be
   * the choice itself. */
  icon?: React.ReactNode;
  /** Accessible name. The trigger shows the current choice, not this. */
  'aria-label': string;
  /** Controlled value */
  value?: SelectValue | null;
  /** Default value for uncontrolled usage */
  defaultValue?: SelectValue;
  /** Called when the choice changes */
  onValueChange?: (value: SelectValue | null) => void;
  /** The choices. Omit and pass `Select.Item` children for richer options. */
  options?: SelectOption[];
  children?: React.ReactNode;
  /** Shown before anything is chosen */
  placeholder?: string;
  /** Disabled independently of the prompt's own disabled state */
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

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
    </svg>
  );
}

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
  accept?: string;
  /** Undefined when the consumer has not opted into files at all, which is how
   * Attach knows to disable itself and the root knows not to accept drops. */
  onFiles?: (files: File[]) => void;
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
  appearance = 'panel',
  onFiles,
  accept,
  className,
  ...htmlProps
}: PromptProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [dragging, setDragging] = React.useState(false);
  // Drag events fire for every element the pointer crosses inside the card, so
  // a naive enter/leave pair flickers as the cursor moves between children.
  // Counting them means the highlight only drops when the pointer has actually
  // left the composer.
  const dragDepth = React.useRef(0);

  const [value, setValue] = useControllableState(
    controlledValue,
    defaultValue,
    onChange
  );

  const handleSubmit = React.useCallback(() => {
    if (disabled || loading || !value.trim()) return;
    onSubmit?.(value);
  }, [disabled, loading, value, onSubmit]);

  const acceptFiles = React.useCallback(
    (files: File[]) => {
      if (!onFiles || disabled || loading || files.length === 0) return;
      onFiles(files);
    },
    [onFiles, disabled, loading]
  );

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
    accept,
    onFiles: onFiles ? acceptFiles : undefined,
  };

  const dropHandlers = onFiles
    ? {
        onDragEnter: (event: React.DragEvent<HTMLDivElement>) => {
          if (!event.dataTransfer.types.includes('Files')) return;
          dragDepth.current += 1;
          setDragging(true);
        },
        onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
          if (!event.dataTransfer.types.includes('Files')) return;
          // Without this the browser navigates to the dropped file.
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
        },
        onDragLeave: () => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragging(false);
        },
        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
          if (!event.dataTransfer.types.includes('Files')) return;
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          acceptFiles(Array.from(event.dataTransfer.files));
        },
      }
    : null;

  const classes = [
    styles.prompt,
    variant === 'fixed' && styles.fixed,
    variant === 'sticky' && styles.sticky,
    appearance === 'seamless' && styles.seamless,
    dragging && styles.dragging,
    disabled && styles.disabled,
    loading && styles.loading,
    className,
  ].filter(Boolean).join(' ');

  return (
    <PromptContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        {...dropHandlers}
        className={classes}
        data-disabled={disabled || undefined}
        data-loading={loading || undefined}
        data-variant={variant}
        data-appearance={appearance}
        data-dragging={dragging || undefined}
      >
        {children}
      </div>
    </PromptContext.Provider>
  );
}

function PromptTextarea({
  placeholder: overridePlaceholder,
  className,
  onChange,
  onKeyDown,
  onPaste,
  'aria-label': ariaLabel,
  ...htmlProps
}: PromptTextareaProps) {
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
    onFiles,
  } = usePromptContext();

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate min and max heights based on rows
    const computedStyle = window.getComputedStyle(textarea);
    const fontSize = parseFloat(computedStyle.fontSize);
    const computedLineHeight = parseFloat(computedStyle.lineHeight);
    const lineHeight = Number.isFinite(computedLineHeight) ? computedLineHeight : fontSize * 1.5;
    const paddingBlock =
      parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
    const minHeight = minRows * lineHeight + paddingBlock;
    const maxHeight = maxRows * lineHeight + paddingBlock;

    // Set the height, clamped to min/max
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [textareaRef, autoResize, minRows, maxRows]);

  React.useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    if (e.defaultPrevented) return;
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Pasting a screenshot is how people actually attach one. The clipboard
  // carries it as a file with no name, so it gets one here — a bare "image.png"
  // in the strip is worse than useless when there are two of them.
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    onPaste?.(e);
    if (e.defaultPrevented || !onFiles) return;
    const files = Array.from(e.clipboardData.files);
    if (files.length === 0) return;
    e.preventDefault();
    onFiles(
      files.map((file, index) =>
        file.name && file.name !== 'image.png'
          ? file
          : new File([file], `pasted-${index + 1}.${file.type.split('/')[1] || 'png'}`, {
              type: file.type,
            })
      )
    );
  };

  const classes = [styles.textarea, className].filter(Boolean).join(' ');

  return (
    <textarea
      ref={textareaRef}
      {...htmlProps}
      className={classes}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={overridePlaceholder ?? placeholder}
      disabled={disabled || loading}
      rows={minRows}
      aria-label={ariaLabel ?? overridePlaceholder ?? placeholder}
    />
  );
}

function PromptToolbar({ children, className }: PromptToolbarProps) {
  const classes = [styles.toolbar, className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

function PromptTabs({ children, className }: PromptTabsProps) {
  const classes = [styles.tabs, className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <div className={styles.tabsInner}>{children}</div>
    </div>
  );
}

function PromptTab({ children, active = false, onClick, className }: PromptTabProps) {
  const classes = [
    styles.tabButton,
    active && styles.tabButtonActive,
    className,
  ].filter(Boolean).join(' ');
  return (
    <button type="button" className={classes} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
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

/** Bytes as something a person reads at a glance, not as a precise count. */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(kb / 1024 < 10 ? 1 : 0)} MB`;
}

/**
 * What is going with the message. Renders above the textarea rather than under
 * the toolbar, because these are part of what you are sending and not a
 * setting on the sending.
 */
function PromptAttachments({ items, onRemove, className }: PromptAttachmentsProps) {
  if (items.length === 0) return null;
  const classes = [styles.attachments, className].filter(Boolean).join(' ');

  return (
    <ul className={classes} aria-label="Attachments">
      {items.map((item) => (
        <li key={item.id} className={styles.attachment}>
          {item.previewUrl ? (
            // Decorative: the filename beside it is the accessible name, and a
            // thumbnail of a screenshot has no description worth inventing.
            <img src={item.previewUrl} alt="" className={styles.attachmentThumb} />
          ) : null}
          <span className={styles.attachmentName} title={item.name}>
            {item.name}
          </span>
          {item.size != null && (
            <span className={styles.attachmentSize}>{formatSize(item.size)}</span>
          )}
          {onRemove && (
            <button
              type="button"
              className={styles.attachmentRemove}
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.name}`}
            >
              <CloseIcon />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * The attach control. Does nothing on its own — it opens a picker and hands
 * the result to the prompt's `onFiles`, the same callback that paste and drop
 * go through, so a consumer writes one handler for all three.
 */
function PromptAttach({
  'aria-label': ariaLabel = 'Attach files',
  children,
  accept: acceptOverride,
  multiple = true,
  disabled: buttonDisabled,
  className,
}: PromptAttachProps) {
  const { disabled, loading, accept, onFiles } = usePromptContext();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isDisabled = disabled || loading || buttonDisabled || !onFiles;

  const classes = [styles.attach, className].filter(Boolean).join(' ');

  return (
    <>
      <button
        type="button"
        className={classes}
        onClick={() => inputRef.current?.click()}
        disabled={isDisabled}
        aria-label={ariaLabel}
      >
        {children ?? <PlusIcon />}
      </button>
      {/* `hidden` rather than a class: the button above is the control, and
          this must be out of the accessibility tree entirely or it reads as a
          second, unlabelled one. A hidden input still opens its picker when
          clicked programmatically. */}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={acceptOverride ?? accept}
        multiple={multiple}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          // Reset first, or picking the same file twice in a row is a no-op.
          event.target.value = '';
          onFiles?.(files);
        }}
      />
    </>
  );
}

/**
 * A choice that scopes the submission — model, agent, tone, which project this
 * runs against. `ModeButton` covers a setting you toggle; this covers one you
 * pick from a list, which every non-trivial composer ends up needing.
 *
 * It is a `Select` throughout, in its ghost variant, so the popup, keyboard
 * handling and selection state are the same ones the rest of the library uses.
 * The trigger shows the current choice rather than a field label, because in a
 * toolbar the choice is the only part worth the width — what kind of choice it
 * is comes from the icon and the accessible name.
 */
function PromptSelect({
  icon,
  'aria-label': ariaLabel,
  options,
  children,
  placeholder,
  disabled: selectDisabled,
  className,
  ...selectProps
}: PromptSelectProps) {
  const { disabled, loading } = usePromptContext();
  const classes = [styles.select, className].filter(Boolean).join(' ');

  return (
    <Select
      {...selectProps}
      size="sm"
      variant="ghost"
      options={options}
      placeholder={placeholder}
      disabled={disabled || loading || selectDisabled}
    >
      <Select.Trigger className={classes} icon={icon} aria-label={ariaLabel} />
      {/* No children: Content renders what `options` describes, which is how a
          hint or anything else the root knows about an option survives being
          composed into a custom trigger. */}
      <Select.Content>{children}</Select.Content>
    </Select>
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
  Tabs: PromptTabs,
  Tab: PromptTab,
  Actions: PromptActions,
  Info: PromptInfo,
  ActionButton: PromptActionButton,
  ModeButton: PromptModeButton,
  Select: PromptSelect,
  Attach: PromptAttach,
  Attachments: PromptAttachments,
  Usage: PromptUsage,
  Submit: PromptSubmit,
});

export {
  PromptRoot,
  PromptTextarea,
  PromptToolbar,
  PromptTabs,
  PromptTab,
  PromptActions,
  PromptInfo,
  PromptActionButton,
  PromptModeButton,
  PromptSelect,
  PromptAttach,
  PromptAttachments,
  PromptUsage,
  PromptSubmit,
};

// Export hook for external use
export { usePromptContext };
