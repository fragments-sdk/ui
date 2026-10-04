"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import styles from "./Card.module.scss";
import { isProductionBuild } from "../../utils/env";

// ============================================
// Types
// ============================================

export type CardTone = "neutral" | "danger";
export type CardPadding = "none" | "md";

/**
 * Card groups related content on the surface plane: the opaque surface, the
 * one hairline and the surface corner, with no shadow.
 * @see https://usefragments.com/components/card
 */
export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  children: React.ReactNode;
  /** `danger` draws the edge in the danger ink, for a card whose content is
   * held (a blocked merge). There is no wash; the words inside say why.
   * @default "neutral" */
  tone?: CardTone;
  /** Inner padding: `md` is the compact surface inset (12); `none` lets a
   * divided header and `Card.Body` own their inset (a table sheet).
   * @default "md" */
  padding?: CardPadding;
  /** Marks the card as the chosen one: the selection wash, and the hairline
   * turns into the selection ring. Pair it with the ARIA state that fits the
   * element (`aria-pressed` on a button, `aria-current` on a link). */
  selected?: boolean;
  /** Root element tag for a static card.
   * @default "article" */
  as?: "article" | "div" | "section";
  /** Makes the card one interactive element: pass a real link or button,
   * `render={<a href="/repos/web" />}` or `render={<button type="button" />}`.
   * It gains the hover tint, the press scale and the focus ring. A button
   * holds phrasing content only, so any render other than a plain `<a>`
   * draws every part as a `span` (Title loses its heading level). Keep other
   * controls out of an interactive card. */
  render?: useRender.RenderProp;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** A 40px head with the hairline below it and no fill, for a card with
   * `padding="none"`. Title cluster and trailing controls pin to opposite
   * edges. */
  divided?: boolean;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  /** Semantic heading level.
   * @default "h3" */
  as?: "h2" | "h3" | "h4" | "h5" | "h6";
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Inner padding for the body alone, with `padding="none"` on the root.
   * Omit when the root already owns padding. */
  padding?: CardPadding;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ============================================
// Helpers
// ============================================

const paddingMap: Record<CardPadding, string> = {
  none: styles.paddingNone,
  md: styles.paddingMd,
};

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

/** True inside a card whose element may hold phrasing content only. */
const PhrasingContext = React.createContext(false);

/** A plain `<a>` may wrap headings and paragraphs; a button may not, and the
 * element a component renders is unknown, so everything else is phrasing. */
function holdsPhrasingOnly(render: useRender.RenderProp | undefined) {
  if (render === undefined) return false;
  return !(React.isValidElement(render) && render.type === "a");
}

/** The tag a part draws: its own block tag, or `span` inside a button card. */
function usePartTag<T extends keyof React.JSX.IntrinsicElements>(tag: T): T | "span" {
  return React.useContext(PhrasingContext) ? "span" : tag;
}

// ============================================
// Components
// ============================================

const CardRoot = React.forwardRef<HTMLElement, CardProps>(function Card(
  {
    children,
    tone = "neutral",
    padding = "md",
    selected = false,
    as = "article",
    render,
    className,
    ...htmlProps
  },
  ref
) {
  const interactive = render !== undefined;

  if (!isProductionBuild() && !interactive && typeof htmlProps.onClick === "function") {
    console.warn(
      '[Card] onClick on a static card has no keyboard or role. Pass render={<button type="button" />} or render={<a href="..." />} to make the card interactive.'
    );
  }

  return useRender({
    render,
    ref,
    defaultTagName: as,
    state: { selected, interactive },
    props: {
      ...htmlProps,
      className: classes(
        styles.card,
        tone === "danger" && styles.toneDanger,
        paddingMap[padding],
        interactive && styles.interactive,
        selected && styles.selected,
        className
      ),
      children: (
        <PhrasingContext.Provider value={holdsPhrasingOnly(render)}>
          {children}
        </PhrasingContext.Provider>
      ),
    },
  });
});

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { children, divided, className, ...htmlProps },
  ref
) {
  const Tag = usePartTag("div");
  return (
    <Tag
      ref={ref}
      {...htmlProps}
      className={classes(styles.header, divided && styles.headerDivided, className)}
    >
      {children}
    </Tag>
  );
});

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { children, as = "h3", className, ...htmlProps },
  ref
) {
  const Component = usePartTag(as);
  return (
    <Component ref={ref} {...htmlProps} className={classes(styles.title, className)}>
      {children}
    </Component>
  );
});

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ children, className, ...htmlProps }, ref) {
    const Tag = usePartTag("p");
    return (
      <Tag ref={ref} {...htmlProps} className={classes(styles.description, className)}>
        {children}
      </Tag>
    );
  }
);

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { children, padding, className, ...htmlProps },
  ref
) {
  const Tag = usePartTag("div");
  return (
    <Tag
      ref={ref}
      {...htmlProps}
      className={classes(styles.body, padding && paddingMap[padding], className)}
    >
      {children}
    </Tag>
  );
});

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { children, className, ...htmlProps },
  ref
) {
  const Tag = usePartTag("div");
  return (
    <Tag ref={ref} {...htmlProps} className={classes(styles.footer, className)}>
      {children}
    </Tag>
  );
});

// ============================================
// Export compound component
// ============================================

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Body: CardBody,
  Footer: CardFooter,
});
