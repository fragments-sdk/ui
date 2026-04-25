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
  /** Font size. Steps up the scale: 2xs (10), xs (12), sm/base (14), md (15 prose body),
   * lg (20), xl (24), 2xl (30), 3xl (36 page title), 4xl (48 hero).
   * @see https://usefragments.com/components/text#sizes */
  size?: '2xs' | 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
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
  /** Letter-spacing preset. `"tight"` suits dense UI chrome labels (-0.01em);
   * `"tighter"` suits headings and stat values (-0.02em); `"tightest"` suits
   * display numerics (-0.025em). Omit for the font's default tracking. */
  letterSpacing?: 'normal' | 'tight' | 'tighter' | 'tightest';
  /** Use tabular (fixed-width) numerals so digits align in columns. Ideal for
   * stat values, tables, timestamps, and any updating number. */
  tabularNums?: boolean;
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
      letterSpacing,
      tabularNums,
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
      letterSpacing && styles[`tracking-${letterSpacing}`],
      tabularNums && styles.tabularNums,
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
