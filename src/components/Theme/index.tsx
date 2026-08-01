"use client";

import * as React from "react";
import { ComponentDefaultsProvider, type ComponentDefaults } from "../ComponentDefaults";
import { ThemeToggle } from "../ThemeToggle";
import { ThemeContext, useTheme, type ThemeContextValue, type ThemeMode } from "./context";

export type { ThemeToggleProps } from "../ThemeToggle";
export type { ThemeMode, UseThemeReturn } from "./context";

// ============================================
// Types
// ============================================

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default primitive component behavior for the subtree. */
  componentDefaults?: ComponentDefaults;
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
  attribute?: "data-theme" | "class";
}

// ============================================
// Hooks
// ============================================

/**
 * Hook to detect system color scheme preference
 */
function useSystemPreference(): "light" | "dark" {
  const [preference, setPreference] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === "undefined") return;

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

// ============================================
// Components
// ============================================

/**
 * ThemeProvider - Provides theme context to children
 * SSR-safe: initializes from localStorage in useEffect
 */
function ThemeProvider({
  children,
  componentDefaults,
  defaultMode,
  defaultTheme,
  mode: controlledMode,
  onModeChange,
  storageKey = "fui-theme",
  attribute = "data-theme",
}: ThemeProviderProps) {
  const systemPreference = useSystemPreference();

  // Warn on deprecated prop usage (dev only)
  if (process.env.NODE_ENV !== "production" && defaultTheme !== undefined) {
    console.warn(
      "[Fragments] ThemeProvider: `defaultTheme` is deprecated. Use `defaultMode` instead. " +
        "`defaultTheme` will be removed in v1.0."
    );
  }

  // Resolve default: defaultMode takes precedence, then defaultTheme, then 'system'
  const resolvedDefault = defaultMode ?? defaultTheme ?? "system";

  // Initialize with resolvedDefault, then hydrate from localStorage in useEffect
  const [internalMode, setInternalMode] = React.useState<ThemeMode>(resolvedDefault);
  const [mounted, setMounted] = React.useState(false);

  // Determine if controlled
  const isControlled = controlledMode !== undefined;
  const mode = isControlled ? controlledMode : internalMode;

  // Calculate resolved mode
  const resolvedMode: "light" | "dark" = mode === "system" ? systemPreference : mode;

  // Hydrate from localStorage on mount (SSR-safe)
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isControlled && storageKey) {
      const stored = localStorage.getItem(storageKey) as ThemeMode | null;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        setInternalMode(stored);
      }
    }
    setMounted(true);
  }, [isControlled, storageKey]);

  // Apply theme to DOM — skip until mounted so we don't overwrite
  // the inline script that prevents flash on initial page load
  React.useEffect(() => {
    if (typeof document === "undefined" || !mounted) return;

    const root = document.documentElement;

    if (attribute === "data-theme") {
      root.setAttribute("data-theme", resolvedMode);
    } else if (attribute === "class") {
      root.classList.remove("light", "dark");
      root.classList.add(resolvedMode);
    }
  }, [resolvedMode, attribute, mounted]);

  // Persist to localStorage when mode changes
  React.useEffect(() => {
    if (typeof window === "undefined" || !storageKey || !mounted) return;
    localStorage.setItem(storageKey, mode);
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
    const next = resolvedMode === "light" ? "dark" : "light";
    setMode(next);
  }, [resolvedMode, setMode]);

  const contextValue: ThemeContextValue = {
    mode,
    setMode,
    resolvedMode,
    systemPreference,
    toggleMode,
  };

  const themedChildren = (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  );

  if (!componentDefaults) {
    return themedChildren;
  }

  return (
    <ComponentDefaultsProvider value={componentDefaults}>
      {themedChildren}
    </ComponentDefaultsProvider>
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
import type { NeutralPalette, DensityPreset, RadiusStyle } from "../../utils/seed-derivation";
import { applyMeasurementSelection } from "../../measurements";
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
  return `#${adjust(r).toString(16).padStart(2, "0")}${adjust(g).toString(16).padStart(2, "0")}${adjust(b).toString(16).padStart(2, "0")}`;
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
 * import { configureTheme } from '@usefragments/ui';
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
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // -- Brand / Accent --
  if (options.brand) {
    setVar(root, "--fui-color-accent", options.brand);
    setVar(root, "--fui-color-accent-hover", adjustLightness(options.brand, -20));
    setVar(root, "--fui-color-accent-active", adjustLightness(options.brand, -40));
    setVar(root, "--fui-focus-ring-color", `${options.brand}66`); // 40% alpha
  }

  // -- Semantic colors --
  if (options.danger) {
    setVar(root, "--fui-color-danger", options.danger);
    setVar(root, "--fui-color-danger-hover", adjustLightness(options.danger, -20));
  }
  if (options.success) setVar(root, "--fui-color-success", options.success);
  if (options.warning) setVar(root, "--fui-color-warning", options.warning);
  if (options.info) setVar(root, "--fui-color-info", options.info);

  // Named geometry is selected through the generated Measurement Module.
  // Partial calls leave the omitted selector untouched and never write numeric
  // CSS maps inline.
  applyMeasurementSelection(root, {
    density: options.density,
    radiusStyle: options.radiusStyle,
  });
}
