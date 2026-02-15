import * as React from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import styles from './Menu.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export interface MenuProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

export interface MenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export interface MenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export interface MenuItemProps {
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
  className?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  /** When passed, renders a check indicator. `true` shows a checkmark, `false` reserves space. */
  checked?: boolean;
}

export interface MenuCheckboxItemProps {
  children: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export interface MenuRadioGroupProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface MenuRadioItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

export interface MenuGroupProps {
  children: React.ReactNode;
  className?: string;
}

export interface MenuGroupLabelProps {
  children: React.ReactNode;
  className?: string;
}

export interface MenuSeparatorProps {
  className?: string;
}

export interface MenuSubmenuProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface MenuSubmenuTriggerProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

// ============================================
// Icons
// ============================================

function CheckmarkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

// ============================================
// Components
// ============================================

function MenuRoot({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
}: MenuProps) {
  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {children}
    </BaseMenu.Root>
  );
}

function MenuTrigger({ children, asChild, className }: MenuTriggerProps) {
  if (asChild) {
    return (
      <BaseMenu.Trigger className={className} render={children as React.ReactElement}>
        {null}
      </BaseMenu.Trigger>
    );
  }

  return (
    <BaseMenu.Trigger className={className}>
      {children}
    </BaseMenu.Trigger>
  );
}

function MenuContent({
  children,
  className,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  ...htmlProps
}: MenuContentProps) {
  const popupClasses = [styles.popup, className].filter(Boolean).join(' ');

  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={styles.positioner}
      >
        <BaseMenu.Popup {...htmlProps} className={popupClasses}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

function MenuItem({
  children,
  disabled,
  danger,
  onSelect,
  className,
  icon,
  shortcut,
  checked,
}: MenuItemProps) {
  const hasChecked = checked !== undefined;
  const classes = [
    styles.item,
    danger && styles.itemDanger,
    className,
  ].filter(Boolean).join(' ');

  return (
    <BaseMenu.Item
      disabled={disabled}
      onClick={onSelect}
      className={classes}
    >
      {hasChecked && (
        <span className={styles.checkIndicator}>
          {checked ? <CheckmarkIcon /> : null}
        </span>
      )}
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      <span className={styles.itemLabel}>{children}</span>
      {shortcut && <span className={styles.itemShortcut}>{shortcut}</span>}
    </BaseMenu.Item>
  );
}

function MenuCheckboxItem({
  children,
  checked: checkedProp,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
}: MenuCheckboxItemProps) {
  const isControlled = checkedProp !== undefined;
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
  const visualChecked = isControlled ? checkedProp : internalChecked;

  const handleCheckedChange = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalChecked(value);
      onCheckedChange?.(value);
    },
    [isControlled, onCheckedChange],
  );

  const classes = [styles.item, styles.checkboxItem, className]
    .filter(Boolean)
    .join(' ');

  return (
    <BaseMenu.CheckboxItem
      checked={checkedProp}
      defaultChecked={defaultChecked}
      onCheckedChange={handleCheckedChange}
      disabled={disabled}
      className={classes}
    >
      <span className={styles.checkIndicator}>
        {visualChecked ? <CheckmarkIcon /> : null}
      </span>
      <span className={styles.itemLabel}>{children}</span>
    </BaseMenu.CheckboxItem>
  );
}

function MenuRadioGroup({
  children,
  value,
  defaultValue,
  onValueChange,
}: MenuRadioGroupProps) {
  return (
    <BaseMenu.RadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
    >
      {children}
    </BaseMenu.RadioGroup>
  );
}

function MenuRadioItem({
  children,
  value,
  disabled,
  className,
}: MenuRadioItemProps) {
  const classes = [styles.item, styles.radioItem, className]
    .filter(Boolean)
    .join(' ');

  return (
    <BaseMenu.RadioItem value={value} disabled={disabled} className={classes}>
      <span className={styles.radioIndicator}>
        <DotIcon />
      </span>
      <span className={styles.itemLabel}>{children}</span>
    </BaseMenu.RadioItem>
  );
}

function MenuGroup({ children, className }: MenuGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(' ');
  return <BaseMenu.Group className={classes}>{children}</BaseMenu.Group>;
}

function MenuGroupLabel({ children, className }: MenuGroupLabelProps) {
  const classes = [styles.groupLabel, className].filter(Boolean).join(' ');
  return <BaseMenu.GroupLabel className={classes}>{children}</BaseMenu.GroupLabel>;
}

function MenuSeparator({ className }: MenuSeparatorProps) {
  const classes = [styles.separator, className].filter(Boolean).join(' ');
  return <BaseMenu.Separator className={classes} />;
}

function MenuSubmenu({
  children,
  open,
  defaultOpen,
  onOpenChange,
}: MenuSubmenuProps) {
  return (
    <BaseMenu.SubmenuRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange as any}
    >
      {children}
    </BaseMenu.SubmenuRoot>
  );
}

function MenuSubmenuTrigger({
  children,
  disabled,
  className,
  icon,
}: MenuSubmenuTriggerProps) {
  const classes = [styles.item, styles.submenuTrigger, className]
    .filter(Boolean)
    .join(' ');

  return (
    <BaseMenu.SubmenuTrigger disabled={disabled} className={classes}>
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      <span className={styles.itemLabel}>{children}</span>
    </BaseMenu.SubmenuTrigger>
  );
}

// ============================================
// Export compound component
// ============================================

export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  Separator: MenuSeparator,
  Submenu: MenuSubmenu,
  SubmenuTrigger: MenuSubmenuTrigger,
});

// Re-export individual components
export {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuTrigger,
};
