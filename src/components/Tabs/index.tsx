'use client';

import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import styles from './Tabs.module.scss';

// ============================================
// Types
// ============================================

export type TabValue = string | number;

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  children: React.ReactNode;
  defaultValue?: TabValue;
  value?: TabValue;
  onValueChange?: (value: TabValue) => void;
  orientation?: 'horizontal' | 'vertical';
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
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
  className,
  ...htmlProps
}: TabsProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
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
  );
}

function TabsList({
  children,
  variant = 'underline',
  className,
  ...htmlProps
}: TabsListProps) {
  const variantClass = variant === 'pills' ? styles.listPills : styles.listUnderline;
  const classes = [styles.list, variantClass, className].filter(Boolean).join(' ');

  return (
    <TabsVariantContext.Provider value={variant}>
      <BaseTabs.List {...htmlProps} className={classes}>
        {children}
        {variant === 'underline' && <BaseTabs.Indicator className={styles.indicator} />}
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
