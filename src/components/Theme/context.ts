"use client";

import * as React from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface UseThemeReturn {
  /** Current theme mode setting */
  mode: ThemeMode;
  /** Set the theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Resolved mode (never 'system', always 'light' or 'dark') */
  resolvedMode: "light" | "dark";
  /** System preference detected from prefers-color-scheme */
  systemPreference: "light" | "dark";
  /** Toggle between light and dark (skips system) */
  toggleMode: () => void;
}

export type ThemeContextValue = UseThemeReturn;

export const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/**
 * Hook to access theme context.
 */
export function useTheme(): UseThemeReturn {
  const context = React.useContext(ThemeContext);

  if (!context) {
    // Return safe defaults when used outside provider.
    return {
      mode: "system",
      setMode: () => {},
      resolvedMode: "light",
      systemPreference: "light",
      toggleMode: () => {},
    };
  }

  return context;
}
