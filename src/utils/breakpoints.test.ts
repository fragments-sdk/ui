import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FUI_BREAKPOINTS, belowBreakpointQuery, useBelowBreakpoint } from "./breakpoints";

type Listener = (event: MediaQueryListEvent) => void;

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<Listener>();
  const queries: string[] = [];
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn((media: string) => {
      queries.push(media);
      return {
        matches,
        media,
        addEventListener: (_: string, listener: Listener) => listeners.add(listener),
        removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
      };
    }),
  });
  return {
    queries,
    fire(next: boolean) {
      listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
    },
  };
}

describe("breakpoints", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mirrors the $fui-breakpoint-* scale", () => {
    const scss = readFileSync(join(__dirname, "../tokens/_variables.scss"), "utf8");
    for (const [name, px] of Object.entries(FUI_BREAKPOINTS)) {
      expect(scss).toContain(`$fui-breakpoint-${name}: ${px}px`);
    }
  });

  it("emits the same query as the below-* mixins", () => {
    expect(belowBreakpointQuery("md")).toBe("(max-width: 767px)");
    expect(belowBreakpointQuery("lg")).toBe("(max-width: 1023px)");
  });

  it("starts false and follows the media query", () => {
    const media = mockMatchMedia(true);
    const { result } = renderHook(() => useBelowBreakpoint("md"));
    expect(media.queries).toContain("(max-width: 767px)");
    expect(result.current).toBe(true);
    act(() => media.fire(false));
    expect(result.current).toBe(false);
  });
});
