import * as React from "react";
import { Separator } from "../Separator";
import styles from "./Stack.module.scss";

export type StackDirection = "row" | "column";
export type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between";
export type StackElement =
  | "div"
  | "section"
  | "nav"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "main"
  | "ul"
  | "ol";

/**
 * Flexbox layout for vertical or horizontal stacking with consistent spacing.
 * @see https://usefragments.com/components/stack
 */
export interface StackProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "style" | "className"
> {
  children: React.ReactNode;
  /** Direction children flow in
   * @default "column" */
  direction?: StackDirection;
  /** Space between children, on the layout gap scale (0, 4, 8, 12, 16, 24)
   * @default "md" */
  gap?: StackGap;
  /** Cross-axis alignment */
  align?: StackAlign;
  /** Main-axis distribution */
  justify?: StackJustify;
  /** Let children wrap onto new lines */
  wrap?: boolean;
  /**
   * Draw a Separator between children (horizontal in a column, vertical in a
   * row). Inside `ul`/`ol` each divider is a hidden `li`. Ignored when
   * `collapseBelow` is set, since the flow can change under it.
   */
  divided?: boolean;
  /**
   * A CSS length. The children sit side by side in equal shares while the
   * Stack itself is at least this wide, and stack into a column below it.
   * Measured against the Stack's own width, never the viewport, so it holds
   * inside panes and cards. Implies a row; `direction` is ignored.
   */
  collapseBelow?: string;
  /** Host element; `ul` and `ol` keep list semantics, dividers included */
  as?: StackElement;
  className?: string;
  style?: React.CSSProperties;
}

const StackRoot = React.forwardRef<HTMLElement, StackProps>(function Stack(
  {
    children,
    direction = "column",
    gap = "md",
    align,
    justify,
    wrap = false,
    divided = false,
    collapseBelow,
    as: Component = "div",
    className,
    style,
    ...htmlProps
  },
  ref
) {
  const collapsing = collapseBelow != null;
  const flow: StackDirection = collapsing ? "row" : direction;

  const classes = [
    styles.stack,
    styles[flow],
    styles[`gap-${gap}`],
    align && styles[`align-${align}`],
    justify && styles[`justify-${justify}`],
    wrap && styles.wrap,
    collapsing && styles.collapse,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle = collapsing
    ? ({ "--_fui-stack-collapse": collapseBelow, ...style } as React.CSSProperties)
    : style;

  let content: React.ReactNode = children;
  if (divided && !collapsing) {
    const items = React.Children.toArray(children).filter(Boolean);
    const isList = Component === "ul" || Component === "ol";
    const orientation = flow === "row" ? "vertical" : "horizontal";
    content = items.flatMap((child, index) => {
      if (index === 0) return [child];
      const key = `divider-${React.isValidElement(child) && child.key != null ? child.key : index}`;
      // Inside a list the divider is a hidden list item, so the list only
      // ever holds li children and its item count stays true.
      const divider = isList ? (
        <li key={key} aria-hidden="true" className={styles.divider}>
          <Separator orientation={orientation} />
        </li>
      ) : (
        <Separator key={key} orientation={orientation} />
      );
      return [divider, child];
    });
  }

  return (
    <Component {...htmlProps} ref={ref as React.Ref<never>} className={classes} style={mergedStyle}>
      {content}
    </Component>
  );
});

export const Stack = Object.assign(StackRoot, {
  Root: StackRoot,
});
