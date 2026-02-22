import * as React from 'react';
import styles from './Link.module.scss';

function composeEventHandlers<T extends (...args: any[]) => void>(
  childHandler: T | undefined,
  parentHandler: T | undefined
) {
  if (!childHandler) return parentHandler;
  if (!parentHandler) return childHandler;
  return ((...args: Parameters<T>) => {
    childHandler(...args);
    parentHandler(...args);
  }) as T;
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'subtle' | 'muted';
  /** Underline style */
  underline?: 'always' | 'hover' | 'none';
  /** Open in new tab (adds rel="noopener noreferrer") */
  external?: boolean;
  /**
   * Render as child element (polymorphic). When true, clones the single child
   * and merges link props onto it. Useful for rendering as Next.js Link, etc.
   */
  asChild?: boolean;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const LinkRoot = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(
    {
      children,
      variant = 'default',
      underline = 'hover',
      external = false,
      asChild = false,
      className,
      style,
      target,
      rel,
      ...props
    },
    ref
  ) {
    const classes = [
      styles.link,
      styles[variant],
      styles[`underline-${underline}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Handle external links
    const externalProps = external
      ? {
          target: target || '_blank',
          rel: rel || 'noopener noreferrer',
        }
      : { target, rel };

    if (asChild && React.isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>;
      const mergedProps: Record<string, unknown> = {
        ref,
        className: childProps.className
          ? `${classes} ${childProps.className}`
          : classes,
        style: { ...style, ...(childProps.style as React.CSSProperties | undefined) },
        ...externalProps,
        ...props,
      };

      for (const [key, parentValue] of Object.entries({ ...externalProps, ...props })) {
        if (!key.startsWith('on') || typeof parentValue !== 'function') continue;
        const childValue = childProps[key];
        if (typeof childValue !== 'function') continue;
        mergedProps[key] = composeEventHandlers(
          childValue as (...args: unknown[]) => void,
          parentValue as (...args: unknown[]) => void
        );
      }
      return React.cloneElement(children, mergedProps);
    }

    return (
      <a ref={ref} className={classes} style={style} {...externalProps} {...props}>
        {children}
      </a>
    );
  }
);

export const Link = Object.assign(LinkRoot, {
  Root: LinkRoot,
});
