"use client";

import * as React from "react";
import {
  ThemeContext,
  ThemeScopeContext,
  useTheme,
  useThemePortalProps,
  nextMode,
  type ThemeContextValue,
  type ThemeMode,
  type ThemePortalProps,
} from "./context";
import { themeChrome, themeInputStyle, type ThemeChrome, type ThemeInputs } from "./inputs";

export type { ThemeMode, ThemePortalProps, UseThemeReturn } from "./context";
export type { ThemeChrome, ThemeInputs, ThemeNeutral } from "./inputs";

// ============================================
// Types
// ============================================

export interface ThemeProps extends ThemeInputs {
  children: React.ReactNode;
  /** Default theme mode for uncontrolled usage */
  defaultMode?: ThemeMode;
  /** Controlled theme mode */
  mode?: ThemeMode;
  /** Callback when mode changes */
  onModeChange?: (mode: ThemeMode) => void;
  /**
   * localStorage key for persistence. The root `Theme` defaults to 'fui-theme';
   * a nested `Theme` persists only when given a key.
   */
  storageKey?: string;
  /** Class on a nested `Theme`'s scope element (the root renders no element). */
  className?: string;
  /** Inline style on a nested `Theme`'s scope element. */
  style?: React.CSSProperties;
}

// ============================================
// Helpers
// ============================================

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function isMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

// Storage can throw on access itself (blocked site data, some private modes),
// not only on read or write, so every touch sits in a try. Blocked storage
// means the mode lives for this page only and falls back to the default.
function readStoredMode(key: string): ThemeMode | null {
  try {
    const value = window.localStorage.getItem(key);
    return isMode(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStoredMode(key: string, mode: ThemeMode): void {
  try {
    window.localStorage.setItem(key, mode);
  } catch {
    // Blocked storage: nothing persists, and nothing breaks.
  }
}

/**
 * Hook to detect system color scheme preference
 */
function useSystemPreference(): "light" | "dark" {
  const [preference, setPreference] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setPreference(mq.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => {
      setPreference(e.matches ? "dark" : "light");
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return preference;
}

function suppressTransitions(): () => void {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.append(style);
  return () => {
    // Read layout for its side effect: a synchronous style flush commits the
    // new colors while the override still applies, so nothing starts moving.
    void document.body.offsetHeight;
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
    } else {
      style.remove();
    }
  };
}

interface ModeOptions {
  controlledMode: ThemeMode | undefined;
  defaultMode: ThemeMode;
  storageKey: string | undefined;
  onModeChange: ((mode: ThemeMode) => void) | undefined;
}

/** Mode state: controlled or uncontrolled, hydrated from storage after mount. */
function useModeState({ controlledMode, defaultMode, storageKey, onModeChange }: ModeOptions) {
  const systemPreference = useSystemPreference();
  const [internalMode, setInternalMode] = React.useState<ThemeMode>(defaultMode);
  const [mounted, setMounted] = React.useState(false);

  const isControlled = controlledMode !== undefined;
  const mode = isControlled ? controlledMode : internalMode;
  const resolvedMode: "light" | "dark" = mode === "system" ? systemPreference : mode;

  // Hydrate from storage on mount (SSR-safe).
  React.useEffect(() => {
    if (!isControlled && storageKey) {
      const stored = readStoredMode(storageKey);
      if (stored) setInternalMode(stored);
    }
    setMounted(true);
  }, [isControlled, storageKey]);

  // Persist when the mode changes.
  React.useEffect(() => {
    if (!storageKey || !mounted) return;
    writeStoredMode(storageKey, mode);
  }, [mode, storageKey, mounted]);

  const setMode = React.useCallback(
    (newMode: ThemeMode) => {
      if (!isControlled) {
        setInternalMode(newMode);
      }
      onModeChange?.(newMode);
    },
    [isControlled, onModeChange]
  );

  const toggleMode = React.useCallback(() => {
    setMode(nextMode(mode));
  }, [mode, setMode]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ mode, setMode, resolvedMode, systemPreference, toggleMode }),
    [mode, setMode, resolvedMode, systemPreference, toggleMode]
  );
  return { value, mounted };
}

// ============================================
// Root: owns the document
// ============================================

function RootTheme({
  children,
  defaultMode,
  mode: controlledMode,
  onModeChange,
  storageKey = "fui-theme",
  ...inputs
}: ThemeProps) {
  const { value, mounted } = useModeState({
    controlledMode,
    defaultMode: defaultMode ?? "system",
    storageKey,
    onModeChange,
  });
  const { resolvedMode } = value;

  // Apply the mode to <html>. Skipped until mounted, so the first client render
  // never overwrites what ThemeScript set before paint.
  React.useEffect(() => {
    if (typeof document === "undefined" || !mounted) return;

    const root = document.documentElement;
    const current = root.getAttribute("data-theme");

    // A flip changes color, background, border and shadow on nearly every
    // element at once; every transition on those properties would fire
    // together and the switch smears instead of snapping. Turn transitions
    // off for the swap, flush, then restore on the next frame.
    const restore = current !== resolvedMode ? suppressTransitions() : null;

    root.setAttribute("data-theme", resolvedMode);
    // Inline, as ThemeScript writes it, so a stale pre-paint value never wins.
    root.style.colorScheme = resolvedMode;

    restore?.();
  }, [resolvedMode, mounted]);

  // The root's inputs go on <html>, so the whole page, portals included,
  // derives from them. Keyed by value, so a new object each render is free.
  const inputKey = JSON.stringify([themeInputStyle(inputs), themeChrome(inputs) ?? null]);
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    const [style, chrome] = JSON.parse(inputKey) as [Record<string, string>, ThemeChrome | null];
    for (const [name, value] of Object.entries(style)) root.style.setProperty(name, value);
    if (chrome) root.setAttribute("data-chrome", chrome);
    return () => {
      for (const name of Object.keys(style)) root.style.removeProperty(name);
      if (chrome) root.removeAttribute("data-chrome");
    };
  }, [inputKey]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================
// Nested: a scope element that re-derives
// ============================================

function NestedTheme({
  parent,
  children,
  defaultMode,
  mode: controlledMode,
  onModeChange,
  storageKey,
  className,
  style,
  ...inputs
}: ThemeProps & { parent: ThemeContextValue }) {
  const parentScope = React.useContext(ThemeScopeContext);

  // A scope owns a mode only when it sets one; otherwise the document's mode
  // API passes through, so a toggle inside it switches the page.
  const ownsMode = controlledMode !== undefined || defaultMode !== undefined;
  const local = useModeState({
    controlledMode,
    defaultMode: defaultMode ?? "system",
    storageKey: ownsMode ? storageKey : undefined,
    onModeChange,
  });
  const value = ownsMode ? local.value : parent;

  const inputStyle = themeInputStyle(inputs);
  const chrome = themeChrome(inputs);
  // "system" stays as written: the stylesheet maps it to `light dark`, so a
  // server-rendered scope already follows the OS before hydration.
  const scopeMode = ownsMode ? local.value.mode : undefined;
  const fontFamily = inputStyle["--fui-font-sans"] ? "var(--fui-font-sans)" : undefined;

  // inputStyle is a fresh object each render; its serialised form is the key.
  const inputKey = JSON.stringify(inputStyle);
  const scope = React.useMemo<ThemePortalProps>(() => {
    // A portal sits outside the scope element, so it needs the font family as
    // well as the input: a parent scope's comes through its style, this one's here.
    const merged: ThemePortalProps = {
      "data-fui-theme": "",
      style: {
        ...parentScope?.style,
        ...(JSON.parse(inputKey) as React.CSSProperties),
        ...(fontFamily ? { fontFamily } : null),
      },
    };
    const theme = scopeMode ?? parentScope?.["data-theme"];
    const chromeValue = chrome ?? parentScope?.["data-chrome"];
    if (theme) merged["data-theme"] = theme;
    if (chromeValue) merged["data-chrome"] = chromeValue;
    return merged;
  }, [parentScope, scopeMode, chrome, inputKey, fontFamily]);

  const rendersScope =
    ownsMode ||
    Object.keys(inputStyle).length > 0 ||
    chrome !== undefined ||
    className !== undefined ||
    style !== undefined;

  const content = <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;

  // A nested Theme that sets nothing is context only: no element, no layout change.
  if (!rendersScope) return content;

  return (
    <ThemeScopeContext.Provider value={scope}>
      <div
        data-fui-theme=""
        data-theme={scopeMode}
        data-chrome={chrome}
        className={className}
        style={{ ...(inputStyle as React.CSSProperties), fontFamily, ...style }}
      >
        {content}
      </div>
    </ThemeScopeContext.Provider>
  );
}

// ============================================
// Components
// ============================================

/**
 * Theme: the root `Theme` owns the document (mode on `<html>`, storage,
 * system preference, inputs). A `Theme` inside another renders a scope element
 * with its own inputs and mode, and everything below it re-derives.
 * SSR-safe: storage is read after mount; `ThemeScript` covers the first paint.
 */
function ThemeRoot(props: ThemeProps) {
  const parent = React.useContext(ThemeContext);
  if (parent) return <NestedTheme {...props} parent={parent} />;
  return <RootTheme {...props} />;
}

// ============================================
// Exports
// ============================================

export const Theme = Object.assign(ThemeRoot, {
  Root: ThemeRoot,
  useTheme,
});

export { useTheme, useThemePortalProps };

// ============================================
// configureTheme — JS-only input configuration
// ============================================

export type ConfigureThemeOptions = ThemeInputs;

/**
 * Configure theme inputs at runtime via JS. Sets the input custom properties
 * on `:root` without requiring SCSS; the stylesheet derives every colour role
 * from them (accent hover and press, selection, focus ring, planes, tone tints
 * and texts), holding contrast for any seed. Call this once at app startup.
 *
 * The same inputs can be set in CSS with no JavaScript:
 * `:root { --fui-seed-brand: #6366f1; }`.
 *
 * @example
 * ```ts
 * import { configureTheme } from '@usefragments/ui';
 *
 * configureTheme({
 *   brand: '#6366f1',
 *   neutral: 'oklch(0.5 0.02 250)',
 *   radius: 8,
 * });
 * ```
 */
export function configureTheme(options: ConfigureThemeOptions): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  // Inputs: every colour role and measurement derives from these in CSS.
  for (const [name, value] of Object.entries(themeInputStyle(options))) {
    root.style.setProperty(name, value);
  }
  const chrome = themeChrome(options);
  if (chrome) root.setAttribute("data-chrome", chrome);
}
