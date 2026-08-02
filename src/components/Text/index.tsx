import * as React from 'react';
import styles from './Text.module.scss';

/**
 * Typography component for rendering text with consistent styling.
 * @see https://usefragments.com/components/text
 */
export type TextRole =
  | 'caption'
  | 'ui-compact'
  | 'ui-standard'
  | 'body-compact'
  | 'body-relaxed'
  | 'title-sm'
  | 'title-md'
  | 'title-lg'
  | 'code';

export type TextSize = '2xs' | 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextFont = 'sans' | 'mono';
export type TextTracking = 'normal' | 'tight' | 'tighter' | 'tightest';

type TextSharedProps = Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'role'> & {
  children: React.ReactNode;
  /** HTML element to render.
   * @default "span" */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'div' | 'strong' | 'em' | 'small' | 'mark' | 'del' | 'ins' | 'sub' | 'sup' | 'time' | 'address' | 'blockquote' | 'cite' | 'code' | 'abbr';
  /** Text color. `"muted"` is an alias for `"tertiary"`. `"success" | "warning" | "danger"`
   * are for a run of text that carries a state on its own; prefer Badge or Alert when the
   * state deserves a container.
   * @default "primary" */
  color?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'success' | 'warning' | 'danger';
  /** Truncate text with ellipsis when it overflows */
  truncate?: boolean;
  /** Number of lines before truncating (requires truncate=true) */
  lineClamp?: number;
  /** Letter-spacing preset. `"tight"` suits dense UI chrome labels (-0.01em);
   * `"tighter"` suits headings and stat values (-0.02em); `"tightest"` suits
   * display numerics (-0.025em). Omit for the font's default tracking. */
  /** Use tabular (fixed-width) numerals so digits align in columns. Ideal for
   * stat values, tables, timestamps, and any updating number. */
  tabularNums?: boolean;
};

type TextRoleProps = {
  role: TextRole;
  size?: never;
  variant?: never;
  weight?: never;
  font?: never;
  letterSpacing?: never;
};

type TextLegacyScaleProps = {
  role?: never;
  size?: TextSize;
  variant?: 'section-label';
  weight?: TextWeight;
  font?: TextFont;
  letterSpacing?: TextTracking;
};

export type TextProps = TextSharedProps & (TextRoleProps | TextLegacyScaleProps);

const TextRoot = React.forwardRef<HTMLElement, TextProps>(
  function Text(
    {
      children,
      as: Component = 'span',
      role,
      variant,
      size,
      weight,
      color,
      font,
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
    const ignoredLegacyProps = role
      ? [size, variant, weight, font, letterSpacing].some((value) => value !== undefined)
      : false;

    if (process.env.NODE_ENV !== 'production' && ignoredLegacyProps) {
      console.warn(
        '[Text] Semantic role takes precedence over size, variant, weight, font, and letterSpacing.'
      );
    }

    const classes = [
      styles.text,
      role && styles[`role-${role}`],
      !role && variant && styles[`variant-${variant}`],
      !role && size && styles[`size-${size}`],
      !role && weight && styles[`weight-${weight}`],
      color && styles[`color-${color}`],
      !role && font === 'mono' && styles.mono,
      truncate && styles.truncate,
      lineClamp && styles.lineClamp,
      !role && letterSpacing && styles[`tracking-${letterSpacing}`],
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
