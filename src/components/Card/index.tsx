"use client";

import * as React from "react";
import styles from "./Card.module.scss";

// ============================================
// Types
// ============================================

export type CardVariant = "solid" | "soft" | "outline";
export type CardTone = "neutral" | "accent" | "warning" | "danger";
export type CardPadding = "none" | "sm" | "md" | "lg";

/**
 * Card container for grouping related content.
 * @see https://usefragments.com/components/card
 */
export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  children: React.ReactNode;
  /** Surface chrome.
   *
   * - `solid`: the filled, elevated surface for general-purpose cards.
   * - `soft`: quiet tint fill for metric tiles and dashboard panels. Add
   *   `padding="none"` and let `Card.Header divided` + `Card.Body padding`
   *   own their inset for a panel.
   * - `outline`: transparent with a hairline border, for dense layouts.
   * @default "solid"
   * @see https://usefragments.com/components/card#variants */
  variant?: CardVariant;
  /** Earned-moment capsule. Any tone other than `neutral` paints a
   * tone-tinted hairline, a radial wash and the capsule radius on top of the
   * variant: `accent` (the moment), `danger` (a merge is held), `warning`
   * (enforcement lapsed). Reserve it for the few surfaces that earn emphasis.
   * @default "neutral" */
  tone?: CardTone;
  /** Inner padding.
   * @default "md" */
  padding?: CardPadding;
  /** Root element tag.
   * @default "article" */
  as?: "article" | "div" | "section";
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Renders the header as a divided region with a minimum height, canonical
   * inset, hairline bottom border, and no trailing margin. Used with
   * `padding="none"` for dashboard-style panel headers. */
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
  /** Inner padding for body-only spacing, useful with `padding="none"` on the
   * root. Omit when the card root already owns padding. */
  padding?: CardPadding;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ============================================
// Context
// ============================================

interface CardContextValue {
  variant: CardVariant;
  tone: CardTone;
  padding: CardPadding;
  isInteractive: boolean;
}

const CardContext = React.createContext<CardContextValue | null>(null);

// ============================================
// Padding Map
// ============================================

const paddingMap = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  userHandler: ((event: E) => void) | undefined,
  internalHandler: (event: E) => void
) {
  return (event: E) => {
    userHandler?.(event);
    if (event.defaultPrevented) return;
    internalHandler(event);
  };
}

// ============================================
// Components
// ============================================

const variantMap: Record<CardVariant, string> = {
  solid: styles.solid,
  soft: styles.soft,
  outline: styles.outline,
};

const toneMap: Record<CardTone, string | undefined> = {
  neutral: undefined,
  accent: styles.toneAccent,
  danger: styles.toneDanger,
  warning: styles.toneWarning,
};

function CardRoot({
  children,
  variant = "solid",
  tone = "neutral",
  padding = "md",
  as: Component = "article",
  className,
  style,
  ...htmlProps
}: CardProps) {
  const { onKeyDown, onKeyUp, role, tabIndex, ...elementProps } = htmlProps;

  const isInteractive = typeof elementProps.onClick === "function";
  const resolvedRole = isInteractive ? (role ?? "button") : role;
  const resolvedTabIndex = isInteractive ? (tabIndex ?? 0) : tabIndex;

  const classes = [
    styles.card,
    variantMap[variant],
    toneMap[tone],
    paddingMap[padding],
    isInteractive && styles.interactive,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contextValue: CardContextValue = {
    variant,
    tone,
    padding,
    isInteractive,
  };

  return (
    <CardContext.Provider value={contextValue}>
      <Component
        {...elementProps}
        role={resolvedRole}
        tabIndex={resolvedTabIndex}
        onKeyDown={
          isInteractive && resolvedRole === "button"
            ? composeEventHandlers(onKeyDown, (event: React.KeyboardEvent<HTMLElement>) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.click();
                }
                if (event.key === " ") {
                  event.preventDefault();
                }
              })
            : onKeyDown
        }
        onKeyUp={
          isInteractive && resolvedRole === "button"
            ? composeEventHandlers(onKeyUp, (event: React.KeyboardEvent<HTMLElement>) => {
                if (event.key === " ") {
                  event.preventDefault();
                  event.currentTarget.click();
                }
              })
            : onKeyUp
        }
        className={classes}
        style={style}
      >
        {children}
      </Component>
    </CardContext.Provider>
  );
}

function CardHeader({ children, divided, className, ...htmlProps }: CardHeaderProps) {
  const classes = [styles.header, divided && styles.headerDivided, className]
    .filter(Boolean)
    .join(" ");
  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

function CardTitle({ children, as: Component = "h3", className, ...htmlProps }: CardTitleProps) {
  const classes = [styles.title, className].filter(Boolean).join(" ");
  return (
    <Component {...htmlProps} className={classes}>
      {children}
    </Component>
  );
}

function CardDescription({ children, className, ...htmlProps }: CardDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(" ");
  return (
    <p {...htmlProps} className={classes}>
      {children}
    </p>
  );
}

function CardBody({ children, padding, className, ...htmlProps }: CardBodyProps) {
  const classes = [styles.body, padding && paddingMap[padding], className]
    .filter(Boolean)
    .join(" ");
  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

function CardFooter({ children, className, ...htmlProps }: CardFooterProps) {
  const classes = [styles.footer, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} className={classes}>
      {children}
    </div>
  );
}

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

// Re-export individual components for tree-shaking
export { CardRoot, CardHeader, CardTitle, CardDescription, CardBody, CardFooter };
