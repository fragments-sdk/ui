import * as React from 'react';
import styles from './Link.module.scss';
import '../../styles/globals.scss';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'subtle' | 'muted';
  /** Underline style */
  underline?: 'always' | 'hover' | 'none';
  /** Open in new tab (adds rel="noopener noreferrer") */
  external?: boolean;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(
    {
      children,
      variant = 'default',
      underline = 'hover',
      external = false,
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

    return (
      <a ref={ref} className={classes} style={style} {...externalProps} {...props}>
        {children}
      </a>
    );
  }
);
