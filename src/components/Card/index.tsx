'use client';

import * as React from 'react';
import styles from './Card.module.scss';

// ============================================
// Types
// ============================================

/**
 * Card container for grouping related content.
 * @see https://usefragments.com/components/card
 */
export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children: React.ReactNode;
  /** Visual style variant. `"outline"` is an alias for `"outlined"`.
   *
   * - `default` / `outlined` / `elevated`: general-purpose cards.
   * - `stat`: compact metric tile for dashboard grids — hairline border,
   *   panel-subtle surface, tight radius, zero shadow.
   * - `panel`: hairline-bordered panel with zero own padding, designed for
   *   compound use with `Card.Header divided` + `Card.Body` so each region
   *   manages its own spacing.
   * @default "default"
   * @see https://usefragments.com/components/card#variants */
  variant?: 'default' | 'outlined' | 'outline' | 'elevated' | 'stat' | 'panel';
  /** Inner padding.
   * @default "md" */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Root element tag.
   * @default "article" */
  as?: 'article' | 'div' | 'section';
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Renders the header as a divided bar: fixed height, horizontal padding,
   * hairline bottom border, no trailing margin. Used with `variant="panel"`
   * for dashboard-style panel headers. */
  divided?: boolean;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ============================================
// Context
// ============================================

interface CardContextValue {
  variant: 'default' | 'outlined' | 'elevated' | 'stat' | 'panel';
  padding: 'none' | 'sm' | 'md' | 'lg';
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

function CardRoot({
  children,
  variant: variantProp = 'default',
  padding = 'md',
  as: Component = 'article',
  className,
  style,
  ...htmlProps
}: CardProps) {
  // Resolve alias: "outline" → "outlined"
  const variant = variantProp === 'outline' ? 'outlined' : variantProp;
  const {
    onKeyDown,
    onKeyUp,
    role,
    tabIndex,
    ...elementProps
  } = htmlProps;

  const isInteractive = typeof elementProps.onClick === 'function';
  const resolvedRole = isInteractive ? role ?? 'button' : role;
  const resolvedTabIndex = isInteractive ? tabIndex ?? 0 : tabIndex;

  const classes = [
    styles.card,
    styles[variant],
    paddingMap[padding],
    isInteractive && styles.interactive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const contextValue: CardContextValue = {
    variant,
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
          isInteractive && resolvedRole === 'button'
            ? composeEventHandlers(onKeyDown, (event: React.KeyboardEvent<HTMLElement>) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  event.currentTarget.click();
                }
                if (event.key === ' ') {
                  event.preventDefault();
                }
              })
            : onKeyDown
        }
        onKeyUp={
          isInteractive && resolvedRole === 'button'
            ? composeEventHandlers(onKeyUp, (event: React.KeyboardEvent<HTMLElement>) => {
                if (event.key === ' ') {
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
    .join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function CardTitle({ children, className, ...htmlProps }: CardTitleProps) {
  const classes = [styles.title, className].filter(Boolean).join(' ');
  return <h3 {...htmlProps} className={classes}>{children}</h3>;
}

function CardDescription({ children, className, ...htmlProps }: CardDescriptionProps) {
  const classes = [styles.description, className].filter(Boolean).join(' ');
  return <p {...htmlProps} className={classes}>{children}</p>;
}

function CardBody({ children, className, ...htmlProps }: CardBodyProps) {
  const classes = [styles.body, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
}

function CardFooter({ children, className, ...htmlProps }: CardFooterProps) {
  const classes = [styles.footer, className].filter(Boolean).join(' ');
  return <div {...htmlProps} className={classes}>{children}</div>;
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
export {
  CardRoot,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
};
