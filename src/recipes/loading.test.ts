import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOADING_DELAY_MS, LOADING_SLOW_MS, useLoadingPhase } from "./loading";

describe("useLoadingPhase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows nothing under a second, loading to ten seconds, then slow", () => {
    const { result } = renderHook(() => useLoadingPhase(true));
    expect(result.current).toBe("quiet");
    act(() => vi.advanceTimersByTime(999));
    expect(result.current).toBe("quiet");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("loading");
    act(() => vi.advanceTimersByTime(LOADING_SLOW_MS - LOADING_DELAY_MS - 1));
    expect(result.current).toBe("loading");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("slow");
  });

  it("is idle when nothing loads, and work that finishes at 0.5s never shows loading UI", () => {
    const { result, rerender } = renderHook(({ loading }) => useLoadingPhase(loading), {
      initialProps: { loading: false },
    });
    expect(result.current).toBe("idle");
    rerender({ loading: true });
    expect(result.current).toBe("quiet");
    act(() => vi.advanceTimersByTime(500));
    rerender({ loading: false });
    expect(result.current).toBe("idle");
    act(() => vi.advanceTimersByTime(LOADING_SLOW_MS));
    expect(result.current).toBe("idle");
  });

  it("starts again from quiet each time loading turns true", () => {
    const { result, rerender } = renderHook(({ loading }) => useLoadingPhase(loading), {
      initialProps: { loading: true },
    });
    act(() => vi.advanceTimersByTime(LOADING_SLOW_MS));
    expect(result.current).toBe("slow");
    rerender({ loading: false });
    rerender({ loading: true });
    expect(result.current).toBe("quiet");
  });

  it("runs on an injected clock and honours a zero delay", () => {
    const pending: { callback: () => void; ms: number }[] = [];
    const timers = {
      setTimeout: (callback: () => void, ms: number) => pending.push({ callback, ms }),
      clearTimeout: () => {},
    };
    const { result } = renderHook(() => useLoadingPhase(true, { delay: 0, slow: 3000, timers }));
    expect(result.current).toBe("loading");
    expect(pending.map(({ ms }) => ms)).toContain(3000);
    act(() => pending.find(({ ms }) => ms === 3000)?.callback());
    expect(result.current).toBe("slow");
  });

  it("waits as long as a pending action (--fui-pending-delay)", () => {
    const variables = readFileSync(resolve(__dirname, "../tokens/_variables.scss"), "utf8");
    const delay = /\$fui-pending-delay:\s*([\d.]+)(ms|s)/.exec(variables);
    expect(delay).not.toBeNull();
    const ms = delay![2] === "s" ? parseFloat(delay![1]) * 1000 : parseFloat(delay![1]);
    expect(LOADING_DELAY_MS).toBe(ms);
  });
});
