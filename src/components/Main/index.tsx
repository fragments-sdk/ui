import * as React from "react";
import { Stack, type StackProps } from "../Stack";
import styles from "./Main.module.scss";

export type MainMeasure = "full" | "narrow";

export interface MainProps extends Omit<StackProps, "as" | "children" | "direction" | "gap"> {
  as?: StackProps["as"];
  children: React.ReactNode;
  /** Maximum readable width for the page content. */
  measure?: MainMeasure;
}

export type MainRegionProps = StackProps;

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const MainRoot = React.forwardRef<HTMLElement, MainProps>(function MainRoot(
  { as = "main", children, className, measure = "full", ...htmlProps },
  ref
) {
  return (
    <Stack
      {...htmlProps}
      ref={ref}
      as={as}
      direction="column"
      gap="lg"
      className={joinClasses(
        styles.root,
        measure === "narrow" ? styles.narrow : styles.full,
        className
      )}
      data-main-measure={measure}
    >
      {children}
    </Stack>
  );
});

function MainHeader({
  as = "header",
  direction = "column",
  gap = "sm",
  className,
  ...props
}: MainRegionProps) {
  return (
    <Stack
      {...props}
      as={as}
      direction={direction}
      gap={gap}
      className={joinClasses(styles.header, className)}
    />
  );
}

function MainDescription({
  as = "div",
  direction = "column",
  gap = "xs",
  className,
  ...props
}: MainRegionProps) {
  return (
    <Stack
      {...props}
      as={as}
      direction={direction}
      gap={gap}
      className={joinClasses(styles.description, className)}
    />
  );
}

function MainContent({
  as = "div",
  direction = "column",
  gap = "lg",
  className,
  ...props
}: MainRegionProps) {
  return (
    <Stack
      {...props}
      as={as}
      direction={direction}
      gap={gap}
      className={joinClasses(styles.content, className)}
    />
  );
}

function MainFooter({
  as = "footer",
  direction = "row",
  gap = "sm",
  justify = "end",
  wrap = true,
  className,
  ...props
}: MainRegionProps) {
  return (
    <Stack
      {...props}
      as={as}
      direction={direction}
      gap={gap}
      justify={justify}
      wrap={wrap}
      className={joinClasses(styles.footer, className)}
    />
  );
}

export const Main = Object.assign(MainRoot, {
  Header: MainHeader,
  Description: MainDescription,
  Content: MainContent,
  Footer: MainFooter,
});
