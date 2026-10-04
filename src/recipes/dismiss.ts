"use client";

import { useCallback, useRef, useState, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]:not([contenteditable='false'])",
].join(", ");

// Focusable but out of the tab order, or announced as unavailable: never a landing spot.
const SKIPPED = "[tabindex='-1'], [aria-disabled='true']";

function reachable(element: HTMLElement) {
  if (element.matches(SKIPPED)) return false;
  if (element.closest("[hidden], [inert], [aria-hidden='true']")) return false;
  // Engines without `checkVisibility` (test DOMs) count an element as visible.
  return typeof element.checkVisibility === "function" ? element.checkVisibility() : true;
}

/**
 * Where focus goes when `element` leaves: the next focusable element after it in
 * document order, else the one before it, else nothing.
 */
export function nextFocusTarget(element: HTMLElement): HTMLElement | null {
  const candidates = [...element.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (candidate) => !element.contains(candidate) && reachable(candidate)
  );
  const after = candidates.find(
    (candidate) => element.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING
  );
  if (after) return after;
  const before = candidates.filter(
    (candidate) => element.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_PRECEDING
  );
  return before[before.length - 1] ?? null;
}

export interface UseDismissOptions {
  /** Called once when the element is dismissed. */
  onDismiss?: () => void;
  /** Where focus goes instead of the next focusable element. */
  returnFocus?: () => HTMLElement | null;
}

export interface UseDismissResult<T extends HTMLElement> {
  /** Put on the element that leaves. */
  ref: RefObject<T | null>;
  /** True once dismissed: render nothing. */
  dismissed: boolean;
  /** Dismiss now. */
  dismiss: () => void;
}

/**
 * Dismissal for feedback that leaves in place (an alert, a notice): it leaves at
 * once, with no exit motion, and when focus was inside it (on its close button)
 * focus moves to the next logical item first, so it never falls to the page.
 */
export function useDismiss<T extends HTMLElement = HTMLElement>({
  onDismiss,
  returnFocus,
}: UseDismissOptions = {}): UseDismissResult<T> {
  const ref = useRef<T | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const dismiss = useCallback(() => {
    const element = ref.current;
    if (element && element.contains(element.ownerDocument.activeElement)) {
      const target = returnFocus?.() ?? nextFocusTarget(element);
      target?.focus();
    }
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss, returnFocus]);
  return { ref, dismissed, dismiss };
}
