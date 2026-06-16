"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { useResolvedControlSize, type ControlSize } from "../ComponentDefaults";
import styles from "./Tabs.module.scss";

// ============================================
// Types
// ============================================

export type TabValue = string;
export type TabsChangeEventDetails = Parameters<
  NonNullable<React.ComponentProps<typeof BaseTabs.Root>["onValueChange"]>
>[1];

/**
 * Tabbed navigation for switching between content panels.
 * @see https://usefragments.com/components/tabs
 */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  children: React.ReactNode;
  /** Default active tab value (uncontrolled) */
  defaultValue?: TabValue;
  /** Controlled active tab value */
  value?: TabValue;
  /** Called when the active tab changes */
  onValueChange?: (value: TabValue, eventDetails: TabsChangeEventDetails) => void;
  /** Tab layout direction.
   * @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Tab list visual style (default for Tabs.List).
   * @default "underline" */
  variant?: "underline" | "pills";
  /** Tab control size. Defaults to the component-default control size. */
  size?: ControlSize;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Tab list visual style.
   * @default "underline"
   * @see https://usefragments.com/components/tabs#variants */
  variant?: "underline" | "pills";
  /** Tab control size. Defaults to the nearest Tabs root or provider default. */
  size?: ControlSize;
}

export interface TabProps {
  children: React.ReactNode;
  value: TabValue;
  disabled?: boolean;
  className?: string;
}

export interface TabsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  value: TabValue;
  keepMounted?: boolean;
  flush?: boolean;
}

// ============================================
// Context for variant
// ============================================

const TabsVariantContext = React.createContext<"underline" | "pills">("underline");
const TabsSizeContext = React.createContext<ControlSize>("sm");

// ============================================
// Components
// ============================================

function TabsRoot({
  children,
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  variant = "underline",
  size: sizeProp,
  className,
  ...htmlProps
}: TabsProps) {
  const size = useResolvedControlSize(sizeProp, "sm");
  const classes = [styles.root, className].filter(Boolean).join(" ");

  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsSizeContext.Provider value={size}>
        <BaseTabs.Root
          {...htmlProps}
          defaultValue={defaultValue}
          value={value}
          onValueChange={onValueChange}
          orientation={orientation}
          className={classes}
        >
          {children}
        </BaseTabs.Root>
      </TabsSizeContext.Provider>
    </TabsVariantContext.Provider>
  );
}

function TabsList({ children, variant, size: sizeProp, className, ...htmlProps }: TabsListProps) {
  const rootVariant = React.useContext(TabsVariantContext);
  const rootSize = React.useContext(TabsSizeContext);
  const size = sizeProp ?? rootSize;
  const resolvedVariant = variant ?? rootVariant;
  const variantClass = resolvedVariant === "pills" ? styles.listPills : styles.listUnderline;
  const classes = [styles.list, variantClass, className].filter(Boolean).join(" ");

  return (
    <TabsVariantContext.Provider value={resolvedVariant}>
      <TabsSizeContext.Provider value={size}>
        <BaseTabs.List {...htmlProps} className={classes}>
          {children}
          {resolvedVariant === "underline" && <BaseTabs.Indicator className={styles.indicator} />}
        </BaseTabs.List>
      </TabsSizeContext.Provider>
    </TabsVariantContext.Provider>
  );
}

function Tab({ children, value, disabled, className }: TabProps) {
  const variant = React.useContext(TabsVariantContext);
  const size = React.useContext(TabsSizeContext);
  const variantClass = variant === "pills" ? styles.tabPills : styles.tabUnderline;
  const sizeClass = size === "sm" ? styles.tabSm : size === "lg" ? styles.tabLg : styles.tabMd;
  const classes = [styles.tab, sizeClass, variantClass, className].filter(Boolean).join(" ");

  return (
    <BaseTabs.Tab value={value} disabled={disabled} className={classes}>
      {children}
    </BaseTabs.Tab>
  );
}

function TabsPanel({
  children,
  value,
  keepMounted = false,
  flush = false,
  className,
  ...htmlProps
}: TabsPanelProps) {
  const classes = [styles.panel, flush && styles.panelFlush, className].filter(Boolean).join(" ");

  return (
    <BaseTabs.Panel {...htmlProps} value={value} keepMounted={keepMounted} className={classes}>
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

// Re-export individual components
export { TabsRoot, TabsList, Tab, TabsPanel };
