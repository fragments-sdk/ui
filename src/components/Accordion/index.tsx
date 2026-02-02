'use client';

import * as React from 'react';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import styles from './Accordion.module.scss';
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export type AccordionValue = string | string[];

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  children: React.ReactNode;
  /** Allow multiple items to be open at once */
  type?: 'single' | 'multiple';
  /** Controlled value - string for single, string[] for multiple */
  value?: AccordionValue;
  /** Default value for uncontrolled usage */
  defaultValue?: AccordionValue;
  /** Callback when value changes */
  onValueChange?: (value: AccordionValue) => void;
  /** Whether items can be fully collapsed (only for type="single") */
  collapsible?: boolean;
  /**
   * Heading level for accordion triggers (for semantic HTML).
   * The trigger will be wrapped in an <h{level}> element.
   * @default 3
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Unique value for this item */
  value: string;
  /** Disable this item */
  disabled?: boolean;
}

export interface AccordionTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ============================================
// Context
// ============================================

interface AccordionContextValue {
  type: 'single' | 'multiple';
  openItems: string[];
  toggle: (value: string) => void;
  collapsible: boolean;
  headingLevel: 2 | 3 | 4 | 5 | 6;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
}

function useAccordionItemContext() {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error('Accordion.Trigger/Content must be used within an Accordion.Item');
  }
  return context;
}

// ============================================
// Components
// ============================================

function AccordionRoot({
  children,
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  collapsible = false,
  headingLevel = 3,
  className,
  ...htmlProps
}: AccordionProps) {
  // Normalize value to array for internal handling
  const normalizeValue = (val: AccordionValue | undefined): string[] => {
    if (val === undefined) return [];
    return Array.isArray(val) ? val : [val];
  };

  const [openItems, setOpenItems] = React.useState<string[]>(() =>
    normalizeValue(defaultValue)
  );

  // Use controlled value if provided
  const controlledOpenItems = value !== undefined ? normalizeValue(value) : undefined;
  const currentOpenItems = controlledOpenItems ?? openItems;

  const toggle = React.useCallback((itemValue: string) => {
    const newItems = (() => {
      if (type === 'single') {
        // For single, toggle or set new item
        if (currentOpenItems.includes(itemValue)) {
          return collapsible ? [] : currentOpenItems;
        }
        return [itemValue];
      } else {
        // For multiple, toggle item in array
        if (currentOpenItems.includes(itemValue)) {
          return currentOpenItems.filter(v => v !== itemValue);
        }
        return [...currentOpenItems, itemValue];
      }
    })();

    if (controlledOpenItems === undefined) {
      setOpenItems(newItems);
    }

    if (onValueChange) {
      onValueChange(type === 'single' ? (newItems[0] ?? '') : newItems);
    }
  }, [type, currentOpenItems, collapsible, controlledOpenItems, onValueChange]);

  const classes = [styles.accordion, className].filter(Boolean).join(' ');

  return (
    <AccordionContext.Provider value={{ type, openItems: currentOpenItems, toggle, collapsible, headingLevel }}>
      <div {...htmlProps} className={classes} data-orientation="vertical" role="region">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({
  children,
  value,
  disabled = false,
  className,
  ...htmlProps
}: AccordionItemProps) {
  const { openItems } = useAccordionContext();
  const isOpen = openItems.includes(value);
  const baseId = React.useId();
  const triggerId = `accordion-trigger-${baseId}`;
  const contentId = `accordion-content-${baseId}`;

  const classes = [
    styles.item,
    isOpen && styles.itemOpen,
    disabled && styles.itemDisabled,
    className,
  ].filter(Boolean).join(' ');

  return (
    <AccordionItemContext.Provider value={{ value, isOpen, disabled, triggerId, contentId }}>
      <BaseCollapsible.Root open={isOpen} disabled={disabled}>
        <div {...htmlProps} className={classes} data-state={isOpen ? 'open' : 'closed'} data-disabled={disabled || undefined}>
          {children}
        </div>
      </BaseCollapsible.Root>
    </AccordionItemContext.Provider>
  );
}

function AccordionTrigger({
  children,
  className,
}: AccordionTriggerProps) {
  const { toggle, headingLevel } = useAccordionContext();
  const { value, isOpen, disabled, triggerId, contentId } = useAccordionItemContext();

  const handleClick = () => {
    if (!disabled) {
      toggle(value);
    }
  };

  const classes = [styles.trigger, className].filter(Boolean).join(' ');

  // Create the heading element dynamically based on headingLevel
  const HeadingTag = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <HeadingTag className={styles.heading}>
      <BaseCollapsible.Trigger
        id={triggerId}
        className={classes}
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-controls={contentId}
        data-state={isOpen ? 'open' : 'closed'}
        disabled={disabled}
      >
        <span className={styles.triggerContent}>{children}</span>
        <svg
          className={styles.chevron}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </BaseCollapsible.Trigger>
    </HeadingTag>
  );
}

function AccordionContent({
  children,
  className,
}: AccordionContentProps) {
  const { isOpen, triggerId, contentId } = useAccordionItemContext();

  const classes = [styles.content, className].filter(Boolean).join(' ');

  return (
    <BaseCollapsible.Panel
      id={contentId}
      className={classes}
      data-state={isOpen ? 'open' : 'closed'}
      role="region"
      aria-labelledby={triggerId}
    >
      <div className={styles.contentInner}>
        {children}
      </div>
    </BaseCollapsible.Panel>
  );
}

// ============================================
// Export compound component
// ============================================

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});

export { AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent };
