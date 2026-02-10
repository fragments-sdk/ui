'use client';

import * as React from 'react';
import styles from './ThemeToggle.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme mode for uncontrolled usage */
  defaultMode?: ThemeMode;
  /** Controlled theme mode */
  mode?: ThemeMode;
  /** Callback when mode changes */
  onModeChange?: (mode: ThemeMode) => void;
  /** localStorage key for persistence (default: 'fui-theme') */
  storageKey?: string;
  /** How to apply theme to DOM */
  attribute?: 'data-theme' | 'class';
}

export interface UseThemeReturn {
  /** Current theme mode setting */
  mode: ThemeMode;
  /** Set the theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Resolved mode (never 'system', always 'light' or 'dark') */
  resolvedMode: 'light' | 'dark';
  /** System preference detected from prefers-color-scheme */
  systemPreference: 'light' | 'dark';
  /** Toggle between light and dark (skips system) */
  toggleMode: () => void;
}

export interface ThemeToggleProps {
  /** Size of the toggle button */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to include system mode option (default: false) */
  showSystem?: boolean;
  /** Controlled value for custom usage (bypasses theme context) */
  value?: 'light' | 'dark';
  /** Callback when value changes (for controlled usage) */
  onValueChange?: (value: 'light' | 'dark') => void;
  /** Accessible label for the group */
  'aria-label'?: string;
  /** Additional class name */
  className?: string;
}

// ============================================
// Context
// ============================================

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
  systemPreference: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

// ============================================
// Hooks
// ============================================

/**
 * Hook to detect system color scheme preference
 */
function useSystemPreference(): 'light' | 'dark' {
  const [preference, setPreference] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setPreference(mq.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setPreference(e.matches ? 'dark' : 'light');
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return preference;
}

/**
 * Hook to access theme context
 */
function useTheme(): UseThemeReturn {
  const context = React.useContext(ThemeContext);

  if (!context) {
    // Return safe defaults when used outside provider
    return {
      mode: 'system',
      setMode: () => {},
      resolvedMode: 'light',
      systemPreference: 'light',
      toggleMode: () => {},
    };
  }

  return context;
}

// ============================================
// Icons
// ============================================

function SunIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z" />
    </svg>
  );
}

function MoonIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z" />
    </svg>
  );
}

function MonitorIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
    </svg>
  );
}

// ============================================
// Components
// ============================================

/**
 * ThemeProvider - Provides theme context to children
 * SSR-safe: initializes from localStorage in useEffect
 */
function ThemeProvider({
  children,
  defaultMode = 'system',
  mode: controlledMode,
  onModeChange,
  storageKey = 'fui-theme',
  attribute = 'data-theme',
}: ThemeProviderProps) {
  const systemPreference = useSystemPreference();

  // Initialize with defaultMode, then hydrate from localStorage in useEffect
  const [internalMode, setInternalMode] = React.useState<ThemeMode>(defaultMode);
  const [mounted, setMounted] = React.useState(false);

  // Determine if controlled
  const isControlled = controlledMode !== undefined;
  const mode = isControlled ? controlledMode : internalMode;

  // Calculate resolved mode
  const resolvedMode: 'light' | 'dark' = mode === 'system' ? systemPreference : mode;

  // Hydrate from localStorage on mount (SSR-safe)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isControlled && storageKey) {
      const stored = localStorage.getItem(storageKey) as ThemeMode | null;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setInternalMode(stored);
      }
    }
    setMounted(true);
  }, [isControlled, storageKey]);

  // Apply theme to DOM
  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (attribute === 'data-theme') {
      root.setAttribute('data-theme', resolvedMode);
    } else if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedMode);
    }
  }, [resolvedMode, attribute]);

  // Persist to localStorage when mode changes
  React.useEffect(() => {
    if (typeof window === 'undefined' || !storageKey || !mounted) return;
    localStorage.setItem(storageKey, mode);
  }, [mode, storageKey, mounted]);

  const setMode = React.useCallback((newMode: ThemeMode) => {
    if (!isControlled) {
      setInternalMode(newMode);
    }
    onModeChange?.(newMode);
  }, [isControlled, onModeChange]);

  const toggleMode = React.useCallback(() => {
    const next = resolvedMode === 'light' ? 'dark' : 'light';
    setMode(next);
  }, [resolvedMode, setMode]);

  const contextValue: ThemeContextValue = {
    mode,
    setMode,
    resolvedMode,
    systemPreference,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * ThemeToggle - Segmented button group to toggle between light and dark themes
 *
 * Can be used in two modes:
 * 1. Uncontrolled (default): Uses ThemeProvider context to get/set theme
 * 2. Controlled: Pass `value` and `onValueChange` props for custom behavior
 */
function ThemeToggle({
  size = 'md',
  showSystem = false,
  value: controlledValue,
  onValueChange,
  'aria-label': ariaLabel,
  className,
}: ThemeToggleProps) {
  const { mode: contextMode, setMode: setContextMode } = useTheme();

  // Use controlled value if provided, otherwise use context
  const isControlled = controlledValue !== undefined;
  const currentMode = isControlled ? controlledValue : contextMode;

  const handleModeChange = (newMode: 'light' | 'dark') => {
    if (isControlled) {
      onValueChange?.(newMode);
    } else {
      setContextMode(newMode);
    }
  };

  const groupClasses = [
    styles.toggleGroup,
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
    className,
  ].filter(Boolean).join(' ');

  const getButtonClasses = (buttonMode: ThemeMode) => {
    return [
      styles.toggleButton,
      currentMode === buttonMode && styles.toggleButtonActive,
    ].filter(Boolean).join(' ');
  };

  const label = ariaLabel || 'Theme toggle';

  return (
    <div
      className={groupClasses}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={getButtonClasses('light')}
        onClick={() => handleModeChange('light')}
        aria-pressed={currentMode === 'light'}
        aria-label="Light mode"
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={getButtonClasses('dark')}
        onClick={() => handleModeChange('dark')}
        aria-pressed={currentMode === 'dark'}
        aria-label="Dark mode"
      >
        <MoonIcon />
      </button>
      {showSystem && !isControlled && (
        <button
          type="button"
          className={getButtonClasses('system')}
          onClick={() => setContextMode('system')}
          aria-pressed={contextMode === 'system'}
          aria-label="System preference"
        >
          <MonitorIcon />
        </button>
      )}
    </div>
  );
}

// ============================================
// Exports
// ============================================

export const Theme = Object.assign(ThemeProvider, {
  Root: ThemeProvider,
  Provider: ThemeProvider,
  Toggle: ThemeToggle,
  useTheme,
});

export { ThemeProvider, ThemeToggle, useTheme };
