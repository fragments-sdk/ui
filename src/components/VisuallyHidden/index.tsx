import * as React from 'react';
import styles from './VisuallyHidden.module.scss';

export interface VisuallyHiddenProps {
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
export const VisuallyHidden = React.forwardRef<HTMLElement, VisuallyHiddenProps>(
  function VisuallyHidden({ children, as: Component = 'span' }, ref) {
    return (
      <Component ref={ref as React.Ref<never>} className={styles.visuallyHidden}>
        {children}
      </Component>
    );
  }
);
