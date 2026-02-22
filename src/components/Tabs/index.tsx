'use client';

import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import styles from './Tabs.module.scss';

// ============================================
// Types
// ============================================

export type TabValue = string;

/**
 * Tabbed navigation for switching between content panels.
 * @see https://usefragments.com/components/tabs
 */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  children: React.ReactNode;
  /** Default active tab value (uncontrolled) */
  defaultValue?: TabValue;
  /** Controlled active tab value */
  value?: TabValue;
  /** Called when the active tab changes */
  onValueChange?: (value: TabValue) => void;
  /** Tab layout direction.
   * @default "horizontal" */
  orientation?: 'horizontal' | 'vertical';
  /** Tab list visual style (default for Tabs.List).
   * @default "underline" */
  variant?: 'underline' | 'pills';
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Tab list visual style.
   * @default "underline"
   * @see https://usefragments.com/components/tabs#variants */
  variant?: 'underline' | 'pills';
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

const TabsVariantContext = React.createContext<'underline' | 'pills'>('underline');

// ============================================
// Components
// ============================================

function TabsRoot({
  children,
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  variant = 'underline',
  className,
  ...htmlProps
}: TabsProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <TabsVariantContext.Provider value={variant}>
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
    </TabsVariantContext.Provider>
  );
}

function TabsList({
  children,
  variant,
  className,
  ...htmlProps
}: TabsListProps) {
  const rootVariant = React.useContext(TabsVariantContext);
  const resolvedVariant = variant ?? rootVariant;
  const variantClass = resolvedVariant === 'pills' ? styles.listPills : styles.listUnderline;
  const classes = [styles.list, variantClass, className].filter(Boolean).join(' ');

  return (
    <TabsVariantContext.Provider value={resolvedVariant}>
      <BaseTabs.List {...htmlProps} className={classes}>
        {children}
        {resolvedVariant === 'underline' && <BaseTabs.Indicator className={styles.indicator} />}
      </BaseTabs.List>
    </TabsVariantContext.Provider>
  );
}

function Tab({
  children,
  value,
  disabled,
  className,
}: TabProps) {
  const variant = React.useContext(TabsVariantContext);
  const variantClass = variant === 'pills' ? styles.tabPills : styles.tabUnderline;
  const classes = [styles.tab, variantClass, className].filter(Boolean).join(' ');

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
  const classes = [
    styles.panel,
    flush && styles.panelFlush,
    className,
  ].filter(Boolean).join(' ');

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
