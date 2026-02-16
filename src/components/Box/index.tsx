import * as React from 'react';
import styles from './Box.module.scss';

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
  /** Border color variant */
  borderColor?: 'default' | 'strong' | 'accent' | 'danger';
  /** Box shadow */
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  /** Overflow behavior */
  overflow?: 'hidden' | 'auto' | 'scroll' | 'visible';
  /** Text color */
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'inverse';
  /** Display type */
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'none';
  /** Width (CSS value, e.g. "100%", "300px", 200) */
  width?: string | number;
  /** Min width */
  minWidth?: string | number;
  /** Max width */
  maxWidth?: string | number;
  /** Height (CSS value, e.g. "100%", "300px", 200) */
  height?: string | number;
  /** Min height */
  minHeight?: string | number;
  /** Max height */
  maxHeight?: string | number;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/** Convert string | number to CSS value */
function toCss(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

const BoxRoot = React.forwardRef<HTMLElement, BoxProps>(
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
      borderColor,
      shadow,
      overflow,
      color,
      display,
      width,
      minWidth,
      maxWidth,
      height,
      minHeight,
      maxHeight,
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
      borderColor && styles[`borderColor-${borderColor}`],
      shadow && styles[`shadow-${shadow}`],
      overflow && styles[`overflow-${overflow}`],
      color && styles[`color-${color}`],
      display && styles[`display-${display}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Build sizing styles only when props are provided
    const sizingStyle: React.CSSProperties = {};
    if (width != null) sizingStyle.width = toCss(width);
    if (minWidth != null) sizingStyle.minWidth = toCss(minWidth);
    if (maxWidth != null) sizingStyle.maxWidth = toCss(maxWidth);
    if (height != null) sizingStyle.height = toCss(height);
    if (minHeight != null) sizingStyle.minHeight = toCss(minHeight);
    if (maxHeight != null) sizingStyle.maxHeight = toCss(maxHeight);

    const hasSizing = Object.keys(sizingStyle).length > 0;
    const mergedStyle = hasSizing ? { ...sizingStyle, ...style } : style;

    return (
      <Component ref={ref as React.Ref<never>} className={classes} style={mergedStyle}>
        {children}
      </Component>
    );
  }
);

export const Box = Object.assign(BoxRoot, {
  Root: BoxRoot,
});
