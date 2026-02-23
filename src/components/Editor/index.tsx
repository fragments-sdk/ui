'use client';

import * as React from 'react';
import styles from './Editor.module.scss';
import {
  TextB,
  TextItalic,
  TextStrikethrough,
  LinkSimple,
  Code,
  ListBullets,
  ListNumbers,
  TextHOne,
  TextHTwo,
  TextHThree,
  Quotes,
  ArrowCounterClockwise,
  ArrowClockwise,
} from '@phosphor-icons/react';
import { KEYBOARD_SHORTCUTS } from '../../utils/keyboard-shortcuts';

// ============================================
// Lazy-loaded dependency (TipTap)
// ============================================

let _useEditor: ((config: Record<string, unknown>) => unknown) | null = null;
let _EditorContent: React.ComponentType<Record<string, unknown>> | null = null;
let _StarterKit: unknown = null;
let _LinkExtension: unknown = null;
let _tiptapLoaded = false;
let _tiptapFailed = false;

function loadTipTapDeps() {
  if (_tiptapLoaded) return;
  _tiptapLoaded = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tiptapReact = require('@tiptap/react');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const starterKit = require('@tiptap/starter-kit');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const linkExt = require('@tiptap/extension-link');

    _useEditor = tiptapReact.useEditor;
    _EditorContent = tiptapReact.EditorContent;
    _StarterKit = starterKit.default ?? starterKit.StarterKit ?? starterKit;
    _LinkExtension = linkExt.default ?? linkExt.Link ?? linkExt;
  } catch {
    _tiptapFailed = true;
  }
}

// ============================================
// Types
// ============================================

export type EditorFormat =
  | 'bold' | 'italic' | 'strikethrough' | 'link' | 'code'
  | 'bulletList' | 'orderedList'
  | 'heading1' | 'heading2' | 'heading3'
  | 'blockquote'
  | 'undo' | 'redo';

export type EditorSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type EditorMode = 'rich' | 'markdown';

export type EditorSize = 'sm' | 'md' | 'lg';

export interface EditorToolbarIconRenderState {
  format: EditorFormat;
  active: boolean;
  disabled: boolean;
  readOnly: boolean;
  isDisabled: boolean;
  mode: EditorMode;
}

export type EditorToolbarIconSlot =
  | React.ReactNode
  | ((state: EditorToolbarIconRenderState) => React.ReactNode);

export type EditorToolbarIcons = Partial<Record<EditorFormat, EditorToolbarIconSlot>>;

export interface EditorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  children?: React.ReactNode;
  /** Controlled value */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Called when content changes */
  onValueChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the editor */
  disabled?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** Which format buttons to show */
  formats?: EditorFormat[];
  /** Show default toolbar */
  toolbar?: boolean;
  /** Show default status bar */
  statusBar?: boolean;
  /** Auto-save callback (sync or async) */
  onAutoSave?: (value: string) => void | Promise<void>;
  /** Auto-save interval in ms */
  autoSaveInterval?: number;
  /** Editor size preset */
  size?: EditorSize;
  /** Maximum character count (shows indicator in status bar) */
  maxLength?: number;
  /** Custom toolbar icons keyed by format/action, for any icon package */
  toolbarIcons?: EditorToolbarIcons;
}

export interface EditorToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export interface EditorToolbarGroupProps {
  children: React.ReactNode;
  'aria-label'?: string;
  className?: string;
}

export interface EditorToolbarButtonProps {
  /** Which format this button toggles */
  format: EditorFormat;
  className?: string;
}

export interface EditorSeparatorProps {
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
  className?: string;
}

// ============================================
// Format metadata
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FORMAT_META: Record<EditorFormat, { icon: React.ComponentType<any>; label: string; shortcut: string }> = {
  bold: { icon: TextB, label: 'Bold', shortcut: KEYBOARD_SHORTCUTS.EDITOR_BOLD.label },
  italic: { icon: TextItalic, label: 'Italic', shortcut: KEYBOARD_SHORTCUTS.EDITOR_ITALIC.label },
  strikethrough: { icon: TextStrikethrough, label: 'Strikethrough', shortcut: KEYBOARD_SHORTCUTS.EDITOR_STRIKETHROUGH.label },
  link: { icon: LinkSimple, label: 'Link', shortcut: KEYBOARD_SHORTCUTS.EDITOR_LINK.label },
  code: { icon: Code, label: 'Code', shortcut: KEYBOARD_SHORTCUTS.EDITOR_CODE.label },
  bulletList: { icon: ListBullets, label: 'Bullet list', shortcut: KEYBOARD_SHORTCUTS.EDITOR_BULLET_LIST.label },
  orderedList: { icon: ListNumbers, label: 'Ordered list', shortcut: KEYBOARD_SHORTCUTS.EDITOR_ORDERED_LIST.label },
  heading1: { icon: TextHOne, label: 'Heading 1', shortcut: KEYBOARD_SHORTCUTS.EDITOR_HEADING1.label },
  heading2: { icon: TextHTwo, label: 'Heading 2', shortcut: KEYBOARD_SHORTCUTS.EDITOR_HEADING2.label },
  heading3: { icon: TextHThree, label: 'Heading 3', shortcut: KEYBOARD_SHORTCUTS.EDITOR_HEADING3.label },
  blockquote: { icon: Quotes, label: 'Blockquote', shortcut: KEYBOARD_SHORTCUTS.EDITOR_BLOCKQUOTE.label },
  undo: { icon: ArrowCounterClockwise, label: 'Undo', shortcut: KEYBOARD_SHORTCUTS.EDITOR_UNDO.label },
  redo: { icon: ArrowClockwise, label: 'Redo', shortcut: KEYBOARD_SHORTCUTS.EDITOR_REDO.label },
};

const DEFAULT_FORMATS: EditorFormat[] = ['bold', 'italic', 'strikethrough', 'link', 'code', 'bulletList'];

/** Formats that are actions (not toggles) — no aria-pressed, different disable logic */
const ACTION_FORMATS = new Set<EditorFormat>(['undo', 'redo']);

const DEFAULT_STATUS_LABELS: Record<EditorSaveStatus, string> = {
  idle: '',
  saving: 'SAVING...',
  saved: 'AUTO-SAVED',
  error: 'SAVE FAILED',
};

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
  setValue: (v: string) => void,
) {
  const sel = getSelection(textarea);
  const before = textarea.value.substring(0, sel.start);
  const after = textarea.value.substring(sel.end);
  const wrapped = `${prefix}${sel.text || 'text'}${suffix}`;
  const newValue = `${before}${wrapped}${after}`;
  setValue(newValue);

  requestAnimationFrame(() => {
    textarea.focus();
    const newStart = sel.start + prefix.length;
    const newEnd = newStart + (sel.text || 'text').length;
    textarea.setSelectionRange(newStart, newEnd);
  });
}

function applyMarkdownFormat(
  format: EditorFormat,
  textarea: HTMLTextAreaElement,
  setValue: (v: string) => void,
) {
  switch (format) {
    case 'bold':
      wrapSelection(textarea, '**', '**', setValue);
      break;
    case 'italic':
      wrapSelection(textarea, '*', '*', setValue);
      break;
    case 'strikethrough':
      wrapSelection(textarea, '~~', '~~', setValue);
      break;
    case 'code':
      wrapSelection(textarea, '`', '`', setValue);
      break;
    case 'link': {
      const sel = getSelection(textarea);
      const linkText = sel.text || 'link text';
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
    case 'bulletList': {
      const sel = getSelection(textarea);
      const before = textarea.value.substring(0, sel.start);
      const after = textarea.value.substring(sel.end);
      const lines = (sel.text || 'item').split('\n');
      const bulleted = lines.map((l) => `- ${l}`).join('\n');
      const newValue = `${before}${bulleted}${after}`;
      setValue(newValue);
      break;
    }
    case 'orderedList': {
      const sel = getSelection(textarea);
      const before = textarea.value.substring(0, sel.start);
      const after = textarea.value.substring(sel.end);
      const lines = (sel.text || 'item').split('\n');
      const numbered = lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
      const newValue = `${before}${numbered}${after}`;
      setValue(newValue);
      break;
    }
    case 'heading1':
      wrapSelection(textarea, '# ', '', setValue);
      break;
    case 'heading2':
      wrapSelection(textarea, '## ', '', setValue);
      break;
    case 'heading3':
      wrapSelection(textarea, '### ', '', setValue);
      break;
    case 'blockquote': {
      const sel = getSelection(textarea);
      const before = textarea.value.substring(0, sel.start);
      const after = textarea.value.substring(sel.end);
      const lines = (sel.text || 'quote').split('\n');
      const quoted = lines.map((l) => `> ${l}`).join('\n');
      const newValue = `${before}${quoted}${after}`;
      setValue(newValue);
      break;
    }
    case 'undo':
    case 'redo':
      // Undo/redo in textarea mode is handled natively by the browser
      break;
  }
}

// ============================================
// Context
// ============================================

interface EditorContextValue {
  value: string;
  setValue: (v: string) => void;
  placeholder: string;
  disabled: boolean;
  readOnly: boolean;
  formats: EditorFormat[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any | null;
  mode: EditorMode;
  size: EditorSize;
  maxLength?: number;
  toolbarIcons?: EditorToolbarIcons;
  wordCount: number;
  charCount: number;
  toggleFormat: (f: EditorFormat) => void;
  isFormatActive: (f: EditorFormat) => boolean;
  saveStatus: EditorSaveStatus;
  contentRef: React.RefObject<HTMLTextAreaElement | null>;
}

const EditorContext = React.createContext<EditorContextValue | null>(null);

function useEditorContext() {
  const context = React.useContext(EditorContext);
  if (!context) {
    throw new Error('Editor compound components must be used within an Editor');
  }
  return context;
}

// ============================================
// Hooks
// ============================================

function useControllableState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
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
    [isControlled, onChange],
  );

  return [value, setValue];
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

// ============================================
// Components
// ============================================

function EditorRoot({
  children,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  placeholder = 'Start typing...',
  disabled = false,
  readOnly = false,
  formats = DEFAULT_FORMATS,
  toolbar = true,
  statusBar = true,
  onAutoSave,
  autoSaveInterval = 30000,
  size = 'md',
  maxLength,
  toolbarIcons,
  className,
  ...htmlProps
}: EditorProps) {
  const contentRef = React.useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useControllableState(
    controlledValue,
    defaultValue,
    onValueChange,
  );

  const [saveStatus, setSaveStatus] = React.useState<EditorSaveStatus>('idle');

  // Try loading TipTap
  loadTipTapDeps();
  const hasTipTap = !_tiptapFailed && _useEditor && _EditorContent && _StarterKit;
  const mode: EditorMode = hasTipTap ? 'rich' : 'markdown';

  // TipTap editor instance (only when available)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tiptapEditor: any = hasTipTap
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_useEditor as any)({
        extensions: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (_StarterKit as any).configure({
            heading: { levels: [1, 2, 3] },
            blockquote: {},
            codeBlock: false,
            horizontalRule: false,
            hardBreak: false,
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (_LinkExtension as any).configure({
            openOnClick: false,
            HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
          }),
        ],
        editorProps: {
          attributes: {
            role: 'textbox',
            'aria-label': placeholder,
            'aria-multiline': 'true',
          },
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

  // Update editable state
  React.useEffect(() => {
    if (tiptapEditor) {
      tiptapEditor.setEditable(!disabled && !readOnly);
    }
  }, [tiptapEditor, disabled, readOnly]);

  // Auto-save
  React.useEffect(() => {
    if (!onAutoSave || !value) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      try {
        Promise.resolve(onAutoSave(value))
          .then(() => {
            if (!cancelled) {
              setSaveStatus('saved');
            }
          })
          .catch(() => {
            if (!cancelled) {
              setSaveStatus('error');
            }
          });
      } catch {
        if (!cancelled) {
          setSaveStatus('error');
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
          case 'bold':
            tiptapEditor.chain().focus().toggleBold().run();
            break;
          case 'italic':
            tiptapEditor.chain().focus().toggleItalic().run();
            break;
          case 'strikethrough':
            tiptapEditor.chain().focus().toggleStrike().run();
            break;
          case 'code':
            tiptapEditor.chain().focus().toggleCode().run();
            break;
          case 'bulletList':
            tiptapEditor.chain().focus().toggleBulletList().run();
            break;
          case 'orderedList':
            tiptapEditor.chain().focus().toggleOrderedList().run();
            break;
          case 'heading1':
            tiptapEditor.chain().focus().toggleHeading({ level: 1 }).run();
            break;
          case 'heading2':
            tiptapEditor.chain().focus().toggleHeading({ level: 2 }).run();
            break;
          case 'heading3':
            tiptapEditor.chain().focus().toggleHeading({ level: 3 }).run();
            break;
          case 'blockquote':
            tiptapEditor.chain().focus().toggleBlockquote().run();
            break;
          case 'undo':
            tiptapEditor.chain().focus().undo().run();
            break;
          case 'redo':
            tiptapEditor.chain().focus().redo().run();
            break;
          case 'link': {
            const previousUrl = tiptapEditor.getAttributes('link').href;
            if (previousUrl) {
              tiptapEditor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt('Enter URL');
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
    [disabled, readOnly, tiptapEditor, setValue],
  );

  const isFormatActive = React.useCallback(
    (format: EditorFormat): boolean => {
      if (!tiptapEditor) return false;
      switch (format) {
        case 'bold':
          return tiptapEditor.isActive('bold');
        case 'italic':
          return tiptapEditor.isActive('italic');
        case 'strikethrough':
          return tiptapEditor.isActive('strike');
        case 'code':
          return tiptapEditor.isActive('code');
        case 'bulletList':
          return tiptapEditor.isActive('bulletList');
        case 'orderedList':
          return tiptapEditor.isActive('orderedList');
        case 'heading1':
          return tiptapEditor.isActive('heading', { level: 1 });
        case 'heading2':
          return tiptapEditor.isActive('heading', { level: 2 });
        case 'heading3':
          return tiptapEditor.isActive('heading', { level: 3 });
        case 'blockquote':
          return tiptapEditor.isActive('blockquote');
        case 'link':
          return tiptapEditor.isActive('link');
        case 'undo':
        case 'redo':
          return false; // Actions don't have active state
        default:
          return false;
      }
    },
    [tiptapEditor],
  );

  const wordCount = React.useMemo(() => {
    if (tiptapEditor) {
      const text = tiptapEditor.getText?.() ?? '';
      return countWords(text);
    }
    return countWords(value);
  }, [value, tiptapEditor]);

  const charCount = React.useMemo(() => {
    if (tiptapEditor) {
      return (tiptapEditor.getText?.() ?? '').length;
    }
    return value.length;
  }, [value, tiptapEditor]);

  const contextValue: EditorContextValue = {
    value,
    setValue,
    placeholder,
    disabled,
    readOnly,
    formats,
    editor: tiptapEditor,
    mode,
    size,
    maxLength,
    toolbarIcons,
    wordCount,
    charCount,
    toggleFormat,
    isFormatActive,
    saveStatus,
    contentRef,
  };

  const classes = [
    styles.editor,
    disabled && styles.disabled,
    readOnly && styles.readOnly,
    className,
  ].filter(Boolean).join(' ');

  const hasCustomChildren = children !== undefined;

  return (
    <EditorContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        className={classes}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-size={size}
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
            {statusBar && <EditorStatusBar showWordCount showCharCount />}
          </>
        )}
      </div>
    </EditorContext.Provider>
  );
}

function EditorToolbar({ children, className }: EditorToolbarProps) {
  const classes = [styles.toolbar, className].filter(Boolean).join(' ');
  return (
    <div className={classes} role="toolbar" aria-label="Editor formatting">
      {children}
    </div>
  );
}

function EditorToolbarGroup({ children, 'aria-label': ariaLabel, className }: EditorToolbarGroupProps) {
  const classes = [styles.toolbarGroup, className].filter(Boolean).join(' ');
  return (
    <div className={classes} role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}

function EditorToolbarButton({ format, className }: EditorToolbarButtonProps) {
  const { toggleFormat, isFormatActive, disabled, readOnly, editor, mode, toolbarIcons } = useEditorContext();
  const meta = FORMAT_META[format];
  const isAction = ACTION_FORMATS.has(format);
  const active = isAction ? false : isFormatActive(format);
  const IconComponent = meta.icon;

  // Action buttons (undo/redo) have special disable logic
  let isDisabled = disabled || readOnly;
  if (isAction && !isDisabled) {
    if (mode === 'markdown') {
      // Undo/redo in textarea mode is handled natively by the browser
      isDisabled = true;
    } else if (editor) {
      isDisabled = format === 'undo' ? !editor.can().undo() : !editor.can().redo();
    }
  }

  const iconState: EditorToolbarIconRenderState = {
    format,
    active,
    disabled,
    readOnly,
    isDisabled,
    mode,
  };

  const iconOverride = toolbarIcons?.[format];
  const renderedOverride = typeof iconOverride === 'function'
    ? iconOverride(iconState)
    : iconOverride;

  const classes = [
    styles.toolbarButton,
    active && styles.toolbarButtonActive,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={() => toggleFormat(format)}
      disabled={isDisabled}
      aria-label={meta.label}
      title={`${meta.label} (${meta.shortcut})`}
      {...(isAction ? {} : { 'aria-pressed': active })}
    >
      {iconOverride !== undefined
        ? renderedOverride
        : <IconComponent size={16} weight={active ? 'bold' : 'regular'} />}
    </button>
  );
}

function EditorSeparator({ className }: EditorSeparatorProps) {
  const classes = [styles.separator, className].filter(Boolean).join(' ');
  return <div className={classes} role="separator" aria-orientation="vertical" />;
}

function EditorStatusIndicator({ status: statusOverride, labels, className }: EditorStatusIndicatorProps) {
  const { saveStatus } = useEditorContext();
  const status = statusOverride ?? saveStatus;
  const mergedLabels = { ...DEFAULT_STATUS_LABELS, ...labels };
  const label = mergedLabels[status];

  if (!label) return null;

  const classes = [
    styles.statusIndicator,
    status === 'error' && styles.statusError,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} aria-live="polite" role="status">
      {label}
    </span>
  );
}

function EditorContentArea({ className }: EditorContentProps) {
  const { value, setValue, placeholder, disabled, readOnly, editor, mode, contentRef } =
    useEditorContext();

  if (mode === 'rich' && editor && _EditorContent) {
    const TipTapContent = _EditorContent;
    const classes = [styles.content, styles.contentRich, className].filter(Boolean).join(' ');
    return (
      <div className={classes} data-placeholder={placeholder}>
        <TipTapContent editor={editor} />
      </div>
    );
  }

  // Textarea fallback for markdown mode
  const classes = [styles.content, className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <textarea
        ref={contentRef}
        className={styles.contentTextarea}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-label={placeholder}
      />
    </div>
  );
}

function EditorStatusBar({ showWordCount = true, showCharCount = true, className }: EditorStatusBarProps) {
  const { wordCount, charCount, maxLength } = useEditorContext();

  const classes = [styles.statusBar, className].filter(Boolean).join(' ');

  const isOverLimit = maxLength !== undefined && charCount > maxLength;
  const isNearLimit = maxLength !== undefined && !isOverLimit && charCount >= maxLength * 0.9;

  const charLimitClasses = [
    styles.statusBarItem,
    isNearLimit && styles.statusBarItemWarning,
    isOverLimit && styles.statusBarItemError,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} aria-label="Editor statistics">
      <div className={styles.statusBarLeft} />
      <div className={styles.statusBarRight}>
        {showWordCount && (
          <span className={styles.statusBarItem}>
            {wordCount} {wordCount === 1 ? 'Word' : 'Words'}
          </span>
        )}
        {showWordCount && showCharCount && (
          <EditorSeparator />
        )}
        {showCharCount && (
          <span className={charLimitClasses}>
            {maxLength !== undefined
              ? `${charCount} / ${maxLength}`
              : `${charCount} ${charCount === 1 ? 'Character' : 'Characters'}`
            }
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
  Toolbar: EditorToolbar,
  ToolbarGroup: EditorToolbarGroup,
  ToolbarButton: EditorToolbarButton,
  Separator: EditorSeparator,
  StatusIndicator: EditorStatusIndicator,
  Content: EditorContentArea,
  StatusBar: EditorStatusBar,
});

export {
  EditorRoot,
  EditorToolbar,
  EditorToolbarGroup,
  EditorToolbarButton,
  EditorSeparator,
  EditorStatusIndicator,
  EditorContentArea,
  EditorStatusBar,
};

export { useEditorContext };
