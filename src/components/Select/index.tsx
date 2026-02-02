import * as React from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import styles from './Select.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export type SelectValue = string;

export interface SelectOption {
  value: SelectValue;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  children: React.ReactNode;
  value?: SelectValue | null;
  defaultValue?: SelectValue;
  onValueChange?: (value: SelectValue | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  placeholder?: string;
}

export interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  placeholder?: string;
}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}

export interface SelectItemProps {
  children: React.ReactNode;
  value: SelectValue;
  disabled?: boolean;
  className?: string;
}

export interface SelectGroupProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectGroupLabelProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================
// Icons
// ============================================

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ============================================
// Context for placeholder
// ============================================

const SelectContext = React.createContext<{ placeholder?: string }>({});

// ============================================
// Components
// ============================================

function SelectRoot({
  children,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  required,
  name,
  placeholder,
}: SelectProps) {
  return (
    <SelectContext.Provider value={{ placeholder }}>
      <BaseSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        disabled={disabled}
        required={required}
        name={name}
      >
        {children}
      </BaseSelect.Root>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ children, placeholder, className, ...htmlProps }: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  const placeholderText = placeholder ?? context.placeholder;

  const classes = [styles.trigger, className].filter(Boolean).join(' ');

  return (
    <BaseSelect.Trigger {...htmlProps} className={classes}>
      {children ?? (
        <>
          <BaseSelect.Value placeholder={placeholderText} className={styles.value} />
          <BaseSelect.Icon className={styles.icon}>
            <ChevronDownIcon />
          </BaseSelect.Icon>
        </>
      )}
    </BaseSelect.Trigger>
  );
}

function SelectContent({
  children,
  className,
  sideOffset = 4,
  align = 'start',
  ...htmlProps
}: SelectContentProps) {
  const popupClasses = [styles.popup, className].filter(Boolean).join(' ');

  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        sideOffset={sideOffset}
        align={align}
        className={styles.positioner}
      >
        <BaseSelect.Popup {...htmlProps} className={popupClasses}>
          {children}
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

function SelectItem({ children, value, disabled, className }: SelectItemProps) {
  const classes = [styles.item, className].filter(Boolean).join(' ');

  return (
    <BaseSelect.Item value={value} disabled={disabled} className={classes}>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

function SelectGroup({ children, className }: SelectGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(' ');
  return <BaseSelect.Group className={classes}>{children}</BaseSelect.Group>;
}

function SelectGroupLabel({ children, className }: SelectGroupLabelProps) {
  const classes = [styles.groupLabel, className].filter(Boolean).join(' ');
  return <BaseSelect.GroupLabel className={classes}>{children}</BaseSelect.GroupLabel>;
}

// ============================================
// Export compound component
// ============================================

export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
});

// Re-export individual components
export {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
};
