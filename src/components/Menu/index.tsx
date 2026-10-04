"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { POPUP_COLLISION_PADDING_PX, POPUP_OFFSET_PX } from "../../recipes/popup";
import { useLoadingPhase } from "../../recipes/loading";
import styles from "./Menu.module.scss";
import { useThemePortalProps } from "../Theme/context";
import { resolveNativeButton } from "../../utils/native-button";

// ============================================
// Types
// ============================================

/**
 * A list of actions or choices on a trigger: overflow verbs, row actions, a
 * view switch. Raised plane, popup shadow, no edge; it opens and closes at once.
 * Chosen rows show a check in the selection colour, never a fill.
 * @see https://usefragments.com/components/menu
 */
export interface MenuProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Whether the menu blocks interaction with the page while open.
   * @default true */
  modal?: boolean;
}

/** The trigger. Pass `render` to make a library control (a Button, an IconButton) the trigger. */
export type MenuTriggerProps = React.ComponentProps<typeof BaseMenu.Trigger>;

export interface MenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** @default "bottom" */
  side?: "top" | "bottom" | "left" | "right";
  /** @default "start" */
  align?: "start" | "center" | "end";
  /** Items are still loading on open: the menu is busy at once, and after a
   * second a spinner row ("Loading…") shows below the rows it already has.
   * @default false */
  loading?: boolean;
}

export type MenuItemTone = "neutral" | "danger";

export interface MenuItemProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "onSelect"
> {
  children: React.ReactNode;
  disabled?: boolean;
  /** `danger` colours the label and icon ink; the highlight stays neutral.
   * @default "neutral" */
  tone?: MenuItemTone;
  /** Called when the item is chosen by pointer or keyboard */
  onSelect?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Leading icon */
  icon?: React.ReactNode;
  /** Keyboard shortcut shown at the end, such as "⌘D" */
  shortcut?: string;
}

export interface MenuCheckboxItemProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "onChange"
> {
  children: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Keyboard shortcut shown at the end */
  shortcut?: string;
}

export interface MenuRadioGroupProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface MenuRadioItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  /** Keyboard shortcut shown at the end */
  shortcut?: string;
}

export interface MenuGroupProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export interface MenuGroupLabelProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export type MenuSeparatorProps = React.HTMLAttributes<HTMLElement>;

export interface MenuSubmenuProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface MenuSubmenuTriggerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// ============================================
// Icons
// ============================================

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3.5l4.5 4.5L6 12.5" />
    </svg>
  );
}

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

function Shortcut({ value }: { value?: string }) {
  return value ? <kbd className={styles.itemShortcut}>{value}</kbd> : null;
}

// ============================================
// Components
// ============================================

function MenuRoot({ children, open, defaultOpen, onOpenChange, modal = true }: MenuProps) {
  return (
    <BaseMenu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      {children}
    </BaseMenu.Root>
  );
}

function MenuTrigger({ render, nativeButton, ...props }: MenuTriggerProps) {
  return (
    <BaseMenu.Trigger
      {...props}
      render={render}
      nativeButton={resolveNativeButton(render, nativeButton)}
    />
  );
}

function MenuContent({
  children,
  className,
  side = "bottom",
  align = "start",
  loading = false,
  ...htmlProps
}: MenuContentProps) {
  const portalProps = useThemePortalProps();
  const phase = useLoadingPhase(loading);
  const showRow = loading && (phase === "loading" || phase === "slow");

  return (
    <BaseMenu.Portal {...portalProps}>
      <BaseMenu.Positioner
        side={side}
        align={align}
        sideOffset={POPUP_OFFSET_PX}
        collisionPadding={POPUP_COLLISION_PADDING_PX}
        className={styles.positioner}
      >
        <BaseMenu.Popup
          {...htmlProps}
          aria-busy={loading || undefined}
          className={classes(styles.popup, className)}
        >
          <BaseMenu.Viewport className={styles.viewport}>
            {children}
            {showRow && (
              // A disabled row, so the menu's own semantics hold: it is read
              // in turn with the items and never takes a press.
              <BaseMenu.Item disabled className={styles.loadingRow} data-menu-loading="">
                <span className={styles.itemIcon} aria-hidden="true">
                  <svg
                    className={styles.spinner}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    focusable="false"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </span>
                <span className={styles.itemLabel}>Loading…</span>
              </BaseMenu.Item>
            )}
          </BaseMenu.Viewport>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

function MenuItem({
  children,
  disabled,
  tone = "neutral",
  onSelect,
  onClick,
  className,
  icon,
  shortcut,
  ...htmlProps
}: MenuItemProps) {
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event);
    onSelect?.(event);
  };

  return (
    <BaseMenu.Item
      {...htmlProps}
      disabled={disabled}
      onClick={handleClick}
      data-tone={tone === "danger" ? "danger" : undefined}
      className={classes(styles.item, tone === "danger" && styles.danger, className)}
    >
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      <span className={styles.itemLabel}>{children}</span>
      <Shortcut value={shortcut} />
    </BaseMenu.Item>
  );
}

function MenuCheckboxItem({
  children,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  shortcut,
  className,
  ...htmlProps
}: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem
      {...htmlProps}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange ? (value) => onCheckedChange(value) : undefined}
      disabled={disabled}
      data-menu-checkable=""
      className={classes(styles.item, styles.checkable, className)}
    >
      <span className={styles.indicator}>
        <BaseMenu.CheckboxItemIndicator className={styles.check}>
          <CheckIcon />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      <span className={styles.itemLabel}>{children}</span>
      <Shortcut value={shortcut} />
    </BaseMenu.CheckboxItem>
  );
}

function MenuRadioGroup({ children, value, defaultValue, onValueChange }: MenuRadioGroupProps) {
  return (
    <BaseMenu.RadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (next) => onValueChange(next as string) : undefined}
    >
      {children}
    </BaseMenu.RadioGroup>
  );
}

function MenuRadioItem({
  children,
  value,
  disabled,
  shortcut,
  className,
  ...htmlProps
}: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem
      {...htmlProps}
      value={value}
      disabled={disabled}
      data-menu-checkable=""
      className={classes(styles.item, styles.checkable, className)}
    >
      <span className={styles.indicator}>
        <BaseMenu.RadioItemIndicator className={styles.check}>
          <CheckIcon />
        </BaseMenu.RadioItemIndicator>
      </span>
      <span className={styles.itemLabel}>{children}</span>
      <Shortcut value={shortcut} />
    </BaseMenu.RadioItem>
  );
}

function MenuGroup({ children, className, ...htmlProps }: MenuGroupProps) {
  return (
    <BaseMenu.Group {...htmlProps} className={classes(styles.group, className)}>
      {children}
    </BaseMenu.Group>
  );
}

function MenuGroupLabel({ children, className, ...htmlProps }: MenuGroupLabelProps) {
  return (
    <BaseMenu.GroupLabel {...htmlProps} className={classes(styles.groupLabel, className)}>
      {children}
    </BaseMenu.GroupLabel>
  );
}

function MenuSeparator({ className, ...htmlProps }: MenuSeparatorProps) {
  return <BaseMenu.Separator {...htmlProps} className={classes(styles.separator, className)} />;
}

function MenuSubmenu({ children, open, defaultOpen, onOpenChange }: MenuSubmenuProps) {
  return (
    <BaseMenu.SubmenuRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </BaseMenu.SubmenuRoot>
  );
}

function MenuSubmenuTrigger({
  children,
  disabled,
  className,
  icon,
  ...htmlProps
}: MenuSubmenuTriggerProps) {
  return (
    <BaseMenu.SubmenuTrigger
      {...htmlProps}
      disabled={disabled}
      className={classes(styles.item, styles.submenuTrigger, className)}
    >
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      <span className={styles.itemLabel}>{children}</span>
      <span className={styles.caret}>
        <ChevronIcon />
      </span>
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
