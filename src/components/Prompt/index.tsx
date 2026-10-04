"use client";

import * as React from "react";
import { ArrowUp, CaretDown, Plus, Stop, WarningCircle, X } from "@phosphor-icons/react";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { Menu } from "../Menu";
import { useControllableState } from "../../utils/controllable-state";
import { isComposingEnter } from "../../utils/isComposingEnter";
import styles from "./Prompt.module.scss";

// ============================================
// Types
// ============================================

export interface PromptProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "onSubmit" | "defaultValue"
> {
  children: React.ReactNode;
  /** Controlled text. */
  value?: string;
  /** Initial text when uncontrolled. */
  defaultValue?: string;
  /** Called with the new text on every edit. */
  onValueChange?: (value: string) => void;
  /** Called with the text when the person sends it. */
  onSubmit?: (value: string) => void;
  /** @default "Ask, search or chat…" */
  placeholder?: string;
  /** Nothing can be typed or sent. */
  disabled?: boolean;
  /** The text can be read and selected but not changed or sent. */
  readOnly?: boolean;
  /** The text cannot be sent as it is; pair with `errorMessage`. */
  invalid?: boolean;
  /** Why the text cannot be sent, shown with a danger glyph inside the composer. */
  errorMessage?: React.ReactNode;
  /** The send is in flight: Submit shows a spinner after a second and swallows presses. */
  pending?: boolean;
  /** The assistant is responding: the work wash plays, typing stays open and Submit turns into Stop. */
  working?: boolean;
  /** Stop the response. With `working`, Submit becomes a Stop button. */
  onStop?: () => void;
  /** Rows the text area starts at. @default 1 */
  minRows?: number;
  /** Rows the text area grows to before it scrolls. @default 8 */
  maxRows?: number;
  /** Enter sends and Shift+Enter breaks the line. @default true */
  submitOnEnter?: boolean;
  /** Files added by the attach button, a paste or a drop. Providing it turns all three on. */
  onFiles?: (files: File[]) => void;
  /** `accept` for the attach picker, for example `"image/*"`. */
  accept?: string;
}

export interface PromptTextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "rows" | "disabled" | "readOnly" | "children"
> {
  /** Override the prompt's placeholder. */
  placeholder?: string;
}

export interface PromptToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface PromptActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface PromptInfoProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

/** One thing attached to the prompt. */
export interface PromptAttachment {
  id: string;
  name: string;
  /** Size in bytes, shown beside the name when known. */
  size?: number;
  /** Object URL or data URI; an image gets a thumbnail. */
  previewUrl?: string;
}

export interface PromptAttachmentsProps {
  items: PromptAttachment[];
  /** Omit to render the strip read-only. */
  onRemove?: (id: string) => void;
  className?: string;
}

export interface PromptAttachProps {
  /** Accessible name. @default "Attach files" */
  "aria-label"?: string;
  /** Custom glyph. Defaults to a plus. */
  children?: React.ReactNode;
  /** Overrides the prompt's `accept`. */
  accept?: string;
  /** @default true */
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface PromptPickerOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface PromptPickerProps {
  /** What the choice is about (Model, Agent); read before the choice. */
  "aria-label": string;
  /** Leading glyph. */
  icon?: React.ReactNode;
  options: PromptPickerOption[];
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Shown before anything is chosen. @default "Choose" */
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface PromptSubmitProps {
  /** Custom glyph. Defaults to an up arrow. */
  children?: React.ReactNode;
  /** Accessible name of the send action. @default "Send" */
  "aria-label"?: string;
  /** Accessible name of the stop action while working. @default "Stop" */
  stopLabel?: string;
  /**
   * Menu items for other ways to send (queue, send later). A click still
   * sends; right-click, a long press, ArrowDown, Shift+F10 or the context-menu
   * key opens the menu.
   */
  menu?: React.ReactNode;
  className?: string;
}

// ============================================
// Context
// ============================================

interface PromptContextValue {
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  errorId?: string;
  pending: boolean;
  working: boolean;
  onStop?: () => void;
  minRows: number;
  maxRows: number;
  submitOnEnter: boolean;
  handleSubmit: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  accept?: string;
  /** Undefined when the consumer has not opted into files. */
  onFiles?: (files: File[]) => void;
}

const PromptContext = React.createContext<PromptContextValue | null>(null);

function usePromptContext() {
  const context = React.useContext(PromptContext);
  if (!context) {
    throw new Error("Prompt compound components must be used within a Prompt");
  }
  return context;
}

function supportsFieldSizing(): boolean {
  return typeof CSS !== "undefined" && typeof CSS.supports === "function"
    ? CSS.supports("field-sizing", "content")
    : false;
}

// ============================================
// Root: the composer is one field
// ============================================

function PromptRoot({
  children,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onSubmit,
  placeholder = "Ask, search or chat…",
  disabled = false,
  readOnly = false,
  invalid = false,
  errorMessage,
  pending = false,
  working = false,
  onStop,
  minRows = 1,
  maxRows = 8,
  submitOnEnter = true,
  onFiles,
  accept,
  className,
  ...htmlProps
}: PromptProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const errorId = React.useId();
  const [dragging, setDragging] = React.useState(false);
  // Drag events fire for every element the pointer crosses inside the card;
  // counting them drops the drop target only when the pointer has left.
  const dragDepth = React.useRef(0);
  const [value, setValue] = useControllableState(controlledValue, defaultValue, onValueChange);

  const handleSubmit = React.useCallback(() => {
    if (disabled || readOnly || pending || working || !value.trim()) return;
    onSubmit?.(value);
  }, [disabled, readOnly, pending, working, value, onSubmit]);

  const acceptFiles = React.useCallback(
    (files: File[]) => {
      if (!onFiles || disabled || readOnly || files.length === 0) return;
      onFiles(files);
    },
    [onFiles, disabled, readOnly]
  );

  const showError = invalid && errorMessage != null;
  const contextValue: PromptContextValue = {
    value,
    setValue,
    placeholder,
    disabled,
    readOnly,
    invalid,
    errorId: showError ? errorId : undefined,
    pending,
    working,
    onStop,
    minRows,
    maxRows,
    submitOnEnter,
    handleSubmit,
    textareaRef,
    accept,
    onFiles: onFiles ? acceptFiles : undefined,
  };

  const hasFiles = (event: React.DragEvent) => event.dataTransfer.types.includes("Files");
  const dropHandlers =
    onFiles && !disabled && !readOnly
      ? {
          onDragEnter: (event: React.DragEvent<HTMLDivElement>) => {
            if (!hasFiles(event)) return;
            dragDepth.current += 1;
            setDragging(true);
          },
          onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
            if (!hasFiles(event)) return;
            // Without this the browser navigates to the dropped file.
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          },
          onDragLeave: () => {
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setDragging(false);
          },
          onDrop: (event: React.DragEvent<HTMLDivElement>) => {
            if (!hasFiles(event)) return;
            event.preventDefault();
            dragDepth.current = 0;
            setDragging(false);
            acceptFiles(Array.from(event.dataTransfer.files));
          },
        }
      : null;

  const classes = [styles.prompt, className].filter(Boolean).join(" ");

  return (
    <PromptContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        {...dropHandlers}
        className={classes}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-invalid={invalid || undefined}
        data-pending={pending || undefined}
        data-working={working || undefined}
        data-dragging={dragging || undefined}
        aria-busy={working || undefined}
      >
        {children}
        {showError && (
          <p id={errorId} className={styles.error}>
            <Icon icon={WarningCircle} size="sm" className={styles.errorIcon} />
            {errorMessage}
          </p>
        )}
        {dragging && (
          <span className={styles.dropHint} aria-hidden="true">
            Drop to attach
          </span>
        )}
      </div>
    </PromptContext.Provider>
  );
}

// ============================================
// Textarea: grows from minRows to maxRows
// ============================================

function PromptTextarea({
  placeholder: overridePlaceholder,
  className,
  style,
  onChange,
  onKeyDown,
  onPaste,
  "aria-label": ariaLabel,
  "aria-describedby": describedBy,
  ...htmlProps
}: PromptTextareaProps) {
  const {
    value,
    setValue,
    placeholder,
    disabled,
    readOnly,
    invalid,
    errorId,
    pending,
    working,
    minRows,
    maxRows,
    submitOnEnter,
    handleSubmit,
    textareaRef,
    onFiles,
  } = usePromptContext();

  // field-sizing grows the box in CSS; older engines get the measured fallback.
  React.useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || supportsFieldSizing()) return;
    textarea.style.height = "auto";
    const computed = window.getComputedStyle(textarea);
    const line = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5;
    const padding = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
    const height = Math.min(
      Math.max(textarea.scrollHeight, minRows * line + padding),
      maxRows * line + padding
    );
    textarea.style.height = `${height}px`;
  }, [value, minRows, maxRows, textareaRef]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event);
    if (event.defaultPrevented) return;
    setValue(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    // Enter confirms an IME candidate before it means send.
    if (isComposingEnter(event)) return;
    if (submitOnEnter && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      // While a send is in flight or the assistant works, Enter does nothing;
      // a consumer that queues messages handles it in its own onKeyDown.
      if (!pending && !working) handleSubmit();
    }
  };

  // A pasted screenshot arrives as a file named "image.png"; name it so two
  // of them can be told apart in the strip.
  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    onPaste?.(event);
    if (event.defaultPrevented || !onFiles) return;
    const files = Array.from(event.clipboardData.files);
    if (files.length === 0) return;
    event.preventDefault();
    onFiles(
      files.map((file, index) =>
        file.name && file.name !== "image.png"
          ? file
          : new File([file], `pasted-${index + 1}.${file.type.split("/")[1] || "png"}`, {
              type: file.type,
            })
      )
    );
  };

  const rows = {
    "--_fui-prompt-min-rows": minRows,
    "--_fui-prompt-max-rows": maxRows,
  } as React.CSSProperties;
  const classes = [styles.textarea, className].filter(Boolean).join(" ");
  const describedByIds = [describedBy, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <textarea
      ref={textareaRef}
      {...htmlProps}
      className={classes}
      style={{ ...rows, ...style }}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={overridePlaceholder ?? placeholder}
      disabled={disabled}
      readOnly={readOnly}
      rows={minRows}
      aria-label={ariaLabel ?? overridePlaceholder ?? placeholder}
      aria-invalid={invalid || undefined}
      aria-describedby={describedByIds}
    />
  );
}

// ============================================
// Toolbar parts, on the same field plane
// ============================================

function PromptToolbar({ children, className, ...htmlProps }: PromptToolbarProps) {
  const classes = [styles.toolbar, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

function PromptActions({ children, className, ...htmlProps }: PromptActionsProps) {
  if (!children) return null;
  const classes = [styles.actions, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

function PromptInfo({ children, className, ...htmlProps }: PromptInfoProps) {
  const classes = [styles.info, className].filter(Boolean).join(" ");
  return (
    <span {...htmlProps} className={classes}>
      {children}
    </span>
  );
}

/** Bytes as something a person reads at a glance. */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(kb / 1024 < 10 ? 1 : 0)} MB`;
}

/** What goes with the message: chips on the surface plane, above the text. */
function PromptAttachments({ items, onRemove, className }: PromptAttachmentsProps) {
  if (items.length === 0) return null;
  const classes = [styles.attachments, className].filter(Boolean).join(" ");
  return (
    <ul className={classes} aria-label="Attachments">
      {items.map((item) => (
        <li key={item.id} className={styles.attachment}>
          {item.previewUrl ? (
            // Decorative: the file name beside it is the accessible name.
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
              <Icon icon={X} size="xs" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Opens a picker and hands the files to the prompt's `onFiles`, like paste and drop. */
function PromptAttach({
  "aria-label": ariaLabel = "Attach files",
  children,
  accept: acceptOverride,
  multiple = true,
  disabled: buttonDisabled,
  className,
}: PromptAttachProps) {
  const { disabled, readOnly, accept, onFiles } = usePromptContext();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isDisabled = disabled || readOnly || buttonDisabled || !onFiles;

  return (
    <>
      <IconButton
        variant="ghost"
        size="sm"
        className={className}
        onClick={() => inputRef.current?.click()}
        disabled={isDisabled}
        aria-label={ariaLabel}
      >
        {children ?? <Icon icon={Plus} size="md" />}
      </IconButton>
      {/* `hidden`: the button is the control; the input stays out of the
          accessibility tree and still opens its picker when clicked. */}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={acceptOverride ?? accept}
        multiple={multiple}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          // Reset first, or picking the same file twice is a no-op.
          event.target.value = "";
          onFiles?.(files);
        }}
      />
    </>
  );
}

/** A choice that scopes the send (model, agent), as a menu of radio items. */
function PromptPicker({
  "aria-label": ariaLabel,
  icon,
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  placeholder = "Choose",
  disabled: pickerDisabled,
  className,
}: PromptPickerProps) {
  const { disabled } = usePromptContext();
  const [value, setValue] = useControllableState<string | undefined>(
    controlledValue,
    defaultValue,
    onValueChange as ((value: string | undefined) => void) | undefined
  );
  const current = options.find((option) => option.value === value);
  const classes = [styles.picker, className].filter(Boolean).join(" ");

  return (
    <Menu modal={false}>
      <Menu.Trigger className={classes} disabled={disabled || pickerDisabled}>
        {icon != null && (
          <span className={styles.pickerIcon} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={styles.hidden}>{ariaLabel}: </span>
        <span className={styles.pickerValue}>{current?.label ?? placeholder}</span>
        <Icon icon={CaretDown} size="xs" className={styles.pickerCaret} />
      </Menu.Trigger>
      <Menu.Content side="top" align="start">
        <Menu.RadioGroup value={value} onValueChange={(next) => setValue(next)}>
          {options.map((option) => (
            <Menu.RadioItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu>
  );
}

const LONG_PRESS_MS = 600;

/** Send: the accent action. Turns into Stop while the assistant works. */
function PromptSubmit({
  children,
  "aria-label": ariaLabel = "Send",
  stopLabel = "Stop",
  menu,
  className,
}: PromptSubmitProps) {
  const { disabled, readOnly, pending, working, onStop, handleSubmit, value } = usePromptContext();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const allowOpen = React.useRef(false);
  const longPress = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClick = React.useRef(false);

  React.useEffect(
    () => () => {
      if (longPress.current) clearTimeout(longPress.current);
    },
    []
  );

  if (working && onStop) {
    return (
      <button
        type="button"
        className={[styles.submit, styles.stop, className].filter(Boolean).join(" ")}
        onClick={onStop}
        disabled={disabled}
        aria-label={stopLabel}
      >
        <Icon icon={Stop} size="md" weight="fill" />
      </button>
    );
  }

  const isDisabled = disabled || readOnly || working || !value.trim();
  const classes = [styles.submit, className].filter(Boolean).join(" ");
  const glyph = (
    <>
      <span className={styles.submitGlyph}>{children ?? <Icon icon={ArrowUp} size="md" />}</span>
      <span className={styles.submitSpinner} aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M14 8a6 6 0 1 1-4.15-5.71" strokeLinecap="round" />
        </svg>
      </span>
    </>
  );
  const send = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (!pending) handleSubmit();
  };

  if (!menu) {
    return (
      <button
        type="button"
        className={classes}
        onClick={send}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-busy={pending || undefined}
        data-pending={pending || undefined}
      >
        {glyph}
      </button>
    );
  }

  const openMenu = () => {
    allowOpen.current = true;
    setMenuOpen(true);
  };
  const cancelLongPress = () => {
    if (longPress.current) clearTimeout(longPress.current);
    longPress.current = null;
  };

  return (
    <Menu
      open={menuOpen}
      onOpenChange={(open) => {
        // A plain click sends; only the menu gestures open the menu.
        if (open && !allowOpen.current) return;
        allowOpen.current = false;
        setMenuOpen(open);
      }}
    >
      <Menu.Trigger
        className={classes}
        onClick={send}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-busy={pending || undefined}
        data-pending={pending || undefined}
        onContextMenu={(event) => {
          event.preventDefault();
          openMenu();
        }}
        onKeyDown={(event) => {
          if (
            event.key === "ArrowDown" ||
            event.key === "ContextMenu" ||
            (event.key === "F10" && event.shiftKey)
          ) {
            event.preventDefault();
            openMenu();
          }
        }}
        onPointerDown={() => {
          cancelLongPress();
          longPress.current = setTimeout(() => {
            suppressClick.current = true;
            openMenu();
          }, LONG_PRESS_MS);
        }}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
      >
        {glyph}
      </Menu.Trigger>
      <Menu.Content side="top" align="end">
        {menu}
      </Menu.Content>
    </Menu>
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
  Picker: PromptPicker,
  Attach: PromptAttach,
  Attachments: PromptAttachments,
  Submit: PromptSubmit,
});

export {
  PromptRoot,
  PromptTextarea,
  PromptToolbar,
  PromptActions,
  PromptInfo,
  PromptPicker,
  PromptAttach,
  PromptAttachments,
  PromptSubmit,
};

export { usePromptContext };
