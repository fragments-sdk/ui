"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import styles from "./List.module.scss";

// ============================================
// Types
// ============================================

export type ListMarker = "none" | "disc" | "icon";

export type ListGap = "none" | "xs" | "sm";

export interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  children: React.ReactNode;
  /**
   * List element. An `ol` numbers its items; a `ul` draws a bullet.
   * @default 'ul'
   */
  as?: "ul" | "ol";
  /**
   * Marker before each item, when it is not the default for `as` (numbers on
   * an `ol`, a bullet on a `ul`). Not chrome, so it is `marker`, not `variant`.
   */
  marker?: ListMarker;
  /**
   * Space between items: 0, 4 or 8. Larger rhythm belongs to the parent.
   * @default 'sm'
   */
  gap?: ListGap;
}

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  /** Leading glyph, drawn in the marker column in place of the marker. */
  icon?: React.ReactNode;
}

export interface ListRowProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /** The row's label. Truncates to one line. */
  children: React.ReactNode;
  /** Leading glyph: ink 3 at rest, ink 1 on the selected row. */
  icon?: React.ReactNode;
  /** Trailing detail (a count, a path, a time), in ink 3 at the label size. */
  meta?: React.ReactNode;
  /**
   * The chosen row: the selection wash and ring. Sets `aria-current` unless
   * you pass `aria-current` or `aria-pressed` yourself.
   */
  selected?: boolean;
  /**
   * Replace the button with another element, such as a link. Accepts an
   * element or a function that returns one.
   */
  render?: useRender.RenderProp;
}

// ============================================
// Components
// ============================================

const LIST_KIND = {
  none: styles.none,
  disc: styles.disc,
  icon: styles.icon,
  decimal: styles.decimal,
} as const;

function ListRoot({
  children,
  as: Component = "ul",
  marker,
  gap = "sm",
  className,
  ...htmlProps
}: ListProps) {
  const kind = marker ?? (Component === "ol" ? "decimal" : "disc");
  const classes = [styles.list, LIST_KIND[kind], styles[`gap-${gap}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Component {...htmlProps} className={classes}>
      {children}
    </Component>
  );
}

function ListItem({ children, icon, className, ...htmlProps }: ListItemProps) {
  const classes = [styles.item, icon != null && styles.iconItem, className]
    .filter(Boolean)
    .join(" ");

  return (
    <li {...htmlProps} className={classes}>
      {icon != null ? <span className={styles.iconWrapper}>{icon}</span> : null}
      <span className={styles.itemContent}>{children}</span>
    </li>
  );
}

const ListRow = React.forwardRef<HTMLButtonElement, ListRowProps>(function ListRow(
  { children, icon, meta, selected = false, render, className, ...htmlProps },
  ref
) {
  const marked = htmlProps["aria-current"] !== undefined || htmlProps["aria-pressed"] !== undefined;

  const element = useRender({
    render: render ?? <button type="button" />,
    ref,
    props: {
      ...htmlProps,
      "aria-current": marked ? htmlProps["aria-current"] : selected ? "true" : undefined,
      "data-selected": selected ? "" : undefined,
      className: [styles.row, className].filter(Boolean).join(" "),
      children: (
        <>
          {icon != null ? (
            <span className={styles.rowIcon} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <span className={styles.rowLabel}>{children}</span>
          {meta != null ? <span className={styles.rowMeta}>{meta}</span> : null}
        </>
      ),
    },
  });

  return <li className={styles.rowItem}>{element}</li>;
});

// ============================================
// Export compound component
// ============================================

export const List = Object.assign(ListRoot, {
  Root: ListRoot,
  Item: ListItem,
  Row: ListRow,
});
