'use client';

// ============================================
// Keyboard Shortcuts Registry
// ============================================
//
// Central source of truth for all keyboard shortcuts in @fragments-sdk/ui.
// Import from here instead of hardcoding key combinations in components.
//
// This prevents conflicts (e.g., Sidebar Ctrl+B vs Editor Ctrl+B) and
// makes shortcuts discoverable for documentation and customization.
//
// ADDING A SHORTCUT:
//   1. Add an entry to KEYBOARD_SHORTCUTS below
//   2. Import the constant in your component
//   3. Use useKeyboardShortcut() or matchesShortcut() in your component
//
// CUSTOMIZING SHORTCUTS (consumer API):
//   configureShortcuts({ SIDEBAR_TOGGLE: { key: '\\', label: 'Ctrl+\\' } })
//   configureShortcuts({ SIDEBAR_TOGGLE: null })  // disable
//

import { useEffect, useRef, type RefObject } from 'react';

// ============================================
// Types
// ============================================

export interface KeyboardShortcut {
  /** The key to match (e.g., 'b', 'k', 'Escape'). Case-insensitive. */
  key: string;
  /** Require Ctrl (Windows/Linux) or Cmd (macOS) */
  meta?: boolean;
  /** Require Shift */
  shift?: boolean;
  /** Require Alt/Option */
  alt?: boolean;
  /** Human-readable label for display (e.g., "Ctrl+B", "⌘B") */
  label: string;
  /** Which component owns this shortcut */
  component: string;
  /** What the shortcut does */
  description: string;
  /**
   * Scope controls when the shortcut is active:
   * - 'global': Listens on document (e.g., sidebar toggle)
   * - 'component': Only active when component is focused/mounted
   */
  scope: 'global' | 'component';
}

// ============================================
// Shortcut Definitions
// ============================================

export const KEYBOARD_SHORTCUTS = {
  // ----- Sidebar -----
  SIDEBAR_TOGGLE: {
    key: 'b',
    meta: true,
    label: 'Ctrl+B',
    component: 'Sidebar',
    description: 'Toggle sidebar collapse/expand',
    scope: 'global',
  },
  SIDEBAR_CLOSE_MOBILE: {
    key: 'Escape',
    label: 'Escape',
    component: 'Sidebar',
    description: 'Close mobile sidebar drawer',
    scope: 'global',
  },

  // ----- Editor (TipTap handles these natively, metadata for display) -----
  EDITOR_BOLD: {
    key: 'b',
    meta: true,
    label: 'Ctrl+B',
    component: 'Editor',
    description: 'Toggle bold formatting',
    scope: 'component',
  },
  EDITOR_ITALIC: {
    key: 'i',
    meta: true,
    label: 'Ctrl+I',
    component: 'Editor',
    description: 'Toggle italic formatting',
    scope: 'component',
  },
  EDITOR_STRIKETHROUGH: {
    key: 's',
    meta: true,
    shift: true,
    label: 'Ctrl+Shift+S',
    component: 'Editor',
    description: 'Toggle strikethrough formatting',
    scope: 'component',
  },
  EDITOR_LINK: {
    key: 'k',
    meta: true,
    label: 'Ctrl+K',
    component: 'Editor',
    description: 'Insert or edit link',
    scope: 'component',
  },
  EDITOR_CODE: {
    key: 'e',
    meta: true,
    label: 'Ctrl+E',
    component: 'Editor',
    description: 'Toggle inline code',
    scope: 'component',
  },
  EDITOR_BULLET_LIST: {
    key: '8',
    meta: true,
    shift: true,
    label: 'Ctrl+Shift+8',
    component: 'Editor',
    description: 'Toggle bullet list',
    scope: 'component',
  },
  EDITOR_ORDERED_LIST: {
    key: '7',
    meta: true,
    shift: true,
    label: 'Ctrl+Shift+7',
    component: 'Editor',
    description: 'Toggle ordered list',
    scope: 'component',
  },
  EDITOR_HEADING1: {
    key: '1',
    meta: true,
    alt: true,
    label: 'Ctrl+Alt+1',
    component: 'Editor',
    description: 'Toggle heading level 1',
    scope: 'component',
  },
  EDITOR_HEADING2: {
    key: '2',
    meta: true,
    alt: true,
    label: 'Ctrl+Alt+2',
    component: 'Editor',
    description: 'Toggle heading level 2',
    scope: 'component',
  },
  EDITOR_HEADING3: {
    key: '3',
    meta: true,
    alt: true,
    label: 'Ctrl+Alt+3',
    component: 'Editor',
    description: 'Toggle heading level 3',
    scope: 'component',
  },
  EDITOR_BLOCKQUOTE: {
    key: 'b',
    meta: true,
    shift: true,
    label: 'Ctrl+Shift+B',
    component: 'Editor',
    description: 'Toggle blockquote',
    scope: 'component',
  },
  EDITOR_UNDO: {
    key: 'z',
    meta: true,
    label: 'Ctrl+Z',
    component: 'Editor',
    description: 'Undo last action',
    scope: 'component',
  },
  EDITOR_REDO: {
    key: 'z',
    meta: true,
    shift: true,
    label: 'Ctrl+Shift+Z',
    component: 'Editor',
    description: 'Redo last undone action',
    scope: 'component',
  },

  // ----- Prompt -----
  PROMPT_SUBMIT: {
    key: 'Enter',
    label: 'Enter',
    component: 'Prompt',
    description: 'Submit prompt (when submitOnEnter is true)',
    scope: 'component',
  },

  // ----- NavigationMenu -----
  NAV_TOGGLE: {
    key: 'Enter',
    label: 'Enter',
    component: 'NavigationMenu',
    description: 'Toggle menu item open/closed',
    scope: 'component',
  },
  NAV_CLOSE: {
    key: 'Escape',
    label: 'Escape',
    component: 'NavigationMenu',
    description: 'Close menu and return focus to trigger',
    scope: 'component',
  },

  // ----- Command -----
  COMMAND_SELECT: {
    key: 'Enter',
    label: 'Enter',
    component: 'Command',
    description: 'Select active command item',
    scope: 'component',
  },

  // ----- Collapsible -----
  COLLAPSIBLE_TOGGLE: {
    key: 'Enter',
    label: 'Enter',
    component: 'Collapsible',
    description: 'Toggle collapsible open/closed',
    scope: 'component',
  },
} as const satisfies Record<string, KeyboardShortcut>;

export type ShortcutName = keyof typeof KEYBOARD_SHORTCUTS;

// ============================================
// Helpers
// ============================================

/**
 * Check if a KeyboardEvent matches a shortcut definition.
 *
 * Usage:
 * ```ts
 * import { KEYBOARD_SHORTCUTS, matchesShortcut } from '../../utils/keyboard-shortcuts';
 *
 * const handleKeyDown = (e: KeyboardEvent) => {
 *   if (matchesShortcut(e, KEYBOARD_SHORTCUTS.SIDEBAR_TOGGLE)) {
 *     e.preventDefault();
 *     toggleSidebar();
 *   }
 * };
 * ```
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  if (shortcut.meta && !(event.metaKey || event.ctrlKey)) return false;
  if (shortcut.shift && !event.shiftKey) return false;
  if (shortcut.alt && !event.altKey) return false;

  // For modifier-only checks, ensure no extra modifiers are pressed
  if (!shortcut.meta && (event.metaKey || event.ctrlKey)) return false;
  if (!shortcut.shift && event.shiftKey) return false;
  if (!shortcut.alt && event.altKey) return false;

  return event.key.toLowerCase() === shortcut.key.toLowerCase();
}

/**
 * Get a human-readable shortcut label, adapting for macOS vs other platforms.
 * Returns "⌘B" on Mac, "Ctrl+B" elsewhere.
 */
export function getShortcutLabel(shortcut: KeyboardShortcut): string {
  if (typeof navigator === 'undefined') return shortcut.label;

  const isMac = navigator.platform?.includes('Mac') || navigator.userAgent?.includes('Mac');
  if (!isMac) return shortcut.label;

  const parts: string[] = [];
  if (shortcut.meta) parts.push('⌘');
  if (shortcut.shift) parts.push('⇧');
  if (shortcut.alt) parts.push('⌥');
  parts.push(shortcut.key.toUpperCase());
  return parts.join('');
}

/**
 * Find all shortcuts that conflict with a given shortcut (same key combo, different component).
 * Useful for debugging and documentation.
 */
export function findConflicts(name: ShortcutName): KeyboardShortcut[] {
  const target = KEYBOARD_SHORTCUTS[name] as KeyboardShortcut;
  return (Object.entries(KEYBOARD_SHORTCUTS) as [string, KeyboardShortcut][])
    .filter(([key, shortcut]) => {
      if (key === name) return false;
      return (
        shortcut.key.toLowerCase() === target.key.toLowerCase() &&
        !!shortcut.meta === !!target.meta &&
        !!shortcut.shift === !!target.shift &&
        !!shortcut.alt === !!target.alt
      );
    })
    .map(([, shortcut]) => shortcut);
}

/**
 * Get all registered shortcuts, optionally filtered by component or scope.
 */
export function getShortcuts(filter?: { component?: string; scope?: 'global' | 'component' }): KeyboardShortcut[] {
  return (Object.values(KEYBOARD_SHORTCUTS) as KeyboardShortcut[]).filter((shortcut) => {
    if (filter?.component && shortcut.component !== filter.component) return false;
    if (filter?.scope && shortcut.scope !== filter.scope) return false;
    return true;
  });
}

// ============================================
// Editable Element Detection
// ============================================

/** Text-like input types where typing shortcuts should not fire global handlers */
const TEXT_INPUT_TYPES = new Set([
  'text', 'search', 'url', 'tel', 'email', 'password', 'number',
]);

/**
 * Check if an element is an editable area (input, textarea, contenteditable, role="textbox").
 * Global shortcuts should skip firing when the user is typing in one of these.
 */
export function isEditableElement(element: Element | null): boolean {
  if (!element || !('tagName' in element)) return false;

  const tag = element.tagName;

  // <textarea>
  if (tag === 'TEXTAREA') return true;

  // <input> with text-like type
  if (tag === 'INPUT') {
    const type = (element as HTMLInputElement).type?.toLowerCase() || 'text';
    return TEXT_INPUT_TYPES.has(type);
  }

  // contenteditable="true" or contenteditable=""
  const htmlEl = element as HTMLElement;
  if (htmlEl.isContentEditable) return true;
  // Fallback: check attribute directly (isContentEditable can be unreliable for detached elements)
  const ceAttr = htmlEl.contentEditable;
  if (ceAttr === 'true' || ceAttr === '') return true;

  // role="textbox" (TipTap uses this)
  if (typeof element.getAttribute === 'function' && element.getAttribute('role') === 'textbox') return true;

  // Check ancestors for contenteditable (e.g., a <p> inside a [contenteditable] div)
  // Walk up manually because jsdom's closest doesn't reliably match property-set contentEditable
  let ancestor = element.parentElement;
  while (ancestor) {
    if ((ancestor as HTMLElement).isContentEditable) return true;
    const ancestorCe = (ancestor as HTMLElement).contentEditable;
    if (ancestorCe === 'true' || ancestorCe === '') return true;
    ancestor = ancestor.parentElement;
  }

  return false;
}

// ============================================
// Shortcut Override API
// ============================================

/** Module-level override store. null = disabled, Partial<KeyboardShortcut> = merged with default. */
const shortcutOverrides = new Map<ShortcutName, Partial<KeyboardShortcut> | null>();

/**
 * Configure shortcut overrides at app startup. Mirrors the `configureTheme()` API.
 *
 * - Partial overrides merge with the default (e.g., `{ key: '\\' }` keeps label/component/etc.)
 * - `null` disables a shortcut entirely
 * - Omitted keys are left unchanged
 * - Multiple calls merge additively (last write wins per key)
 *
 * @example
 * ```ts
 * import { configureShortcuts } from '@fragments-sdk/ui';
 *
 * // Remap sidebar toggle to Ctrl+\
 * configureShortcuts({ SIDEBAR_TOGGLE: { key: '\\', label: 'Ctrl+\\' } });
 *
 * // Disable sidebar toggle entirely
 * configureShortcuts({ SIDEBAR_TOGGLE: null });
 * ```
 */
export function configureShortcuts(
  overrides: Partial<Record<ShortcutName, Partial<KeyboardShortcut> | null>>
): void {
  for (const [name, value] of Object.entries(overrides) as [ShortcutName, Partial<KeyboardShortcut> | null][]) {
    if (!(name in KEYBOARD_SHORTCUTS)) continue;
    if (value === undefined) continue;
    shortcutOverrides.set(name, value);
  }
}

/**
 * Resolve a shortcut by name, applying any overrides.
 * Returns `null` if the shortcut has been disabled via `configureShortcuts({ name: null })`.
 */
export function getResolvedShortcut(name: ShortcutName): KeyboardShortcut | null {
  const override = shortcutOverrides.get(name);

  // Explicitly disabled
  if (override === null) return null;

  const defaultShortcut = KEYBOARD_SHORTCUTS[name] as KeyboardShortcut;

  // No override — return default
  if (override === undefined) return defaultShortcut;

  // Merge override into default
  return { ...defaultShortcut, ...override };
}

/**
 * Clear all shortcut overrides. Primarily useful for tests.
 */
export function resetShortcutOverrides(): void {
  shortcutOverrides.clear();
}

// ============================================
// useKeyboardShortcut Hook
// ============================================

export interface UseKeyboardShortcutOptions {
  /** Shortcut name from KEYBOARD_SHORTCUTS */
  name: ShortcutName;
  /** Handler called when the shortcut fires */
  handler: () => void;
  /** Whether the shortcut is active (default: true) */
  enabled?: boolean;
  /**
   * Override the shortcut's scope for this registration:
   * - 'global': listens on `document`, skips editable elements
   * - 'component': listens on `ref` element only
   * If omitted, uses the scope from the shortcut definition.
   */
  scope?: 'global' | 'component';
  /** Required when scope is 'component' — the element to attach the listener to */
  ref?: RefObject<Element | null>;
}

/**
 * Register a keyboard shortcut handler with automatic scope and editable-area handling.
 *
 * For global shortcuts, automatically skips when focus is in an editable element
 * (input, textarea, contenteditable, role="textbox") so component-scoped shortcuts
 * like Editor's Ctrl+B take precedence over Sidebar's Ctrl+B.
 *
 * Respects `configureShortcuts()` overrides — if a shortcut is remapped or disabled,
 * the hook automatically adapts.
 *
 * @example
 * ```tsx
 * useKeyboardShortcut({
 *   name: 'SIDEBAR_TOGGLE',
 *   handler: toggleSidebar,
 *   enabled: enableKeyboardShortcut && collapsible !== 'none',
 * });
 * ```
 */
export function useKeyboardShortcut({
  name,
  handler,
  enabled = true,
  scope: scopeOverride,
  ref,
}: UseKeyboardShortcutOptions): void {
  // Use a ref for handler to avoid re-subscribing on every render
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const resolved = getResolvedShortcut(name);
    if (!resolved) return; // disabled via configureShortcuts

    const effectiveScope = scopeOverride ?? resolved.scope;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!matchesShortcut(e, resolved)) return;

      // Global shortcuts skip editable elements
      if (effectiveScope === 'global' && isEditableElement(e.target as Element)) return;

      e.preventDefault();
      handlerRef.current();
    };

    const target = effectiveScope === 'component' ? ref?.current : document;
    if (!target) return;

    target.addEventListener('keydown', handleKeyDown as EventListener);
    return () => target.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [name, enabled, scopeOverride, ref]);
}
