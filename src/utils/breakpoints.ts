"use client";

import * as React from "react";

/**
 * The layout breakpoints in pixels: the `$fui-breakpoint-*` scale in
 * tokens/_variables.scss, which the `below-*` mixins read. The shell components
 * (Sidebar, Header, AppShell) read these through `useBelowBreakpoint` instead of
 * keeping their own copies.
 */
export const FUI_BREAKPOINTS = Object.freeze({ sm: 640, md: 768, lg: 1024, xl: 1280 });

export type FuiBreakpoint = keyof typeof FUI_BREAKPOINTS;

/** The media query the `below-*` mixins emit for a breakpoint. */
export function belowBreakpointQuery(breakpoint: FuiBreakpoint): string {
  return `(max-width: ${FUI_BREAKPOINTS[breakpoint] - 1}px)`;
}

/**
 * True while the viewport is narrower than `breakpoint`. It is false on the
 * server and on the first client render, so markup hydrates without a mismatch;
 * the CSS `below-*` rules carry the first paint.
 */
export function useBelowBreakpoint(breakpoint: FuiBreakpoint): boolean {
  const [below, setBelow] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const query = window.matchMedia(belowBreakpointQuery(breakpoint));
    setBelow(query.matches);

    const handleChange = (event: MediaQueryListEvent) => setBelow(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return below;
}
