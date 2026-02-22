import * as React from 'react';
import styles from './VisuallyHidden.module.scss';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** HTML element to render */
  as?: 'span' | 'div';
}

/**
 * VisuallyHidden hides content visually while keeping it accessible to screen readers.
 * Use this for labels, descriptions, or other text that should be announced by assistive
 * technology but not displayed visually.
 *
 * @example
 * <Button>
 *   <SearchIcon />
 *   <VisuallyHidden>Search</VisuallyHidden>
 * </Button>
 */
const VisuallyHiddenRoot = React.forwardRef<HTMLElement, VisuallyHiddenProps>(
  function VisuallyHidden({ children, as: Component = 'span', className, ...htmlProps }, ref) {
    return (
      <Component
        ref={ref as React.Ref<never>}
        {...htmlProps}
        className={[styles.visuallyHidden, className].filter(Boolean).join(' ')}
      >
        {children}
      </Component>
    );
  }
);

export const VisuallyHidden = Object.assign(VisuallyHiddenRoot, {
  Root: VisuallyHiddenRoot,
});
