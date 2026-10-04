import * as React from "react";

/**
 * Watches a scroll region and:
 * - while it overflows on the block axis, marks it `data-fui-overflowing`, so a sibling after it
 *   (a sheet footer) can draw the edge the content scrolls under;
 * - while it overflows on either axis, puts it in the tab order, so a sheet body, a page frame or
 *   a wide table that holds no focusable element can still be scrolled from the keyboard. One
 *   that fits adds no empty tab stop, and an authored `tabIndex` is left alone.
 */
export function useOverflowFocusable<T extends HTMLElement>(
  forwardedRef?: React.Ref<T>
): React.RefCallback<T> {
  const observer = React.useRef<ResizeObserver | null>(null);
  const mutations = React.useRef<MutationObserver | null>(null);

  return React.useCallback(
    (node: T | null) => {
      observer.current?.disconnect();
      mutations.current?.disconnect();
      observer.current = null;
      mutations.current = null;

      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<T | null>).current = node;

      if (!node || typeof ResizeObserver === "undefined") return;
      const authored =
        node.getAttribute("tabindex") !== null && !node.hasAttribute("data-fui-overflow-focus");

      const sync = () => {
        const overflowing = node.scrollHeight > node.clientHeight + 1;
        node.toggleAttribute("data-fui-overflowing", overflowing);
        if (authored) return;
        if (overflowing || node.scrollWidth > node.clientWidth + 1) {
          node.setAttribute("tabindex", "0");
          node.setAttribute("data-fui-overflow-focus", "");
        } else if (node.hasAttribute("data-fui-overflow-focus")) {
          node.removeAttribute("tabindex");
          node.removeAttribute("data-fui-overflow-focus");
        }
      };

      const resize = new ResizeObserver(sync);
      const watch = () => {
        resize.disconnect();
        resize.observe(node);
        for (const child of Array.from(node.children)) resize.observe(child);
        sync();
      };
      observer.current = resize;
      watch();
      if (typeof MutationObserver !== "undefined") {
        mutations.current = new MutationObserver(watch);
        mutations.current.observe(node, { childList: true });
      }
    },
    [forwardedRef]
  );
}
