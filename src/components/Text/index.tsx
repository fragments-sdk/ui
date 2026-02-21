import * as React from 'react';
import styles from './Text.module.scss';

/**
 * Typography component for rendering text with consistent styling.
 * @see https://usefragments.com/components/text
 */
export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  children: React.ReactNode;
  /** HTML element to render.
   * @default "span" */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'div' | 'strong' | 'em' | 'small' | 'mark' | 'del' | 'ins' | 'sub' | 'sup' | 'time' | 'address' | 'blockquote' | 'cite' | 'code' | 'abbr';
  /** Preset text variant */
  variant?: 'section-label';
  /** Font size. `"md"` is an alias for `"base"`.
   * @see https://usefragments.com/components/text#sizes */
  size?: '2xs' | 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl';
  /** Font weight.
   * @default "normal" */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Text color. `"muted"` is an alias for `"tertiary"`.
   * @default "primary" */
  color?: 'primary' | 'secondary' | 'tertiary' | 'muted';
  /** Font family.
   * @default "sans" */
  font?: 'sans' | 'mono';
  /** Truncate text with ellipsis when it overflows */
  truncate?: boolean;
  /** Number of lines before truncating (requires truncate=true) */
  lineClamp?: number;
}

const TextRoot = React.forwardRef<HTMLElement, TextProps>(
  function Text(
    {
      children,
      as: Component = 'span',
      variant,
      size,
      weight,
      color,
      font = 'sans',
      truncate,
      lineClamp,
      className,
      style,
      ...htmlProps
    },
    ref
  ) {
    const classes = [
      styles.text,
      variant && styles[`variant-${variant}`],
      size && styles[`size-${size}`],
      weight && styles[`weight-${weight}`],
      color && styles[`color-${color}`],
      font === 'mono' && styles.mono,
      truncate && styles.truncate,
      lineClamp && styles.lineClamp,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const lineClampStyle = lineClamp
      ? { '--fui-line-clamp': lineClamp, ...style } as React.CSSProperties
      : style;

    return (
      <Component ref={ref as React.Ref<never>} className={classes} style={lineClampStyle} {...htmlProps}>
        {children}
      </Component>
    );
  }
);

export const Text = Object.assign(TextRoot, {
  Root: TextRoot,
});
