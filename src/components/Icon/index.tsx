"use client";

import * as React from "react";
import { MEASUREMENT_PROFILES, measurementPx } from "../../measurements";
import styles from "./Icon.module.scss";

type AnyIconComponent = React.ComponentType<any>;
type IconComponentProps<TIcon extends AnyIconComponent> = React.ComponentPropsWithoutRef<TIcon>;

export type IconProps<TIcon extends AnyIconComponent = AnyIconComponent> = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "color"
> & {
  /** The icon component to render */
  icon: TIcon;
  /** Size of the icon */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Optional style/weight hint forwarded when the icon component supports a `weight` prop */
  weight?: string;
  /** Semantic color variant */
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "tertiary"
    | "accent"
    | "success"
    | "warning"
    | "error";
  /** @deprecated Use variant instead */
  color?: "primary" | "secondary" | "tertiary" | "accent" | "success" | "warning" | "error";
  /** Additional props forwarded to the underlying icon component (typed from `icon`) */
  iconProps?: Partial<IconComponentProps<TIcon>>;
};

const iconTargets = MEASUREMENT_PROFILES.targets.icon;
type IconSize = NonNullable<IconProps["size"]>;

const IconRoot = React.forwardRef<HTMLSpanElement, IconProps>(function Icon(
  {
    icon: IconComponent,
    size = "md",
    weight = "regular",
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
    size === "2xl" ? styles.size2xl : styles[size as Exclude<IconSize, "2xl">],
    colorVariant && colorVariant !== "default" && styles[colorVariant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const resolvedIconProps = {
    ...(iconProps as Record<string, unknown> | undefined),
  };

  // Provide sensible defaults for icon libraries that support common props.
  if (!("size" in resolvedIconProps)) {
    resolvedIconProps.size = measurementPx(iconTargets[size], `targets.icon.${size}`);
  }
  if (weight && !("weight" in resolvedIconProps)) {
    resolvedIconProps.weight = weight;
  }

  return (
    <span ref={ref} {...htmlProps} className={classes} style={style}>
      <IconComponent {...resolvedIconProps} />
    </span>
  );
});

type IconComponentSignature = <TIcon extends AnyIconComponent = AnyIconComponent>(
  props: IconProps<TIcon> & React.RefAttributes<HTMLSpanElement>
) => React.ReactElement | null;

export const Icon = Object.assign(IconRoot, {
  Root: IconRoot,
}) as typeof IconRoot &
  IconComponentSignature & {
    Root: typeof IconRoot;
  };
