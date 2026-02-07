import * as React from 'react';
import styles from './Box.module.scss';
import '../../styles/globals.scss';

export interface BoxProps {
  children?: React.ReactNode;
  /** HTML element to render */
  as?: 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'nav' | 'span';
  /** Padding on all sides */
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Horizontal padding (overrides padding) */
  paddingX?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Vertical padding (overrides padding) */
  paddingY?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Margin on all sides */
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  /** Horizontal margin (overrides margin) */
  marginX?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  /** Vertical margin (overrides margin) */
  marginY?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  /** Background color */
  background?: 'none' | 'primary' | 'secondary' | 'tertiary' | 'elevated';
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Border */
  border?: boolean;
  /** Top border */
  borderTop?: boolean;
  /** Bottom border */
  borderBottom?: boolean;
  /** Left border */
  borderLeft?: boolean;
  /** Right border */
  borderRight?: boolean;
  /** Box shadow */
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  /** Overflow behavior */
  overflow?: 'hidden' | 'auto' | 'scroll' | 'visible';
  /** Text color */
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'inverse';
  /** Display type */
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'none';
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export const Box = React.forwardRef<HTMLElement, BoxProps>(
  function Box(
    {
      children,
      as: Component = 'div',
      padding,
      paddingX,
      paddingY,
      margin,
      marginX,
      marginY,
      background,
      rounded,
      border,
      borderTop,
      borderBottom,
      borderLeft,
      borderRight,
      shadow,
      overflow,
      color,
      display,
      className,
      style,
    },
    ref
  ) {
    const classes = [
      styles.box,
      padding && styles[`p-${padding}`],
      paddingX && styles[`px-${paddingX}`],
      paddingY && styles[`py-${paddingY}`],
      margin && styles[`m-${margin}`],
      marginX && styles[`mx-${marginX}`],
      marginY && styles[`my-${marginY}`],
      background && styles[`bg-${background}`],
      rounded && styles[`rounded-${rounded}`],
      border && styles.border,
      borderTop && styles.borderTop,
      borderBottom && styles.borderBottom,
      borderLeft && styles.borderLeft,
      borderRight && styles.borderRight,
      shadow && styles[`shadow-${shadow}`],
      overflow && styles[`overflow-${overflow}`],
      color && styles[`color-${color}`],
      display && styles[`display-${display}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Component ref={ref as React.Ref<never>} className={classes} style={style}>
        {children}
      </Component>
    );
  }
);
