import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  matchesShortcut,
  findConflicts,
  getShortcuts,
  isEditableElement,
  configureShortcuts,
  getResolvedShortcut,
  resetShortcutOverrides,
  useKeyboardShortcut,
  KEYBOARD_SHORTCUTS,
} from './keyboard-shortcuts';

// ============================================
// Test helpers
// ============================================

function makeKeyboardEvent(
  key: string,
  opts: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean; target?: EventTarget } = {}
): KeyboardEvent {
  return {
    key,
    ctrlKey: opts.ctrlKey ?? false,
    metaKey: opts.metaKey ?? false,
    shiftKey: opts.shiftKey ?? false,
    altKey: opts.altKey ?? false,
    target: opts.target ?? document.body,
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent;
}

// ============================================
// matchesShortcut
// ============================================

describe('matchesShortcut', () => {
  it('matches Ctrl+B for SIDEBAR_TOGGLE', () => {
    const event = makeKeyboardEvent('b', { ctrlKey: true });
    expect(matchesShortcut(event, KEYBOARD_SHORTCUTS.SIDEBAR_TOGGLE)).toBe(true);
  });

  it('matches Meta+B (macOS) for SIDEBAR_TOGGLE', () => {
    const event = makeKeyboardEvent('b', { metaKey: true });
    expect(matchesShortcut(event, KEYBOARD_SHORTCUTS.SIDEBAR_TOGGLE)).toBe(true);
  });

  it('rejects when extra modifier is pressed', () => {
    const event = makeKeyboardEvent('b', { ctrlKey: true, shiftKey: true });
    expect(matchesShortcut(event, KEYBOARD_SHORTCUTS.SIDEBAR_TOGGLE)).toBe(false);
  });

  it('rejects wrong key', () => {
    const event = makeKeyboardEvent('x', { ctrlKey: true });
    expect(matchesShortcut(event, KEYBOARD_SHORTCUTS.SIDEBAR_TOGGLE)).toBe(false);
  });

  it('is case-insensitive', () => {
    const event = makeKeyboardEvent('B', { ctrlKey: true });
    expect(matchesShortcut(event, KEYBOARD_SHORTCUTS.SIDEBAR_TOGGLE)).toBe(true);
  });
});

// ============================================
// isEditableElement
// ============================================

describe('isEditableElement', () => {
  it('returns false for null', () => {
    expect(isEditableElement(null)).toBe(false);
  });

  it('returns true for <textarea>', () => {
    const el = document.createElement('textarea');
    expect(isEditableElement(el)).toBe(true);
  });

  it('returns true for <input type="text">', () => {
    const el = document.createElement('input');
    el.type = 'text';
    expect(isEditableElement(el)).toBe(true);
  });

  it('returns true for <input type="email">', () => {
    const el = document.createElement('input');
    el.type = 'email';
    expect(isEditableElement(el)).toBe(true);
  });

  it('returns false for <input type="checkbox">', () => {
    const el = document.createElement('input');
    el.type = 'checkbox';
    expect(isEditableElement(el)).toBe(false);
  });

  it('returns true for contenteditable element', () => {
    const el = document.createElement('div');
    el.contentEditable = 'true';
    document.body.appendChild(el);
    expect(isEditableElement(el)).toBe(true);
    document.body.removeChild(el);
  });

  it('returns true for role="textbox"', () => {
    const el = document.createElement('div');
    el.setAttribute('role', 'textbox');
    expect(isEditableElement(el)).toBe(true);
  });

  it('returns true for child inside contenteditable ancestor', () => {
    const parent = document.createElement('div');
    parent.contentEditable = 'true';
    const child = document.createElement('p');
    parent.appendChild(child);
    document.body.appendChild(parent);
    expect(isEditableElement(child)).toBe(true);
    document.body.removeChild(parent);
  });

  it('returns false for a regular div', () => {
    const el = document.createElement('div');
    expect(isEditableElement(el)).toBe(false);
  });

  it('returns false for a button', () => {
    const el = document.createElement('button');
    expect(isEditableElement(el)).toBe(false);
  });
});

// ============================================
// configureShortcuts / getResolvedShortcut
// ============================================

describe('configureShortcuts', () => {
  beforeEach(() => {
    resetShortcutOverrides();
  });

  it('returns default shortcut when no override is set', () => {
    const resolved = getResolvedShortcut('SIDEBAR_TOGGLE');
    expect(resolved).not.toBeNull();
    expect(resolved!.key).toBe('b');
    expect(resolved!.meta).toBe(true);
  });

  it('merges partial override with default', () => {
    configureShortcuts({ SIDEBAR_TOGGLE: { key: '\\', label: 'Ctrl+\\' } });
    const resolved = getResolvedShortcut('SIDEBAR_TOGGLE');
    expect(resolved).not.toBeNull();
    expect(resolved!.key).toBe('\\');
    expect(resolved!.label).toBe('Ctrl+\\');
    // Keeps defaults for non-overridden fields
    expect(resolved!.meta).toBe(true);
    expect(resolved!.component).toBe('Sidebar');
    expect(resolved!.scope).toBe('global');
  });

  it('disables a shortcut with null', () => {
    configureShortcuts({ SIDEBAR_TOGGLE: null });
    expect(getResolvedShortcut('SIDEBAR_TOGGLE')).toBeNull();
  });

  it('multiple calls merge additively', () => {
    configureShortcuts({ SIDEBAR_TOGGLE: { key: '\\' } });
    configureShortcuts({ SIDEBAR_CLOSE_MOBILE: null });
    // First override still applies
    expect(getResolvedShortcut('SIDEBAR_TOGGLE')!.key).toBe('\\');
    // Second override also applies
    expect(getResolvedShortcut('SIDEBAR_CLOSE_MOBILE')).toBeNull();
  });

  it('last write wins for the same key', () => {
    configureShortcuts({ SIDEBAR_TOGGLE: { key: '\\' } });
    configureShortcuts({ SIDEBAR_TOGGLE: { key: '/' } });
    expect(getResolvedShortcut('SIDEBAR_TOGGLE')!.key).toBe('/');
  });

  it('resetShortcutOverrides clears all overrides', () => {
    configureShortcuts({ SIDEBAR_TOGGLE: null });
    resetShortcutOverrides();
    expect(getResolvedShortcut('SIDEBAR_TOGGLE')).not.toBeNull();
  });

  it('ignores unknown shortcut names', () => {
    // Should not throw
    configureShortcuts({ NOT_A_REAL_SHORTCUT: { key: 'x' } } as Parameters<typeof configureShortcuts>[0]);
    expect(getResolvedShortcut('SIDEBAR_TOGGLE')).not.toBeNull();
  });
});

// ============================================
// useKeyboardShortcut
// ============================================

describe('useKeyboardShortcut', () => {
  beforeEach(() => {
    resetShortcutOverrides();
  });

  it('fires handler on matching global shortcut', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcut({ name: 'SIDEBAR_TOGGLE', handler })
    );

    const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true });
    document.dispatchEvent(event);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire when disabled', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcut({ name: 'SIDEBAR_TOGGLE', handler, enabled: false })
    );

    const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true });
    document.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not fire when shortcut is disabled via configureShortcuts', () => {
    configureShortcuts({ SIDEBAR_TOGGLE: null });
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcut({ name: 'SIDEBAR_TOGGLE', handler })
    );

    const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true });
    document.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();
  });

  it('skips editable elements for global shortcuts', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcut({ name: 'SIDEBAR_TOGGLE', handler })
    );

    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('skips contenteditable elements for global shortcuts', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcut({ name: 'SIDEBAR_TOGGLE', handler })
    );

    const div = document.createElement('div');
    div.contentEditable = 'true';
    document.body.appendChild(div);

    const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true });
    Object.defineProperty(event, 'target', { value: div });
    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('skips role="textbox" elements for global shortcuts', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcut({ name: 'SIDEBAR_TOGGLE', handler })
    );

    const div = document.createElement('div');
    div.setAttribute('role', 'textbox');
    document.body.appendChild(div);

    const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true });
    Object.defineProperty(event, 'target', { value: div });
    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it('respects remapped shortcut via configureShortcuts', () => {
    configureShortcuts({ SIDEBAR_TOGGLE: { key: '\\' } });
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcut({ name: 'SIDEBAR_TOGGLE', handler })
    );

    // Old key should not fire
    const oldEvent = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true });
    document.dispatchEvent(oldEvent);
    expect(handler).not.toHaveBeenCalled();

    // New key should fire
    const newEvent = new KeyboardEvent('keydown', { key: '\\', ctrlKey: true, bubbles: true });
    document.dispatchEvent(newEvent);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('cleans up listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcut({ name: 'SIDEBAR_TOGGLE', handler })
    );

    unmount();

    const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true });
    document.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();
  });
});

// ============================================
// Existing helpers
// ============================================

describe('findConflicts', () => {
  it('finds EDITOR_BOLD as a conflict of SIDEBAR_TOGGLE', () => {
    const conflicts = findConflicts('SIDEBAR_TOGGLE');
    expect(conflicts.some((c) => c.component === 'Editor' && c.description.includes('bold'))).toBe(true);
  });

  it('returns empty for shortcuts with no conflicts', () => {
    const conflicts = findConflicts('EDITOR_CODE');
    expect(conflicts).toHaveLength(0);
  });
});

describe('getShortcuts', () => {
  it('returns all shortcuts when no filter is given', () => {
    const all = getShortcuts();
    expect(all.length).toBe(Object.keys(KEYBOARD_SHORTCUTS).length);
  });

  it('filters by component', () => {
    const editorShortcuts = getShortcuts({ component: 'Editor' });
    expect(editorShortcuts.every((s) => s.component === 'Editor')).toBe(true);
    expect(editorShortcuts.length).toBeGreaterThan(0);
  });

  it('filters by scope', () => {
    const globals = getShortcuts({ scope: 'global' });
    expect(globals.every((s) => s.scope === 'global')).toBe(true);
  });
});
