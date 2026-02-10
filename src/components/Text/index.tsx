import * as React from 'react';
import styles from './Text.module.scss';
import '../../styles/globals.scss';

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'div' | 'strong' | 'em' | 'small' | 'mark' | 'del' | 'ins' | 'sub' | 'sup' | 'time' | 'address' | 'blockquote' | 'cite' | 'code' | 'abbr';
  size?: '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'normal' | 'medium' | 'semibold';
  color?: 'primary' | 'secondary' | 'tertiary';
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
