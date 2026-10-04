import * as React from "react";
import styles from "./VisuallyHidden.module.scss";

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** HTML element to render */
  as?: "span" | "div";
  /**
   * Reveal the content while focus is inside it, as a raised chip pinned to
   * the top inline-start corner of the viewport. Use it for skip links.
   */
  focusable?: boolean;
}

/**
 * VisuallyHidden hides content visually while keeping it accessible to screen readers.
 * Use this for labels, descriptions, or other text that should be announced by assistive
 * technology but not displayed visually. With `focusable`, the content shows as a
 * raised chip while it holds keyboard focus (skip links).
 *
 * @example
 * <Button>
 *   <SearchIcon />
 *   <VisuallyHidden>Search</VisuallyHidden>
 * </Button>
 */
const VisuallyHiddenRoot = React.forwardRef<HTMLElement, VisuallyHiddenProps>(
  function VisuallyHidden(
    { children, as: Component = "span", focusable = false, className, ...htmlProps },
    ref
  ) {
    return (
      <Component
        ref={ref as React.Ref<never>}
        {...htmlProps}
        className={[styles.visuallyHidden, focusable && styles.focusable, className]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </Component>
    );
  }
);

export const VisuallyHidden = Object.assign(VisuallyHiddenRoot, {
  Root: VisuallyHiddenRoot,
});
