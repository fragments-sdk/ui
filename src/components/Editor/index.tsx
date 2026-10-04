"use client";

import * as React from "react";
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  Code,
  LinkSimple,
  ListBullets,
  ListNumbers,
  Quotes,
  TextB,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
  WarningCircle,
} from "@phosphor-icons/react";
import { mergeAriaIds } from "../../utils/aria";
import { useControllableState } from "../../utils/controllable-state";
import { isDevelopmentBuild } from "../../utils/env";
import { KEYBOARD_SHORTCUTS } from "../../utils/keyboard-shortcuts";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { Separator } from "../Separator";
import styles from "./Editor.module.scss";

// ============================================
// Lazy-loaded dependency (TipTap)
// ============================================

let _useEditor: ((config: Record<string, unknown>) => unknown) | null = null;
let _EditorContent: React.ComponentType<Record<string, unknown>> | null = null;
let _StarterKit: unknown = null;
let _LinkExtension: unknown = null;
let _tiptapLoadPromise: Promise<void> | null = null;
let _tiptapFailed = false;

// Resolved with import() rather than require(): browser ESM bundles have no
// `require`, so the synchronous shape forced markdown mode even with TipTap installed.
function loadTipTapDeps(): Promise<void> {
  if (!_tiptapLoadPromise) {
    _tiptapLoadPromise = (async () => {
      try {
        const [tiptapReact, starterKit, linkExt] = await Promise.all([
          import("@tiptap/react"),
          import("@tiptap/starter-kit"),
          import("@tiptap/extension-link"),
        ]);

        _useEditor = tiptapReact.useEditor as unknown as (
          config: Record<string, unknown>
        ) => unknown;
        _EditorContent = tiptapReact.EditorContent as unknown as React.ComponentType<
          Record<string, unknown>
        >;
        _StarterKit =
          (starterKit as { default?: unknown; StarterKit?: unknown }).default ??
          (starterKit as { StarterKit?: unknown }).StarterKit ??
          starterKit;
        _LinkExtension =
          (linkExt as { default?: unknown; Link?: unknown }).default ??
          (linkExt as { Link?: unknown }).Link ??
          linkExt;
      } catch {
        _tiptapFailed = true;
        if (isDevelopmentBuild()) {
          console.warn(
            "[@usefragments/ui] Editor: TipTap is not installed; falling back to markdown mode. " +
              "Install it with: npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link"
          );
        }
      }
    })();
  }
  return _tiptapLoadPromise;
}

/** Kick off the lazy TipTap load on mount and re-render once it settles. */
function useTipTapDeps(): boolean {
  const [, rerender] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if ((_useEditor && _EditorContent && _StarterKit) || _tiptapFailed) return;
    let active = true;
    void loadTipTapDeps().then(() => {
      if (active) rerender();
    });
    return () => {
      active = false;
    };
  }, []);
  return !_tiptapFailed && !!_useEditor && !!_EditorContent && !!_StarterKit;
}

// ============================================
// Types
// ============================================

export type EditorFormat =
  | "bold"
  | "italic"
  | "strikethrough"
  | "link"
  | "code"
  | "bulletList"
  | "orderedList"
  | "heading"
  | "blockquote"
  | "undo"
  | "redo";

export type EditorSaveStatus = "idle" | "saving" | "saved" | "error";

export type EditorMode = "rich" | "markdown";

export interface EditorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  children?: React.ReactNode;
  /** Controlled value */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Called when content changes */
  onValueChange?: (value: string) => void;
  /** Visible label above the field; names the text box */
  label?: string;
  /** Helper text below the field; describes the text box */
  helperText?: string;
  /** Marks the value invalid: the danger edge, aria-invalid and the error message */
  invalid?: boolean;
  /** Words shown under the field while it is invalid */
  errorMessage?: string;
  /** Placeholder text. Never the accessible name: pass `label` or `aria-label`. */
  placeholder?: string;
  /** Disable the editor. The text stays selectable and copyable. */
  disabled?: boolean;
  /** Read-only: the toolbar hides and the edge turns dashed */
  readOnly?: boolean;
  /** Which format buttons the default toolbar shows */
  formats?: EditorFormat[];
  /** Show the default toolbar */
  toolbar?: boolean;
  /** Show the default status bar. On by default only with `maxLength` or `onAutoSave`. */
  statusBar?: boolean;
  /** Auto-save callback (sync or async) */
  onAutoSave?: (value: string) => void | Promise<void>;
  /** Auto-save interval in ms */
  autoSaveInterval?: number;
  /** Height of the writing area in text lines, as Textarea counts them */
  rows?: number;
  /** Maximum character count (shows the count and how many over in the status bar) */
  maxLength?: number;
}

export interface EditorToolbarProps {
  children: React.ReactNode;
  "aria-label"?: string;
  className?: string;
}

export interface EditorToolbarGroupProps {
  children: React.ReactNode;
  "aria-label"?: string;
  className?: string;
}

export interface EditorToolbarButtonProps {
  /** Which format this button toggles */
  format: EditorFormat;
  className?: string;
}

export interface EditorStatusIndicatorProps {
  /** Override the save status from context */
  status?: EditorSaveStatus;
  /** Custom labels per status */
  labels?: Partial<Record<EditorSaveStatus, string>>;
  className?: string;
}

export interface EditorContentProps {
  className?: string;
}

export interface EditorStatusBarProps {
  /** Show word count */
  showWordCount?: boolean;
  /** Show character count */
  showCharCount?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// ============================================
// Format metadata
// ============================================

const FORMAT_META: Record<
  EditorFormat,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- icon components take varied prop shapes
  { icon: React.ComponentType<any>; label: string; shortcut: string }
> = {
  bold: { icon: TextB, label: "Bold", shortcut: KEYBOARD_SHORTCUTS.EDITOR_BOLD.label },
  italic: { icon: TextItalic, label: "Italic", shortcut: KEYBOARD_SHORTCUTS.EDITOR_ITALIC.label },
  strikethrough: {
    icon: TextStrikethrough,
    label: "Strikethrough",
    shortcut: KEYBOARD_SHORTCUTS.EDITOR_STRIKETHROUGH.label,
  },
  link: { icon: LinkSimple, label: "Link", shortcut: KEYBOARD_SHORTCUTS.EDITOR_LINK.label },
  code: { icon: Code, label: "Code", shortcut: KEYBOARD_SHORTCUTS.EDITOR_CODE.label },
  bulletList: {
    icon: ListBullets,
    label: "Bullet list",
    shortcut: KEYBOARD_SHORTCUTS.EDITOR_BULLET_LIST.label,
  },
  orderedList: {
    icon: ListNumbers,
    label: "Numbered list",
    shortcut: KEYBOARD_SHORTCUTS.EDITOR_ORDERED_LIST.label,
  },
  heading: {
    icon: TextHTwo,
    label: "Heading",
    shortcut: KEYBOARD_SHORTCUTS.EDITOR_HEADING2.label,
  },
  blockquote: {
    icon: Quotes,
    label: "Quote",
    shortcut: KEYBOARD_SHORTCUTS.EDITOR_BLOCKQUOTE.label,
  },
  undo: {
    icon: ArrowCounterClockwise,
    label: "Undo",
    shortcut: KEYBOARD_SHORTCUTS.EDITOR_UNDO.label,
  },
  redo: { icon: ArrowClockwise, label: "Redo", shortcut: KEYBOARD_SHORTCUTS.EDITOR_REDO.label },
};

const DEFAULT_FORMATS: EditorFormat[] = [
  "bold",
  "italic",
  "strikethrough",
  "link",
  "code",
  "bulletList",
];

/** Formats that are actions (not toggles) — no aria-pressed, different disable logic */
const ACTION_FORMATS = new Set<EditorFormat>(["undo", "redo"]);

const DEFAULT_STATUS_LABELS: Record<EditorSaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Couldn’t save",
};

const DEFAULT_ROWS = 8;

// ============================================
// Markdown formatting helpers (textarea fallback)
// ============================================

interface TextareaSelection {
  start: number;
  end: number;
  text: string;
}

function getSelection(textarea: HTMLTextAreaElement): TextareaSelection {
  return {
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
    text: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd),
  };
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string,
  setValue: (v: string) => void
) {
  const sel = getSelection(textarea);
  const before = textarea.value.substring(0, sel.start);
  const after = textarea.value.substring(sel.end);
  const wrapped = `${prefix}${sel.text || "text"}${suffix}`;
  const newValue = `${before}${wrapped}${after}`;
  setValue(newValue);

  requestAnimationFrame(() => {
    textarea.focus();
    const newStart = sel.start + prefix.length;
    const newEnd = newStart + (sel.text || "text").length;
    textarea.setSelectionRange(newStart, newEnd);
  });
}

function applyMarkdownFormat(
  format: EditorFormat,
  textarea: HTMLTextAreaElement,
  setValue: (v: string) => void
) {
  switch (format) {
    case "bold":
      wrapSelection(textarea, "**", "**", setValue);
      break;
    case "italic":
      wrapSelection(textarea, "*", "*", setValue);
      break;
    case "strikethrough":
      wrapSelection(textarea, "~~", "~~", setValue);
      break;
    case "code":
      wrapSelection(textarea, "`", "`", setValue);
      break;
    case "link": {
      const sel = getSelection(textarea);
      const linkText = sel.text || "link text";
      const before = textarea.value.substring(0, sel.start);
      const after = textarea.value.substring(sel.end);
      const newValue = `${before}[${linkText}](url)${after}`;
      setValue(newValue);
      requestAnimationFrame(() => {
        textarea.focus();
        const urlStart = sel.start + linkText.length + 3;
        textarea.setSelectionRange(urlStart, urlStart + 3);
      });
      break;
    }
    case "bulletList": {
      const sel = getSelection(textarea);
      const before = textarea.value.substring(0, sel.start);
      const after = textarea.value.substring(sel.end);
      const lines = (sel.text || "item").split("\n");
      const bulleted = lines.map((l) => `- ${l}`).join("\n");
      const newValue = `${before}${bulleted}${after}`;
      setValue(newValue);
      break;
    }
    case "orderedList": {
      const sel = getSelection(textarea);
      const before = textarea.value.substring(0, sel.start);
      const after = textarea.value.substring(sel.end);
      const lines = (sel.text || "item").split("\n");
      const numbered = lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
      const newValue = `${before}${numbered}${after}`;
      setValue(newValue);
      break;
    }
    case "heading":
      wrapSelection(textarea, "## ", "", setValue);
      break;
    case "blockquote": {
      const sel = getSelection(textarea);
      const before = textarea.value.substring(0, sel.start);
      const after = textarea.value.substring(sel.end);
      const lines = (sel.text || "quote").split("\n");
      const quoted = lines.map((l) => `> ${l}`).join("\n");
      const newValue = `${before}${quoted}${after}`;
      setValue(newValue);
      break;
    }
    case "undo":
    case "redo":
      // Undo/redo in textarea mode is handled natively by the browser
      break;
  }
}

// ============================================
// Context
// ============================================

interface EditorTextboxProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

interface EditorContextValue {
  value: string;
  setValue: (v: string) => void;
  placeholder: string;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  formats: EditorFormat[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the TipTap editor is an optional peer with no bundled types
  editor: any | null;
  mode: EditorMode;
  maxLength?: number;
  wordCount: number;
  charCount: number;
  toggleFormat: (f: EditorFormat) => void;
  isFormatActive: (f: EditorFormat) => boolean;
  saveStatus: EditorSaveStatus;
  contentRef: React.RefObject<HTMLTextAreaElement | null>;
  textboxProps: EditorTextboxProps;
}

const EditorContext = React.createContext<EditorContextValue | null>(null);

function useEditorContext() {
  const context = React.useContext(EditorContext);
  if (!context) {
    throw new Error("Editor compound components must be used within an Editor");
  }
  return context;
}

// ============================================
// Helpers
// ============================================

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

// ============================================
// Components
// ============================================

function EditorRoot(props: EditorProps) {
  const hasTipTap = useTipTapDeps();
  // The rich implementation calls TipTap's useEditor hook, so an instance's
  // mode must never change mid-lifetime. Keying by mode remounts the
  // implementation exactly once, when the lazy TipTap load resolves.
  return <EditorImpl key={hasTipTap ? "rich" : "markdown"} hasTipTap={hasTipTap} {...props} />;
}

function EditorImpl({
  hasTipTap,
  children,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  label,
  helperText,
  invalid = false,
  errorMessage,
  placeholder = "Start typing…",
  disabled = false,
  readOnly = false,
  formats = DEFAULT_FORMATS,
  toolbar = true,
  statusBar,
  onAutoSave,
  autoSaveInterval = 30000,
  rows = DEFAULT_ROWS,
  maxLength,
  className,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...htmlProps
}: EditorProps & { hasTipTap: boolean }) {
  const contentRef = React.useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useControllableState(controlledValue, defaultValue, onValueChange);

  const [saveStatus, setSaveStatus] = React.useState<EditorSaveStatus>("idle");

  const mode: EditorMode = hasTipTap ? "rich" : "markdown";

  const baseId = React.useId();
  const labelId = label ? `${baseId}-label` : undefined;
  const helperId = helperText ? `${baseId}-helper` : undefined;
  const errorId = invalid && errorMessage ? `${baseId}-error` : undefined;

  const textboxProps: EditorTextboxProps = {
    "aria-label": ariaLabel,
    "aria-labelledby": mergeAriaIds(labelId, ariaLabelledBy),
    "aria-describedby": mergeAriaIds(helperId, errorId, ariaDescribedBy),
    "aria-invalid": invalid || undefined,
  };

  // TipTap editor instance (only when available)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the TipTap editor is an optional peer with no bundled types
  const tiptapEditor: any = hasTipTap
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any -- useEditor is loaded lazily from an optional peer
      (_useEditor as any)({
        extensions: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- StarterKit is loaded lazily from an optional peer
          (_StarterKit as any).configure({
            // One heading step: the type ladder has one heading size for prose.
            heading: { levels: [2] },
            blockquote: {},
            codeBlock: false,
            horizontalRule: false,
            hardBreak: false,
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the Link extension is loaded lazily from an optional peer
          (_LinkExtension as any).configure({
            openOnClick: false,
            HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
          }),
        ],
        editorProps: {
          attributes: Object.fromEntries(
            Object.entries({
              role: "textbox",
              "aria-multiline": "true",
              ...textboxProps,
              "aria-invalid": textboxProps["aria-invalid"] ? "true" : undefined,
            }).filter(([, entry]) => entry !== undefined)
          ),
        },
        content: controlledValue !== undefined ? controlledValue : defaultValue,
        editable: !disabled && !readOnly,
        onUpdate: ({ editor: e }: { editor: { getHTML: () => string } }) => {
          const html = e.getHTML();
          setValue(html);
        },
      })
    : null;

  // Sync controlled value to TipTap
  React.useEffect(() => {
    if (tiptapEditor && controlledValue !== undefined) {
      const currentContent = tiptapEditor.getHTML();
      if (currentContent !== controlledValue) {
        tiptapEditor.commands.setContent(controlledValue, false);
      }
    }
  }, [controlledValue, tiptapEditor]);

  // Update editable state. Disabled stays selectable, so the textbox says so
  // with aria-disabled rather than leaving the reader to infer it.
  React.useEffect(() => {
    if (tiptapEditor) {
      tiptapEditor.setEditable(!disabled && !readOnly);
      const dom: HTMLElement | undefined = tiptapEditor.view?.dom;
      if (disabled) dom?.setAttribute("aria-disabled", "true");
      else dom?.removeAttribute("aria-disabled");
    }
  }, [tiptapEditor, disabled, readOnly]);

  // Auto-save
  React.useEffect(() => {
    if (!onAutoSave || !value) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      setSaveStatus("saving");
      try {
        Promise.resolve(onAutoSave(value))
          .then(() => {
            if (!cancelled) {
              setSaveStatus("saved");
            }
          })
          .catch(() => {
            if (!cancelled) {
              setSaveStatus("error");
            }
          });
      } catch {
        if (!cancelled) {
          setSaveStatus("error");
        }
      }
    }, autoSaveInterval);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, onAutoSave, autoSaveInterval]);

  const toggleFormat = React.useCallback(
    (format: EditorFormat) => {
      if (disabled || readOnly) return;

      if (tiptapEditor) {
        switch (format) {
          case "bold":
            tiptapEditor.chain().focus().toggleBold().run();
            break;
          case "italic":
            tiptapEditor.chain().focus().toggleItalic().run();
            break;
          case "strikethrough":
            tiptapEditor.chain().focus().toggleStrike().run();
            break;
          case "code":
            tiptapEditor.chain().focus().toggleCode().run();
            break;
          case "bulletList":
            tiptapEditor.chain().focus().toggleBulletList().run();
            break;
          case "orderedList":
            tiptapEditor.chain().focus().toggleOrderedList().run();
            break;
          case "heading":
            tiptapEditor.chain().focus().toggleHeading({ level: 2 }).run();
            break;
          case "blockquote":
            tiptapEditor.chain().focus().toggleBlockquote().run();
            break;
          case "undo":
            tiptapEditor.chain().focus().undo().run();
            break;
          case "redo":
            tiptapEditor.chain().focus().redo().run();
            break;
          case "link": {
            const previousUrl = tiptapEditor.getAttributes("link").href;
            if (previousUrl) {
              tiptapEditor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt("Enter URL");
              if (url) {
                tiptapEditor.chain().focus().setLink({ href: url }).run();
              }
            }
            break;
          }
        }
      } else if (contentRef.current) {
        applyMarkdownFormat(format, contentRef.current, setValue);
      }
    },
    [disabled, readOnly, tiptapEditor, setValue]
  );

  const isFormatActive = React.useCallback(
    (format: EditorFormat): boolean => {
      if (!tiptapEditor) return false;
      switch (format) {
        case "strikethrough":
          return tiptapEditor.isActive("strike");
        case "heading":
          return tiptapEditor.isActive("heading", { level: 2 });
        case "undo":
        case "redo":
          return false; // Actions don't have active state
        default:
          return tiptapEditor.isActive(format);
      }
    },
    [tiptapEditor]
  );

  const plainText: string = tiptapEditor ? (tiptapEditor.getText?.() ?? "") : value;
  const wordCount = countWords(plainText);
  const charCount = plainText.length;

  const contextValue: EditorContextValue = {
    value,
    setValue,
    placeholder,
    disabled,
    readOnly,
    invalid,
    formats,
    editor: tiptapEditor,
    mode,
    maxLength,
    wordCount,
    charCount,
    toggleFormat,
    isFormatActive,
    saveStatus,
    contentRef,
    textboxProps,
  };

  const hasCustomChildren = children !== undefined;
  // Counts by default are noise: the bar shows up when there is a limit or a save.
  const showStatusBar = statusBar ?? (maxLength !== undefined || onAutoSave !== undefined);

  return (
    <EditorContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        className={[styles.root, className].filter(Boolean).join(" ")}
        style={{ ...style, "--_fui-editor-rows": rows } as React.CSSProperties}
      >
        {label && (
          <span id={labelId} className={styles.label}>
            {label}
          </span>
        )}
        <div
          className={styles.editor}
          data-disabled={disabled || undefined}
          data-readonly={readOnly || undefined}
          data-invalid={invalid || undefined}
        >
          {hasCustomChildren ? (
            children
          ) : (
            <>
              {toolbar && (
                <EditorToolbar>
                  <EditorToolbarGroup aria-label="Text formatting">
                    {formats.map((f) => (
                      <EditorToolbarButton key={f} format={f} />
                    ))}
                  </EditorToolbarGroup>
                </EditorToolbar>
              )}
              <EditorContentArea />
              {showStatusBar && (
                <EditorStatusBar showWordCount={maxLength === undefined} showCharCount>
                  {onAutoSave && <EditorStatusIndicator />}
                </EditorStatusBar>
              )}
            </>
          )}
        </div>
        {helperText && (
          <p id={helperId} className={styles.helper}>
            {helperText}
          </p>
        )}
        {errorId && (
          <p id={errorId} className={styles.error}>
            <WarningCircle aria-hidden="true" weight="bold" className={styles.errorIcon} />
            {errorMessage}
          </p>
        )}
      </div>
    </EditorContext.Provider>
  );
}

const ROVING_KEYS = new Set(["ArrowLeft", "ArrowRight", "Home", "End"]);

/**
 * The formatting toolbar: one tab stop, arrow keys move between its buttons
 * (Home and End jump to the ends). Hidden while the editor is read-only.
 */
function EditorToolbar({
  children,
  "aria-label": ariaLabel = "Formatting",
  className,
}: EditorToolbarProps) {
  const { readOnly } = useEditorContext();
  const ref = React.useRef<HTMLDivElement>(null);
  const current = React.useRef(0);

  const items = () =>
    Array.from(ref.current?.querySelectorAll<HTMLElement>("button:not(:disabled)") ?? []);

  const applyTabStops = () => {
    const list = items();
    if (list.length === 0) return;
    const index = Math.min(current.current, list.length - 1);
    list.forEach((item, i) => {
      item.tabIndex = i === index ? 0 : -1;
    });
  };

  // Buttons enable and disable as the document changes (undo, redo), so the
  // single tab stop is re-placed after every render.
  React.useEffect(applyTabStops);

  if (readOnly) return null;

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const index = items().indexOf(event.target as HTMLElement);
    if (index < 0) return;
    current.current = index;
    applyTabStops();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!ROVING_KEYS.has(event.key)) return;
    const list = items();
    if (list.length === 0) return;
    event.preventDefault();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const last = list.length - 1;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowRight"
            ? index >= last
              ? 0
              : index + 1
            : index <= 0
              ? last
              : index - 1;
    list[next].focus();
  };

  return (
    <div
      ref={ref}
      className={[styles.toolbar, className].filter(Boolean).join(" ")}
      role="toolbar"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

function EditorToolbarGroup({
  children,
  "aria-label": ariaLabel,
  className,
}: EditorToolbarGroupProps) {
  const classes = [styles.toolbarGroup, className].filter(Boolean).join(" ");
  return (
    <div className={classes} role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}

function EditorToolbarButton({ format, className }: EditorToolbarButtonProps) {
  const { toggleFormat, isFormatActive, disabled, readOnly, editor, mode } = useEditorContext();
  const meta = FORMAT_META[format];
  const isAction = ACTION_FORMATS.has(format);
  const active = isAction ? false : isFormatActive(format);

  // Action buttons (undo/redo) have special disable logic
  let isDisabled = disabled || readOnly;
  if (isAction && !isDisabled) {
    if (mode === "markdown") {
      // Undo/redo in textarea mode is handled natively by the browser
      isDisabled = true;
    } else if (editor) {
      isDisabled = format === "undo" ? !editor.can().undo() : !editor.can().redo();
    }
  }

  return (
    <IconButton
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => toggleFormat(format)}
      disabled={isDisabled}
      aria-label={meta.label}
      title={`${meta.label} (${meta.shortcut})`}
      pressed={isAction ? undefined : active}
    >
      <Icon icon={meta.icon} size="sm" />
    </IconButton>
  );
}

function EditorStatusIndicator({
  status: statusOverride,
  labels,
  className,
}: EditorStatusIndicatorProps) {
  const { saveStatus } = useEditorContext();
  const status = statusOverride ?? saveStatus;
  const mergedLabels = { ...DEFAULT_STATUS_LABELS, ...labels };
  const label = mergedLabels[status];

  if (!label) return null;

  const classes = [styles.statusIndicator, status === "error" && styles.statusError, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-live="polite" role="status">
      {status === "error" && (
        <WarningCircle aria-hidden="true" weight="bold" className={styles.errorIcon} />
      )}
      {label}
    </span>
  );
}

function EditorContentArea({ className }: EditorContentProps) {
  const {
    value,
    setValue,
    placeholder,
    disabled,
    readOnly,
    editor,
    mode,
    contentRef,
    textboxProps,
  } = useEditorContext();

  if (mode === "rich" && editor && _EditorContent) {
    const TipTapContent = _EditorContent;
    const classes = [styles.content, styles.contentRich, className].filter(Boolean).join(" ");
    return (
      <div className={classes} data-placeholder={placeholder}>
        <TipTapContent editor={editor} />
      </div>
    );
  }

  // Textarea fallback for markdown mode. Disabled is read-only plus
  // aria-disabled, so the text can still be selected and copied.
  const classes = [styles.content, className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <textarea
        ref={contentRef}
        className={styles.contentTextarea}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly || disabled}
        aria-disabled={disabled || undefined}
        {...textboxProps}
      />
    </div>
  );
}

function EditorStatusBar({
  showWordCount = true,
  showCharCount = true,
  children,
  className,
}: EditorStatusBarProps) {
  const { wordCount, charCount, maxLength } = useEditorContext();

  const classes = [styles.statusBar, className].filter(Boolean).join(" ");

  const over = maxLength !== undefined ? charCount - maxLength : 0;
  const isOverLimit = over > 0;
  const isNearLimit = maxLength !== undefined && !isOverLimit && charCount >= maxLength * 0.9;

  const charLimitClasses = [
    styles.statusBarItem,
    isNearLimit && styles.statusBarItemWarning,
    isOverLimit && styles.statusBarItemError,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="group" aria-label="Editor statistics">
      <div className={styles.statusBarStart}>{children}</div>
      <div className={styles.statusBarEnd}>
        {showWordCount && (
          <span className={styles.statusBarItem}>{plural(wordCount, "word", "words")}</span>
        )}
        {showWordCount && showCharCount && (
          <Separator orientation="vertical" length="control" className={styles.statusSeparator} />
        )}
        {showCharCount && (
          <span className={charLimitClasses}>
            {maxLength === undefined
              ? plural(charCount, "character", "characters")
              : isOverLimit
                ? `${charCount} / ${maxLength}, ${over} over`
                : `${charCount} / ${maxLength}`}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// Export compound component
// ============================================

export const Editor = Object.assign(EditorRoot, {
  Root: EditorRoot,
  /** Start resolving TipTap before first render (optional). */
  preload: loadTipTapDeps,
  Toolbar: EditorToolbar,
  ToolbarGroup: EditorToolbarGroup,
  ToolbarButton: EditorToolbarButton,
  StatusIndicator: EditorStatusIndicator,
  Content: EditorContentArea,
  StatusBar: EditorStatusBar,
});

export { useEditorContext };
