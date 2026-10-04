import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
// The server-safe glyph: this module has no client state of its own.
import { CaretRight } from "@phosphor-icons/react/ssr";
import styles from "./Collapsible.module.scss";

// ============================================
// Types
// ============================================

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseCollapsible.Root>;
type BaseTriggerProps = React.ComponentPropsWithoutRef<typeof BaseCollapsible.Trigger>;
type BasePanelProps = React.ComponentPropsWithoutRef<typeof BaseCollapsible.Panel>;

export type CollapsibleChangeEventDetails = Parameters<
  NonNullable<BaseRootProps["onOpenChange"]>
>[1];

/**
 * One section that shows and hides its content in place.
 * @see https://usefragments.com/components/collapsible
 */
export interface CollapsibleProps extends Omit<BaseRootProps, "className" | "children"> {
  children: React.ReactNode;
  className?: string;
  /** Whether the content is open (controlled). */
  open?: boolean;
  /** Whether the content starts open (uncontrolled).
   * @default false */
  defaultOpen?: boolean;
  /** Called when the trigger opens or closes the content. */
  onOpenChange?: (open: boolean, eventDetails: CollapsibleChangeEventDetails) => void;
  /** Whether the trigger is inert.
   * @default false */
  disabled?: boolean;
}

export interface CollapsibleTriggerProps extends Omit<BaseTriggerProps, "className" | "children"> {
  children: React.ReactNode;
  className?: string;
}

export interface CollapsibleContentProps extends Omit<BasePanelProps, "className" | "children"> {
  children: React.ReactNode;
  className?: string;
  /** Keep the content in the DOM while closed (hidden and inert).
   * @default false */
  keepMounted?: boolean;
  /** Let the browser's find-in-page reveal the closed content.
   * @default false */
  hiddenUntilFound?: boolean;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ============================================
// Components
// ============================================

function CollapsibleRoot({ children, className, ...rootProps }: CollapsibleProps) {
  return (
    <BaseCollapsible.Root
      {...rootProps}
      className={cx(styles.root, className)}
      data-slot="collapsible"
    >
      {children}
    </BaseCollapsible.Root>
  );
}

/**
 * The row that opens and closes the content: a leading caret that turns a
 * quarter when open, then the label. With `render`, the rendered element is
 * the whole trigger and draws its own label.
 */
const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ children, className, render, ...triggerProps }, forwardedRef) {
    if (render) {
      return (
        <BaseCollapsible.Trigger
          {...triggerProps}
          ref={forwardedRef}
          render={render}
          className={className}
          data-slot="collapsible-trigger"
        >
          {children}
        </BaseCollapsible.Trigger>
      );
    }

    return (
      <BaseCollapsible.Trigger
        {...triggerProps}
        ref={forwardedRef}
        className={cx(styles.trigger, className)}
        data-slot="collapsible-trigger"
      >
        <CaretRight className={styles.caret} weight="bold" aria-hidden="true" />
        <span className={styles.label}>{children}</span>
      </BaseCollapsible.Trigger>
    );
  }
);

function CollapsibleContent({ children, className, ...panelProps }: CollapsibleContentProps) {
  return (
    <BaseCollapsible.Panel
      {...panelProps}
      className={cx(styles.content, className)}
      data-slot="collapsible-content"
    >
      <div className={styles.contentInner}>{children}</div>
    </BaseCollapsible.Panel>
  );
}

// ============================================
// Export compound component
// ============================================

export const Collapsible = Object.assign(CollapsibleRoot, {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
});
