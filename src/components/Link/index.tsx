import * as React from 'react';
import styles from './Link.module.scss';

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
