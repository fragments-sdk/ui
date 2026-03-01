'use client';

import * as React from 'react';
import styles from './ThemeToggle.module.scss';

// ============================================
// Types
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme mode for uncontrolled usage */
  defaultMode?: ThemeMode;
  /**
   * @deprecated Use `defaultMode` instead. This alias will be removed in v1.0.
   */
  defaultTheme?: ThemeMode;
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

export interface ThemeToggleProps extends React.HTMLAttributes<HTMLDivElement> {
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
  defaultMode,
  defaultTheme,
  mode: controlledMode,
  onModeChange,
  storageKey = 'fui-theme',
  attribute = 'data-theme',
}: ThemeProviderProps) {
  const systemPreference = useSystemPreference();

  // Warn on deprecated prop usage (dev only)
  if (process.env.NODE_ENV !== 'production' && defaultTheme !== undefined) {
    console.warn(
      '[Fragments] ThemeProvider: `defaultTheme` is deprecated. Use `defaultMode` instead. ' +
      '`defaultTheme` will be removed in v1.0.'
    );
  }

  // Resolve default: defaultMode takes precedence, then defaultTheme, then 'system'
  const resolvedDefault = defaultMode ?? defaultTheme ?? 'system';

  // Initialize with resolvedDefault, then hydrate from localStorage in useEffect
  const [internalMode, setInternalMode] = React.useState<ThemeMode>(resolvedDefault);
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

  // Apply theme to DOM — skip until mounted so we don't overwrite
  // the inline script that prevents flash on initial page load
  React.useEffect(() => {
    if (typeof document === 'undefined' || !mounted) return;

    const root = document.documentElement;

    if (attribute === 'data-theme') {
      root.setAttribute('data-theme', resolvedMode);
    } else if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedMode);
    }
  }, [resolvedMode, attribute, mounted]);

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
 * ThemeToggle - Fragmented button group to toggle between light and dark themes
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
  ...htmlProps
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
      {...htmlProps}
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

// ============================================
// configureTheme — JS-only seed configuration
// ============================================

// Import + re-export seed derivation types — canonical definitions in utils/seed-derivation.ts
import type { NeutralPalette, DensityPreset, RadiusStyle } from '../../utils/seed-derivation';
export type { NeutralPalette, DensityPreset, RadiusStyle };

export interface ConfigureThemeOptions {
  /** Brand/accent color as hex */
  brand?: string;
  /** Neutral palette name */
  neutral?: NeutralPalette;
  /** Spacing density preset */
  density?: DensityPreset;
  /** Border radius style */
  radiusStyle?: RadiusStyle;
  /** Danger/error color as hex */
  danger?: string;
  /** Success color as hex */
  success?: string;
  /** Warning color as hex */
  warning?: string;
  /** Info color as hex */
  info?: string;
}

// -- Radius presets (match _radius.scss) --

const RADIUS_PRESETS: Record<RadiusStyle, Record<string, string>> = {
  sharp:   { sm: '0',        md: '0',        lg: '0',        xl: '0' },
  subtle:  { sm: '0.125rem', md: '0.25rem',  lg: '0.375rem', xl: '0.5rem' },
  default: { sm: '0.25rem',  md: '0.429rem', lg: '0.571rem', xl: '0.857rem' },
  rounded: { sm: '0.375rem', md: '0.5rem',   lg: '0.75rem',  xl: '1rem' },
  pill:    { sm: '0.5rem',   md: '0.75rem',  lg: '1rem',     xl: '1.5rem' },
};

// -- Density presets (match _density.scss) --

interface DensityConfig {
  baseUnit: number;
  baseFontSize: number;
  buttonHeights: [number, number, number]; // sm, md, lg
  inputHeights: [number, number, number]; // sm, default, lg
  touchTargets: [number, number, number]; // sm, md, lg — WCAG 2.5.8: ≥24px
  sidebarItemHeight: number;
}

const DENSITY_CONFIGS: Record<DensityPreset, DensityConfig> = {
  compact:  { baseUnit: 6,  baseFontSize: 14, buttonHeights: [24, 30, 36], inputHeights: [24, 32, 36], touchTargets: [24, 28, 38], sidebarItemHeight: 30 },
  default:  { baseUnit: 7,  baseFontSize: 14, buttonHeights: [28, 36, 44], inputHeights: [28, 40, 44], touchTargets: [24, 32, 44], sidebarItemHeight: 35 },
  relaxed:  { baseUnit: 8,  baseFontSize: 14, buttonHeights: [32, 40, 48], inputHeights: [32, 44, 48], touchTargets: [28, 36, 48], sidebarItemHeight: 38 },
};

function pxToRem(px: number, baseFontSize: number): string {
  return `${px / baseFontSize}rem`;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

function adjustLightness(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  const adjust = (v: number) => Math.max(0, Math.min(255, Math.round(v + amount)));
  return `#${adjust(r).toString(16).padStart(2, '0')}${adjust(g).toString(16).padStart(2, '0')}${adjust(b).toString(16).padStart(2, '0')}`;
}

function setVar(el: HTMLElement, name: string, value: string) {
  el.style.setProperty(name, value);
}

/**
 * Configure theme seeds at runtime via JS. Sets CSS custom properties on
 * `:root` without requiring SCSS. Call this once at app startup.
 *
 * Note: For full control over all 120+ tokens, use the SCSS `@use...with()`
 * approach. `configureTheme` covers the most commonly customized tokens.
 *
 * @example
 * ```ts
 * import { configureTheme } from '@fragments-sdk/ui';
 *
 * configureTheme({
 *   brand: '#6366f1',
 *   neutral: 'ice',
 *   density: 'compact',
 *   radiusStyle: 'rounded',
 * });
 * ```
 */
export function configureTheme(options: ConfigureThemeOptions): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // -- Brand / Accent --
  if (options.brand) {
    setVar(root, '--fui-color-accent', options.brand);
    setVar(root, '--fui-color-accent-hover', adjustLightness(options.brand, -20));
    setVar(root, '--fui-color-accent-active', adjustLightness(options.brand, -40));
    setVar(root, '--fui-focus-ring-color', `${options.brand}66`); // 40% alpha
  }

  // -- Semantic colors --
  if (options.danger) {
    setVar(root, '--fui-color-danger', options.danger);
    setVar(root, '--fui-color-danger-hover', adjustLightness(options.danger, -20));
  }
  if (options.success) setVar(root, '--fui-color-success', options.success);
  if (options.warning) setVar(root, '--fui-color-warning', options.warning);
  if (options.info) setVar(root, '--fui-color-info', options.info);

  // -- Radius --
  if (options.radiusStyle) {
    const r = RADIUS_PRESETS[options.radiusStyle];
    if (r) {
      setVar(root, '--fui-radius-sm', r.sm);
      setVar(root, '--fui-radius-md', r.md);
      setVar(root, '--fui-radius-lg', r.lg);
      setVar(root, '--fui-radius-xl', r.xl);
    }
  }

  // -- Density --
  if (options.density) {
    const d = DENSITY_CONFIGS[options.density];
    if (d) {
      const unitRem = d.baseUnit / d.baseFontSize;

      // Micro spacing
      setVar(root, '--fui-space-0-5', `${unitRem * 0.3}rem`);
      setVar(root, '--fui-space-0-75', `${unitRem * 0.43}rem`);

      // Spacing scale
      setVar(root, '--fui-space-1', `${unitRem}rem`);
      setVar(root, '--fui-space-2', `${unitRem * 2}rem`);
      setVar(root, '--fui-space-3', `${unitRem * 3}rem`);
      setVar(root, '--fui-space-4', `${unitRem * 4}rem`);
      setVar(root, '--fui-space-5', `${unitRem * 5}rem`);
      setVar(root, '--fui-space-6', `${unitRem * 6}rem`);
      setVar(root, '--fui-space-8', `${unitRem * 8}rem`);
      setVar(root, '--fui-space-10', `${unitRem * 10}rem`);
      setVar(root, '--fui-space-12', `${unitRem * 12}rem`);

      // Component heights
      setVar(root, '--fui-button-height-sm', pxToRem(d.buttonHeights[0], d.baseFontSize));
      setVar(root, '--fui-button-height-md', pxToRem(d.buttonHeights[1], d.baseFontSize));
      setVar(root, '--fui-button-height-lg', pxToRem(d.buttonHeights[2], d.baseFontSize));
      setVar(root, '--fui-input-height-sm', pxToRem(d.inputHeights[0], d.baseFontSize));
      setVar(root, '--fui-input-height', pxToRem(d.inputHeights[1], d.baseFontSize));
      setVar(root, '--fui-input-height-lg', pxToRem(d.inputHeights[2], d.baseFontSize));

      // Touch targets (WCAG 2.5.8: all values ≥24px)
      setVar(root, '--fui-touch-sm', pxToRem(d.touchTargets[0], d.baseFontSize));
      setVar(root, '--fui-touch-md', pxToRem(d.touchTargets[1], d.baseFontSize));
      setVar(root, '--fui-touch-lg', pxToRem(d.touchTargets[2], d.baseFontSize));

      // Sidebar navigation
      setVar(root, '--fui-sidebar-item-height', pxToRem(d.sidebarItemHeight, d.baseFontSize));

      // Base unit
      setVar(root, '--fui-base-unit', `${d.baseUnit}px`);
    }
  }
}
