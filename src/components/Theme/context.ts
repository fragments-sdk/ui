"use client";

import * as React from "react";
import type { ThemeChrome } from "./inputs";

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
  /** Step to the next mode: system → light → dark → system */
  toggleMode: () => void;
}

export type ThemeContextValue = UseThemeReturn;

export const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const MODE_CYCLE: Record<ThemeMode, ThemeMode> = {
  system: "light",
  light: "dark",
  dark: "system",
};

/** The mode `toggleMode` steps to: system → light → dark → system. */
export function nextMode(mode: ThemeMode): ThemeMode {
  return MODE_CYCLE[mode];
}

// ============================================
// Outside a Theme: the document is the state
// ============================================

function readSystemPreference(): "light" | "dark" {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function readDocumentMode(): string | null {
  return typeof document === "undefined"
    ? null
    : document.documentElement.getAttribute("data-theme");
}

function subscribeDocumentMode(onChange: () => void): () => void {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
    return () => {};
  }
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const subscribeNothing = () => () => {};
const readNothing = () => null;

/**
 * The mode API for a page with no `Theme`: it reads and writes `data-theme` on
 * `<html>`, the same hook the stylesheet and `ThemeScript` use. `system`
 * removes the attribute, so the stylesheet's `light dark` follows the OS.
 */
function documentTheme(attribute: string | null): UseThemeReturn {
  const mode: ThemeMode = attribute === "light" || attribute === "dark" ? attribute : "system";
  const systemPreference = typeof window === "undefined" ? "light" : readSystemPreference();
  const setMode = (next: ThemeMode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (next === "system") {
      root.removeAttribute("data-theme");
      root.style.removeProperty("color-scheme");
    } else {
      root.setAttribute("data-theme", next);
      root.style.colorScheme = next;
    }
  };
  return {
    mode,
    setMode,
    resolvedMode: mode === "system" ? systemPreference : mode,
    systemPreference,
    toggleMode: () => setMode(nextMode(mode)),
  };
}

/**
 * The mode API. Inside a `Theme` it is that Theme's state; with no `Theme`
 * above, it reads and writes `data-theme` on `<html>` and re-renders when
 * that attribute changes, so it is never a silent no-op.
 */
export function useTheme(): UseThemeReturn {
  const context = React.useContext(ThemeContext);
  const attribute = React.useSyncExternalStore(
    context ? subscribeNothing : subscribeDocumentMode,
    context ? readNothing : readDocumentMode,
    readNothing
  );
  const fallback = React.useMemo(() => documentTheme(attribute), [attribute]);
  return context ?? fallback;
}

/**
 * What a nested `Theme` scope carries: its attributes and inline inputs. A
 * portal spreads them on its own element, so a popup opened inside the scope
 * re-derives like the scope instead of the page it is portalled into.
 */
export interface ThemePortalProps {
  "data-fui-theme"?: "";
  "data-theme"?: ThemeMode;
  "data-chrome"?: ThemeChrome;
  style?: React.CSSProperties;
}

/** The merged scope of every nested `Theme` above; null under the root. */
export const ThemeScopeContext = React.createContext<ThemePortalProps | null>(null);

const NO_SCOPE: ThemePortalProps = Object.freeze({});

/**
 * Props for a portal element: the nearest nested `Theme` scope, merged with the
 * scopes above it. Empty outside a nested scope, so a portal there is unchanged.
 */
export function useThemePortalProps(): ThemePortalProps {
  return React.useContext(ThemeScopeContext) ?? NO_SCOPE;
}

/**
 * Wraps a `createPortal` subtree, which has no container of its own, in one
 * element that carries the nearest nested `Theme` scope. Outside a nested
 * scope it renders the subtree as is, adding no element.
 */
export function ThemePortalScope({ children }: { children: React.ReactNode }) {
  const scope = useThemePortalProps();
  if (scope["data-fui-theme"] === undefined) {
    return React.createElement(React.Fragment, null, children);
  }
  return React.createElement("div", scope, children);
}
