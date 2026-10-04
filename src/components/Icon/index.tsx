import * as React from "react";
import { MEASUREMENT_PROFILES, measurementPx } from "../../measurements";
import styles from "./Icon.module.scss";

/** Any icon component that takes `size` (and, optionally, `weight`). Icon
 * passes nothing else to the glyph. */
type AnyIconComponent = React.ComponentType<any>;

/** The glyph ladder: 12, 14, 16, 18 and 24. Nothing above 24 belongs in a
 * control-scale interface. */
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
/** The three weights the system draws. */
export type IconWeight = "regular" | "bold" | "fill";
/** One ink axis: the two quiet text inks, the accent ink, and the four status
 * inks. Omit it to inherit `currentColor`. */
export type IconTone =
  | "secondary"
  | "tertiary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "danger";

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** The icon component to render. */
  icon: AnyIconComponent;
  /** A step on the glyph ladder: xs 12, sm 14, md 16, lg 18, xl 24.
   * @default "md" */
  size?: IconSize;
  /** The glyph weight, forwarded to icon components that take one.
   * @default "regular" */
  weight?: IconWeight;
  /** The glyph ink. `secondary` and `tertiary` follow the text ladder;
   * `accent` is the accent ink; the status inks mark real state only. Omit to
   * inherit `currentColor`. */
  tone?: IconTone;
}

const iconTargets = MEASUREMENT_PROFILES.targets.icon;

const TONE_CLASS: Record<IconTone, string> = {
  secondary: styles.toneSecondary,
  tertiary: styles.toneTertiary,
  accent: styles.toneAccent,
  info: styles.toneInfo,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
};

const IconRoot = React.forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { icon: IconComponent, size = "md", weight = "regular", tone, className, ...htmlProps },
  ref
) {
  const classes = [styles.icon, styles[size], tone ? TONE_CLASS[tone] : undefined, className]
    .filter(Boolean)
    .join(" ");

  // Decorative until labelled: an unlabelled icon is hidden from assistive
  // technology; a labelled one is announced once, as an image. An explicit
  // `aria-hidden` or `role` from the caller wins.
  const labelled = Boolean(htmlProps["aria-label"] || htmlProps["aria-labelledby"]);
  const a11yProps = labelled
    ? { role: htmlProps.role ?? "img" }
    : { "aria-hidden": htmlProps["aria-hidden"] ?? true };

  return (
    <span ref={ref} {...htmlProps} {...a11yProps} className={classes}>
      <IconComponent
        size={measurementPx(iconTargets[size], `targets.icon.${size}`)}
        weight={weight}
      />
    </span>
  );
});

export const Icon = Object.assign(IconRoot, {
  Root: IconRoot,
});
