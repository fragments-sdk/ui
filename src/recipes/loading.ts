"use client";

import { useEffect, useState } from "react";

/**
 * How long work runs before any loading UI shows. Work that finishes sooner shows
 * nothing. Twin of `--fui-pending-delay` (1s), which times a pending action.
 */
export const LOADING_DELAY_MS = 1000;

/** How long work runs before it is slow: progress plus a way to cancel. */
export const LOADING_SLOW_MS = 10_000;

/**
 * Where a wait stands.
 * - `idle`: nothing is loading.
 * - `quiet`: loading for under `delay`; show nothing.
 * - `loading`: a skeleton in the final geometry, or a spinner where the result will be.
 * - `slow`: past `slow`; show progress and a way to cancel.
 */
export type LoadingPhase = "idle" | "quiet" | "loading" | "slow";

/** The clock the phases run on: the browser's timers unless a test passes its own. */
export interface LoadingTimers {
  setTimeout: (callback: () => void, ms: number) => unknown;
  clearTimeout: (handle: unknown) => void;
}

export interface UseLoadingPhaseOptions {
  /** Milliseconds of quiet before loading UI shows. @default LOADING_DELAY_MS */
  delay?: number;
  /** Milliseconds before the wait is slow. @default LOADING_SLOW_MS */
  slow?: number;
  /** A stable clock to run on (a test's fake timers). @default the global timers */
  timers?: LoadingTimers;
}

const globalTimers: LoadingTimers = {
  setTimeout: (callback, ms) => globalThis.setTimeout(callback, ms),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
};

type Running = Exclude<LoadingPhase, "idle">;

/**
 * The loading phase for work that is running while `loading` is true. Under a
 * second it is `quiet` (show nothing), then `loading` (skeleton or spinner), and
 * past ten seconds `slow` (progress plus cancel). It starts again each time
 * `loading` turns true.
 */
export function useLoadingPhase(
  loading: boolean,
  { delay = LOADING_DELAY_MS, slow = LOADING_SLOW_MS, timers }: UseLoadingPhaseOptions = {}
): LoadingPhase {
  const first: Running = delay > 0 ? "quiet" : "loading";
  const [stage, setStage] = useState<Running>(first);
  const [wasLoading, setWasLoading] = useState(loading);
  if (loading !== wasLoading) {
    setWasLoading(loading);
    setStage(first);
  }

  useEffect(() => {
    if (!loading) return;
    const clock = timers ?? globalTimers;
    const handles: unknown[] = [];
    if (delay > 0) {
      handles.push(
        clock.setTimeout(() => setStage((now) => (now === "quiet" ? "loading" : now)), delay)
      );
    }
    handles.push(clock.setTimeout(() => setStage("slow"), Math.max(slow, delay)));
    return () => {
      for (const handle of handles) clock.clearTimeout(handle);
    };
  }, [loading, delay, slow, timers]);

  return loading ? stage : "idle";
}
