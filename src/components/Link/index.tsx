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

export type LinkTone = 'accent' | 'neutral';
export type LinkColor = 'primary' | 'secondary' | 'tertiary';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> {
  children: React.ReactNode;
  /** Colour. `accent` (default) is the link ink; `neutral` reads as body text
   * until hovered, for secondary and contextual links.
   * @default 'accent' */
  tone?: LinkTone;
  /** Text-hierarchy colour for a `neutral` link (Text's `color` axis).
   * `tertiary` is the quietest link, for metadata and footers. */
  color?: LinkColor;
  /** Underline style */
  underline?: 'always' | 'hover' | 'none' | 'dotted';
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

const TONE_CLASS: Record<LinkTone, string> = {
  accent: styles.toneAccent,
  neutral: styles.toneNeutral,
};

const COLOR_CLASS: Record<LinkColor, string> = {
  primary: styles.colorPrimary,
  secondary: styles.colorSecondary,
  tertiary: styles.colorTertiary,
};

const LinkRoot = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(
    {
      children,
      tone = 'accent',
      color,
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
      TONE_CLASS[tone],
      color && COLOR_CLASS[color],
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
