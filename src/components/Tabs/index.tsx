"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { useResolvedControlSize } from "../ComponentDefaults";
import { useScrollEdges } from "../ScrollArea/use-scroll-edges";
import styles from "./Tabs.module.scss";

// ============================================
// Types
// ============================================

export type TabValue = string;
export type TabsVariant = "ghost" | "soft";
export type TabsSize = "sm" | "md";
export type TabsChangeEventDetails = Parameters<
  NonNullable<React.ComponentProps<typeof BaseTabs.Root>["onValueChange"]>
>[1];

/**
 * Tabbed navigation for switching between content panels.
 * @see https://usefragments.com/components/tabs
 */
export interface TabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  children: React.ReactNode;
  /** Default active tab value (uncontrolled) */
  defaultValue?: TabValue;
  /** Controlled active tab value */
  value?: TabValue;
  /** Called when the active tab changes */
  onValueChange?: (value: TabValue, eventDetails: TabsChangeEventDetails) => void;
  /** Called when the tab already open is pressed again (it may close what covers its panel). */
  onReselect?: (value: TabValue) => void;
  /** Tab row chrome: `ghost` draws a 2px ink underline under the open tab,
   * `soft` is the segmented control (band track, lifted thumb).
   * @default "ghost" */
  variant?: TabsVariant;
  /** Tab height: sm 28, md 32. Defaults to the component-default control size. */
  size?: TabsSize;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Arrow keys open the tab they reach, instead of only moving focus.
   * @default false */
  activateOnFocus?: boolean;
  /** Controls beside the tabs, outside the tablist and its arrow-key navigation. */
  actions?: React.ReactNode;
}

type BaseTabProps = React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>;

export interface TabProps extends Omit<BaseTabProps, "className" | "children" | "value"> {
  children: React.ReactNode;
  value: TabValue;
  className?: string;
  /** A quieter figure after the name (how many there are, or `…` while counting). */
  count?: React.ReactNode;
  /** A dot after the name: something changed in the tab. A string is read to screen readers. */
  dot?: boolean | string;
}

type BasePanelProps = React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>;

export interface TabsPanelProps extends Omit<BasePanelProps, "className" | "children" | "value"> {
  children: React.ReactNode;
  value: TabValue;
  className?: string;
}

// ============================================
// Context
// ============================================

interface TabsContextValue {
  variant: TabsVariant;
  size: TabsSize;
  activeValue: TabValue | undefined;
  onReselect?: (value: TabValue) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: "ghost",
  size: "md",
  activeValue: undefined,
});

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function assignRef<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

// ============================================
// Components
// ============================================

function TabsRoot({
  children,
  defaultValue,
  value,
  onValueChange,
  onReselect,
  variant = "ghost",
  size: sizeProp,
  className,
  ...htmlProps
}: TabsProps) {
  const resolved = useResolvedControlSize(sizeProp);
  // The ladder holds two tab steps; a larger default lands on md.
  const size: TabsSize = resolved === "sm" ? "sm" : "md";
  const [observedValue, setObservedValue] = React.useState<TabValue | undefined>(defaultValue);
  const controlled = value !== undefined;
  const activeValue = controlled ? value : observedValue;

  const handleValueChange = React.useCallback(
    (next: TabValue, details: TabsChangeEventDetails) => {
      onValueChange?.(next, details);
      if (!controlled && !details.isCanceled) setObservedValue(next);
    },
    [controlled, onValueChange]
  );

  const context = React.useMemo(
    () => ({ variant, size, activeValue, onReselect }),
    [variant, size, activeValue, onReselect]
  );

  return (
    <TabsContext.Provider value={context}>
      <BaseTabs.Root
        {...htmlProps}
        defaultValue={defaultValue}
        value={value}
        onValueChange={handleValueChange}
        className={cx(styles.root, className)}
        data-slot="tabs"
        data-variant={variant}
        data-size={size}
      >
        {children}
      </BaseTabs.Root>
    </TabsContext.Provider>
  );
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { children, activateOnFocus = false, actions, className, ...htmlProps },
  forwardedRef
) {
  const { variant, size, activeValue } = React.useContext(TabsContext);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const edges = useScrollEdges(listRef, { orientation: "horizontal", dir: htmlProps.dir });

  const setListRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef]
  );

  // The open tab scrolls into view when the row overflows.
  React.useEffect(() => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const tab = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!tab) return;
    const view = list.ownerDocument.defaultView;
    const pad = Number.parseFloat(view?.getComputedStyle(list).scrollPaddingInlineStart ?? "") || 0;
    const listRect = list.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    if (tabRect.left < listRect.left + pad) {
      list.scrollLeft -= listRect.left + pad - tabRect.left;
    } else if (tabRect.right > listRect.right - pad) {
      list.scrollLeft += tabRect.right - (listRect.right - pad);
    }
  }, [activeValue]);

  return (
    <div className={styles.bar} data-slot="tabs-bar" data-variant={variant}>
      <BaseTabs.List
        {...htmlProps}
        ref={setListRef}
        activateOnFocus={activateOnFocus}
        className={cx(
          styles.list,
          variant === "soft" ? styles.listSoft : styles.listGhost,
          className
        )}
        data-slot="tabs-list"
        data-variant={variant}
        data-size={size}
        data-scroll-x={edges.x}
      >
        {children}
        {variant === "ghost" && <BaseTabs.Indicator className={styles.indicator} />}
      </BaseTabs.List>
      {actions != null && actions !== false ? (
        <div className={styles.actions} data-slot="tabs-actions">
          {actions}
        </div>
      ) : null}
    </div>
  );
});

const Tab = React.forwardRef<HTMLElement, TabProps>(function Tab(
  { children, value, count, dot, className, onPointerDown, onClick, ...tabProps },
  forwardedRef
) {
  const { variant, size, onReselect } = React.useContext(TabsContext);
  // Whether the tab was already open when the press began: a press can open
  // it on focus before the click lands.
  const openAtPress = React.useRef<boolean | null>(null);
  const label = typeof children === "string" ? children : undefined;
  const hasCount = count !== undefined && count !== null && count !== false && count !== "";

  return (
    <BaseTabs.Tab
      {...tabProps}
      ref={forwardedRef}
      value={value}
      className={cx(
        styles.tab,
        size === "sm" ? styles.tabSm : styles.tabMd,
        variant === "soft" ? styles.tabSoft : styles.tabGhost,
        className
      )}
      data-slot="tabs-tab"
      onPointerDown={(event) => {
        openAtPress.current = event.currentTarget.hasAttribute("data-active");
        onPointerDown?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        const wasOpen = openAtPress.current ?? event.currentTarget.hasAttribute("data-active");
        openAtPress.current = null;
        if (wasOpen && onReselect && !event.defaultPrevented) onReselect(value);
      }}
    >
      <span className={styles.label} data-label={label}>
        {children}
      </span>
      {hasCount ? (
        <span className={styles.count} data-slot="tabs-count">
          {count}
        </span>
      ) : null}
      {dot ? (
        <span
          className={styles.dot}
          data-slot="tabs-dot"
          aria-hidden={typeof dot === "string" ? undefined : true}
        >
          {typeof dot === "string" ? <span className={styles.dotWords}>{dot}</span> : null}
        </span>
      ) : null}
    </BaseTabs.Tab>
  );
});

function TabsPanel({ children, value, className, ...panelProps }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      {...panelProps}
      value={value}
      className={cx(styles.panel, className)}
      data-slot="tabs-panel"
    >
      {children}
    </BaseTabs.Panel>
  );
}

// ============================================
// Export compound component
// ============================================

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: Tab,
  Panel: TabsPanel,
});
