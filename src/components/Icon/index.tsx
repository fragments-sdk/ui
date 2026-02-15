'use client';

import * as React from 'react';
import type { IconProps as PhosphorIconProps } from '@phosphor-icons/react';
import styles from './Icon.module.scss';
import '../../styles/globals.scss';

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** The Phosphor icon component to render */
  icon: React.ComponentType<PhosphorIconProps>;
  /** Size of the icon */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Weight/style of the icon */
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  /** Semantic color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error';
  /** @deprecated Use variant instead */
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error';
}

const sizeMap: Record<NonNullable<IconProps['size']>, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const IconRoot = React.forwardRef<HTMLSpanElement, IconProps>(
  function Icon(
    {
      icon: IconComponent,
      size = 'md',
      weight = 'regular',
      variant,
      color,
      className,
      style,
      ...htmlProps
    },
    ref
  ) {
    // Support deprecated color prop (variant takes precedence)
    const colorVariant = variant || color;

    const classes = [
      styles.icon,
      colorVariant && colorVariant !== 'default' && styles[colorVariant],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} {...htmlProps} className={classes} style={style}>
        <IconComponent size={sizeMap[size]} weight={weight} />
      </span>
    );
  }
);

export const Icon = Object.assign(IconRoot, {
  Root: IconRoot,
});
