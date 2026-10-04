"use client";

import * as React from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { CaretRight } from "@phosphor-icons/react";
import styles from "./Accordion.module.scss";

// ============================================
// Types
// ============================================

/** The values of the open items. */
export type AccordionValue = string[];

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseAccordion.Root>;
type BaseItemProps = React.ComponentPropsWithoutRef<typeof BaseAccordion.Item>;
type BaseTriggerProps = React.ComponentPropsWithoutRef<typeof BaseAccordion.Trigger>;
type BasePanelProps = React.ComponentPropsWithoutRef<typeof BaseAccordion.Panel>;

export type AccordionChangeEventDetails = Parameters<
  NonNullable<BaseRootProps["onValueChange"]>
>[1];
export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

/**
 * Stacked sections that open and close in place.
 * @see https://usefragments.com/components/accordion
 */
export interface AccordionProps extends Omit<
  BaseRootProps,
  "className" | "children" | "value" | "defaultValue" | "onValueChange" | "orientation"
> {
  children: React.ReactNode;
  className?: string;
  /** Let several items stay open at once. A single accordion closes the open item when
   * another opens, and closes it when it is pressed again.
   * @default false */
  multiple?: boolean;
  /** The open items (controlled). */
  value?: AccordionValue;
  /** The items open at first (uncontrolled). */
  defaultValue?: AccordionValue;
  /** Called with the open items when one opens or closes. */
  onValueChange?: (value: AccordionValue, eventDetails: AccordionChangeEventDetails) => void;
  /** The heading level each trigger sits in.
   * @default 3 */
  headingLevel?: AccordionHeadingLevel;
  /** Make every item inert. */
  disabled?: boolean;
}

export interface AccordionItemProps extends Omit<
  BaseItemProps,
  "className" | "children" | "value"
> {
  children: React.ReactNode;
  className?: string;
  /** Unique value for this item. */
  value: string;
  /** Make this item inert (focusable, dimmed once). */
  disabled?: boolean;
}

export interface AccordionTriggerProps extends Omit<BaseTriggerProps, "className" | "children"> {
  children: React.ReactNode;
  className?: string;
}

export interface AccordionContentProps extends Omit<BasePanelProps, "className" | "children"> {
  children: React.ReactNode;
  className?: string;
  /** Keep the content mounted while closed. */
  keepMounted?: boolean;
  /** Let the browser's find-in-page reveal closed content. */
  hiddenUntilFound?: boolean;
}

// ============================================
// Context
// ============================================

const HeadingLevelContext = React.createContext<AccordionHeadingLevel>(3);

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ============================================
// Components
// ============================================

function AccordionRoot({
  children,
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  headingLevel = 3,
  className,
  ...rootProps
}: AccordionProps) {
  return (
    <HeadingLevelContext.Provider value={headingLevel}>
      <BaseAccordion.Root
        {...rootProps}
        multiple={multiple}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange as BaseRootProps["onValueChange"]}
        className={cx(styles.accordion, className)}
        data-slot="accordion"
      >
        {children}
      </BaseAccordion.Root>
    </HeadingLevelContext.Provider>
  );
}

function AccordionItem({ children, className, ...itemProps }: AccordionItemProps) {
  return (
    <BaseAccordion.Item
      {...itemProps}
      className={cx(styles.item, className)}
      data-slot="accordion-item"
    >
      {children}
    </BaseAccordion.Item>
  );
}

/** The fold row inside its heading: a leading caret that turns a quarter when open, then the label. */
const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger({ children, className, ...triggerProps }, forwardedRef) {
    const headingLevel = React.useContext(HeadingLevelContext);
    const Heading = `h${headingLevel}` as "h2" | "h3" | "h4" | "h5" | "h6";

    return (
      <BaseAccordion.Header render={<Heading />} className={styles.heading}>
        <BaseAccordion.Trigger
          {...triggerProps}
          ref={forwardedRef}
          className={cx(styles.trigger, className)}
          data-slot="accordion-trigger"
        >
          <CaretRight className={styles.caret} weight="bold" aria-hidden="true" />
          <span className={styles.label}>{children}</span>
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
    );
  }
);

function AccordionContent({ children, className, ...panelProps }: AccordionContentProps) {
  return (
    <BaseAccordion.Panel
      {...panelProps}
      className={cx(styles.content, className)}
      data-slot="accordion-content"
    >
      <div className={styles.contentInner}>{children}</div>
    </BaseAccordion.Panel>
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
