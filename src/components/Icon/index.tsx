"use client";

import * as React from "react";
import { MEASUREMENT_PROFILES, measurementPx } from "../../measurements";
import styles from "./Icon.module.scss";

type AnyIconComponent = React.ComponentType<any>;
type IconComponentProps<TIcon extends AnyIconComponent> = React.ComponentPropsWithoutRef<TIcon>;

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
export type IconTone = "accent" | "info" | "success" | "warning" | "danger";
export type IconColor = "primary" | "secondary" | "tertiary";

export type IconProps<TIcon extends AnyIconComponent = AnyIconComponent> = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "color"
> & {
  /** The icon component to render */
  icon: TIcon;
  /** Size of the icon. `xl` is the largest step (24px); the glyph inherits
   * `currentColor` and the surrounding line height.
   * @default "md" */
  size?: IconSize;
  /** Optional style/weight hint forwarded when the icon component supports a `weight` prop */
  weight?: string;
  /** Semantic colour. Reserve `success`, `warning` and `danger` for real
   * state; `accent` is the brand spend. Omit to inherit `currentColor`. */
  tone?: IconTone;
  /** Text-hierarchy colour, the same axis as Text's `color`. `tone` wins when
   * both are set. Omit to inherit `currentColor`. */
  color?: IconColor;
  /** Additional props forwarded to the underlying icon component (typed from `icon`) */
  iconProps?: Partial<IconComponentProps<TIcon>>;
};

const iconTargets = MEASUREMENT_PROFILES.targets.icon;

const TONE_CLASS: Record<IconTone, string> = {
  accent: styles.toneAccent,
  info: styles.toneInfo,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
};

const COLOR_CLASS: Record<IconColor, string> = {
  primary: styles.colorPrimary,
  secondary: styles.colorSecondary,
  tertiary: styles.colorTertiary,
};

const IconRoot = React.forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { icon: IconComponent, size = "md", weight = "regular", tone, color, iconProps, className, style, ...htmlProps },
  ref
) {
  const classes = [
    styles.icon,
    styles[size],
    tone ? TONE_CLASS[tone] : color ? COLOR_CLASS[color] : undefined,
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
