'use client';

import React, { useState, useCallback, useId, createContext, useContext } from 'react';
import styles from './Collapsible.module.scss';

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

// Context for sharing state between compound components
interface CollapsibleContextValue {
  isOpen: boolean;
  toggle: () => void;
  contentId: string;
  triggerId: string;
  disabled?: boolean;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext() {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('Collapsible compound components must be used within Collapsible.Root');
  }
  return context;
}

// Root component
export interface CollapsibleRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Whether the collapsible is initially open */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the collapsible is disabled */
  disabled?: boolean;
}

function CollapsibleRoot({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  className,
  ...htmlProps
}: CollapsibleRootProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const uniqueId = useId();
  const contentId = `collapsible-content-${uniqueId}`;
  const triggerId = `collapsible-trigger-${uniqueId}`;

  const toggle = useCallback(() => {
    if (disabled) return;

    if (isControlled) {
      onOpenChange?.(!isOpen);
    } else {
      setInternalOpen((prev) => {
        const newValue = !prev;
        onOpenChange?.(newValue);
        return newValue;
      });
    }
  }, [disabled, isControlled, isOpen, onOpenChange]);

  const contextValue: CollapsibleContextValue = {
    isOpen,
    toggle,
    contentId,
    triggerId,
    disabled,
  };

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        className={`${styles.root} ${isOpen ? styles.open : ''} ${disabled ? styles.disabled : ''} ${className || ''}`}
        data-state={isOpen ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

// Trigger component
export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** Show chevron indicator */
  showChevron?: boolean;
  /** Chevron position */
  chevronPosition?: 'start' | 'end';
  /** Render as child element (for custom triggers) */
  asChild?: boolean;
}

function CollapsibleTrigger({
  children,
  className,
  showChevron = true,
  chevronPosition = 'end',
  asChild = false,
  onClick,
  onKeyDown,
  ...htmlProps
}: CollapsibleTriggerProps) {
  const { isOpen, toggle, contentId, triggerId, disabled } = useCollapsibleContext();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  const handleClick = () => {
    toggle();
  };

  const chevronIcon = showChevron && (
    <svg
      className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as {
      className?: string;
      onClick?: (event: React.MouseEvent<HTMLElement>) => void;
      onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
    };

    return React.cloneElement(children as React.ReactElement<any>, {
      ...htmlProps,
      id: (htmlProps.id as string | undefined) ?? triggerId,
      'aria-expanded': isOpen,
      'aria-controls': contentId,
      'aria-disabled': disabled || undefined,
      onClick: composeEventHandlers(
        (event: React.MouseEvent<HTMLElement>) => {
          childProps.onClick?.(event);
          onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
        },
        () => handleClick()
      ),
      onKeyDown: composeEventHandlers(
        (event: React.KeyboardEvent<HTMLElement>) => {
          childProps.onKeyDown?.(event);
          onKeyDown?.(event as unknown as React.KeyboardEvent<HTMLButtonElement>);
        },
        (event) => handleKeyDown(event as unknown as React.KeyboardEvent)
      ),
      className: [className, childProps.className].filter(Boolean).join(' '),
    });
  }

  return (
    <button
      {...htmlProps}
      type="button"
      id={(htmlProps.id as string | undefined) ?? triggerId}
      className={`${styles.trigger} ${className || ''}`}
      aria-expanded={isOpen}
      aria-controls={contentId}
      aria-disabled={disabled || undefined}
      onClick={composeEventHandlers(onClick, handleClick)}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      disabled={disabled}
    >
      {chevronPosition === 'start' && chevronIcon}
      <span className={styles.triggerContent}>{children}</span>
      {chevronPosition === 'end' && chevronIcon}
    </button>
  );
}

// Content component
export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Force mount content even when closed (useful for animations) */
  forceMount?: boolean;
}

function CollapsibleContent({
  children,
  className,
  forceMount = false,
  ...htmlProps
}: CollapsibleContentProps) {
  const { isOpen, contentId, triggerId } = useCollapsibleContext();

  // If not force mounted and closed, don't render
  if (!forceMount && !isOpen) {
    return null;
  }

  return (
    <div
      {...htmlProps}
      id={(htmlProps.id as string | undefined) ?? contentId}
      role="region"
      aria-labelledby={triggerId}
      className={`${styles.content} ${isOpen ? styles.contentOpen : styles.contentClosed} ${className || ''}`}
      data-state={isOpen ? 'open' : 'closed'}
      hidden={!isOpen && !forceMount}
    >
      <div className={styles.contentInner}>{children}</div>
    </div>
  );
}

// Compound component export
export const Collapsible = Object.assign(CollapsibleRoot, {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
});

// Named exports for direct imports
export {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  useCollapsibleContext,
};

export type CollapsibleProps = CollapsibleRootProps;
