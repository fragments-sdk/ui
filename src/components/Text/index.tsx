import * as React from "react";
import styles from "./Text.module.scss";

/**
 * Typography on the Glass ladder: 11, 12, 15 and 24, at the regular and the
 * strong weight.
 * @see https://usefragments.com/components/text
 */
export type TextType =
  | "caption"
  | "control"
  | "body"
  | "title"
  | "display"
  | "code"
  | "section-label";

export type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  children: React.ReactNode;
  /** HTML element to render.
   * @default "span" */
  as?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "p"
    | "span"
    | "label"
    | "div"
    | "strong"
    | "em"
    | "small"
    | "mark"
    | "del"
    | "ins"
    | "sub"
    | "sup"
    | "time"
    | "address"
    | "blockquote"
    | "cite"
    | "code"
    | "abbr";
  /** The step on the type ladder. A step owns size, line height, weight and
   * tracking together. `role` stays the ARIA attribute; `variant` is chrome
   * only in this library, so the step is `type`.
   *
   * - `caption` 11: metadata, timestamps, footnotes.
   * - `control` 11: a label that sits with controls.
   * - `body` 12: running text (the default).
   * - `title` 15 at the strong weight: a card or section title.
   * - `display` 24 at the strong weight: the one statement at the top of a page.
   * - `code` 12 in the mono face: a digest, a path, a command.
   * - `section-label` 11 at the strong weight in tertiary ink: the small heading over a list.
   * @default "body" */
  type?: TextType;
  /** The strong weight for the configured font on any role. A section's
   * header is body in the strong weight, never a bigger step. */
  strong?: boolean;
  /** Ink. `accent` is the brand spend for one word inside a line (a repo
   * name), in the accent's text ink. `success`, `warning` and `danger` are for
   * a run of text that carries a state on its own; prefer Badge or Alert when
   * the state deserves a container.
   * @default "primary" */
  color?: TextColor;
  /** Truncate text with ellipsis when it overflows */
  truncate?: boolean;
  /** Number of lines before truncating */
  lineClamp?: number;
  /** Use tabular (fixed-width) numerals so digits align in columns. Ideal for
   * stat values, tables, timestamps, and any updating number. */
  tabularNums?: boolean;
}

const TextRoot = React.forwardRef<HTMLElement, TextProps>(function Text(
  {
    children,
    as: Component = "span",
    type = "body",
    strong,
    color,
    truncate,
    lineClamp,
    tabularNums,
    className,
    style,
    ...htmlProps
  },
  ref
) {
  const classes = [
    styles.text,
    styles[`role-${type}`],
    strong && styles.strong,
    color && styles[`color-${color}`],
    truncate && styles.truncate,
    lineClamp && styles.lineClamp,
    tabularNums && styles.tabularNums,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const lineClampStyle = lineClamp
    ? ({ "--fui-line-clamp": lineClamp, ...style } as React.CSSProperties)
    : style;

  return (
    <Component
      ref={ref as React.Ref<never>}
      {...htmlProps}
      className={classes}
      style={lineClampStyle}
    >
      {children}
    </Component>
  );
});

export const Text = Object.assign(TextRoot, {
  Root: TextRoot,
});
