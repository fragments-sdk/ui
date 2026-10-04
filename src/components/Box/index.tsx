import * as React from "react";
import styles from "./Box.module.scss";
// Global styles (tokens and resets) load through the package entry, not per component.

/** The four planes a box can sit on, from the page floor upward. */
export type BoxPlane = "canvas" | "band" | "surface" | "raised";

/** The one hairline, on every side or on one logical block side. */
export type BoxBorder = boolean | "block-start" | "block-end";

/** Corner role: none, a control corner, nested inside a surface, or the surface corner. */
export type BoxRadius = "none" | "control" | "nested" | "surface";

/** Surface inset role: none, compact (12) or default (16). */
export type BoxInset = "none" | "compact" | "default";

export interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  /** HTML element to render */
  as?: "div" | "section" | "article" | "aside" | "main" | "header" | "footer" | "nav" | "span";
  /** The plane the box paints. Omit for a transparent box. */
  plane?: BoxPlane;
  /** The hairline: `true` on every side, or one logical block side. */
  border?: BoxBorder;
  /** Corner role */
  radius?: BoxRadius;
  /** Inner inset from the surface inset recipe */
  inset?: BoxInset;
}

const BoxRoot = React.forwardRef<HTMLElement, BoxProps>(function Box(
  { children, as: Component = "div", plane, border, radius, inset, className, ...htmlProps },
  ref
) {
  const classes = [
    styles.box,
    plane && styles[`plane-${plane}`],
    border === true && styles.border,
    typeof border === "string" && styles[`border-${border}`],
    radius && styles[`radius-${radius}`],
    inset && styles[`inset-${inset}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return React.createElement(Component, { ref, className: classes, ...htmlProps }, children);
});

export const Box = Object.assign(BoxRoot, { Root: BoxRoot });
