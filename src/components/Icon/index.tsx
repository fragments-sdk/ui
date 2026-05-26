'use client';

import * as React from 'react';
import styles from './Icon.module.scss';

// Pixel values of the shared `--fui-icon-*` ladder (also exported as CSS vars
// from the token layer). The icon library `size` prop needs a numeric px value,
// so the same ladder is mirrored here as the single source instead of a bespoke
// per-component scale.
const FUI_ICON_PX = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
} as const;

type AnyIconComponent = React.ComponentType<any>;
type IconComponentProps<TIcon extends AnyIconComponent> = React.ComponentPropsWithoutRef<TIcon>;

export type IconProps<TIcon extends AnyIconComponent = AnyIconComponent> =
  Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> & {
    /** The icon component to render */
    icon: TIcon;
    /** Size of the icon */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Optional style/weight hint forwarded when the icon component supports a `weight` prop */
    weight?: string;
    /** Semantic color variant */
    variant?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error';
    /** @deprecated Use variant instead */
    color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error';
    /** Additional props forwarded to the underlying icon component (typed from `icon`) */
    iconProps?: Partial<IconComponentProps<TIcon>>;
  };

// Sourced from the shared `--fui-icon-*` ladder (12/14/16/20/24/32px) so this
// stops being a separate hardcoded size scale. NOTE: Icon's public size names
// are offset by one step from the icon-token names — Icon `xs/sm/md/lg/xl` map
// to icon `xs/md/lg/xl/2xl` (skipping icon-sm=14). Preserved to keep the
// rendered px identical for existing consumers.
const sizeMap: Record<NonNullable<IconProps['size']>, number> = {
  xs: FUI_ICON_PX['xs'], // 12
  sm: FUI_ICON_PX['md'], // 16
  md: FUI_ICON_PX['lg'], // 20
  lg: FUI_ICON_PX['xl'], // 24
  xl: FUI_ICON_PX['2xl'], // 32
};

const IconRoot = React.forwardRef<HTMLSpanElement, IconProps>(
  function Icon(
    {
      icon: IconComponent,
      size = 'md',
      weight = 'regular',
      variant,
      color,
      iconProps,
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

    const resolvedIconProps = {
      ...(iconProps as Record<string, unknown> | undefined),
    };

    // Provide sensible defaults for icon libraries that support common props.
    if (!('size' in resolvedIconProps)) {
      resolvedIconProps.size = sizeMap[size];
    }
    if (weight && !('weight' in resolvedIconProps)) {
      resolvedIconProps.weight = weight;
    }

    return (
      <span ref={ref} {...htmlProps} className={classes} style={style}>
        <IconComponent {...resolvedIconProps} />
      </span>
    );
  }
);

type IconComponentSignature = <TIcon extends AnyIconComponent = AnyIconComponent>(
  props: IconProps<TIcon> & React.RefAttributes<HTMLSpanElement>
) => React.ReactElement | null;

export const Icon = Object.assign(IconRoot, {
  Root: IconRoot,
}) as typeof IconRoot & IconComponentSignature & {
  Root: typeof IconRoot;
};
