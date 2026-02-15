'use client';

import * as React from 'react';
import styles from './Card.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
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
  variant: 'default' | 'outlined' | 'elevated';
  padding: 'none' | 'sm' | 'md' | 'lg';
  isInteractive: boolean;
}

const CardContext = React.createContext<CardContextValue | null>(null);

function useCardContext() {
  const context = React.useContext(CardContext);
  if (!context) {
    throw new Error('Card compound components must be used within a Card');
  }
  return context;
}

// ============================================
// Padding Map
// ============================================

const paddingMap = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

// ============================================
// Components
// ============================================

function CardRoot({
  children,
  variant = 'default',
  padding = 'md',
  onClick,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...htmlProps
}: CardProps) {
  const isInteractive = !!onClick;

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

  if (isInteractive) {
    return (
      <CardContext.Provider value={contextValue}>
        <button
          type="button"
          {...(htmlProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          onClick={onClick}
          className={classes}
          style={style}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        >
          {children}
        </button>
      </CardContext.Provider>
    );
  }

  return (
    <CardContext.Provider value={contextValue}>
      <article
        {...htmlProps}
        className={classes}
        style={style}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        {children}
      </article>
    </CardContext.Provider>
  );
}

function CardHeader({ children, className, ...htmlProps }: CardHeaderProps) {
  const classes = [styles.header, className].filter(Boolean).join(' ');
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
  useCardContext,
};
