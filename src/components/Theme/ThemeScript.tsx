import * as React from "react";
import type { ThemeMode } from "./context";
import { themeChrome, themeInputStyle, type ThemeInputs } from "./inputs";

// A server component: no client hooks, no "use client". It renders one inline
// script for <head> that sets the stored mode on <html> before first paint.

export interface ThemeScriptProps extends ThemeInputs {
  /** localStorage key the root `Theme` persists to (default: 'fui-theme'). */
  storageKey?: string;
  /** Mode used when nothing is stored, or storage is blocked (default: 'system'). */
  defaultMode?: ThemeMode;
  /** Content Security Policy nonce for the inline script. */
  nonce?: string;
}

interface ScriptArgs {
  k: string;
  d: ThemeMode;
  s: Record<string, string>;
  c?: string;
}

// Runs in the page before React. Every storage and media access sits in its
// own try, so blocked storage or a missing matchMedia falls back silently.
const RUNTIME =
  "function(o){try{var d=document.documentElement,m=o.d,v;" +
  "try{v=o.k&&window.localStorage.getItem(o.k)}catch(e){}" +
  'if(v==="light"||v==="dark"||v==="system")m=v;' +
  'if(m!=="light"&&m!=="dark"){m="light";' +
  'try{if(window.matchMedia("(prefers-color-scheme: dark)").matches)m="dark"}catch(e){}}' +
  'd.setAttribute("data-theme",m);' +
  "d.style.colorScheme=m;" +
  "for(var p in o.s)d.style.setProperty(p,o.s[p]);" +
  'if(o.c)d.setAttribute("data-chrome",o.c)}catch(e){}}';

function isMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * The source of the no-flash script, for frameworks that place inline scripts
 * themselves. Arguments are JSON with `<` escaped, so no value can close the
 * script element.
 */
export function getThemeScript(options: Omit<ThemeScriptProps, "nonce"> = {}): string {
  const args: ScriptArgs = {
    k: options.storageKey ?? "fui-theme",
    d: isMode(options.defaultMode) ? options.defaultMode : "system",
    s: themeInputStyle(options),
  };
  const chrome = themeChrome(options);
  if (chrome) args.c = chrome;
  const json = JSON.stringify(args)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `(${RUNTIME})(${json})`;
}

/**
 * Place in `<head>`, before the stylesheet. Reads the mode the root `Theme`
 * stored and writes it, with any inputs, on `<html>` before the first paint,
 * so a reload never shows the wrong mode. Add `suppressHydrationWarning` to
 * `<html>`: the script changes its attributes before React hydrates.
 */
export function ThemeScript({ nonce, ...options }: ThemeScriptProps): React.ReactElement {
  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: getThemeScript(options) }}
    />
  );
}
