import * as React from "react";
import { Stack, type StackProps } from "../Stack";
import styles from "./Main.module.scss";

export type MainMeasure = "full" | "narrow";

/** A page region is a `main`, a `section` or a plain `div`. */
export type MainElement = "main" | "section" | "div";

export interface MainProps extends Omit<StackProps, "as" | "children" | "direction" | "gap"> {
  /** The element. Use `section` or `div` when another `<main>` already exists.
   * @default "main" */
  as?: MainElement;
  children: React.ReactNode;
  /** Maximum readable width for the page content.
   * @default "full" */
  measure?: MainMeasure;
}

export type MainRegionProps = StackProps;

export interface MainTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  /** The heading level.
   * @default "h1" */
  as?: "h1" | "h2";
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * The page region. It owns the 16 page gutter and, by default, the `<main>`
 * landmark with `id="main-content"` (the Header.SkipLink target).
 * @see https://usefragments.com/components/main
 */
const MainRoot = React.forwardRef<HTMLElement, MainProps>(function MainRoot(
  { as = "main", children, className, measure = "full", id, ...htmlProps },
  ref
) {
  return (
    <Stack
      {...htmlProps}
      ref={ref}
      as={as}
      id={id ?? (as === "main" ? "main-content" : undefined)}
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

/** The page title: the display role (24, strong, ink 1). */
function MainTitle({ as: Heading = "h1", className, ...props }: MainTitleProps) {
  return <Heading {...props} className={joinClasses(styles.title, className)} />;
}

/** The line under the title: 12px body, ink 2, wrapping at 68 characters. */
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
  Title: MainTitle,
  Description: MainDescription,
  Content: MainContent,
  Footer: MainFooter,
});
