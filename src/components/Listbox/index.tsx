"use client";

import * as React from "react";
import { Check } from "@phosphor-icons/react";
import styles from "./Listbox.module.scss";
import { isComposingEnter } from "../../utils/isComposingEnter";

// ============================================
// Types
// ============================================

interface ListboxBaseProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  children: React.ReactNode;
  /** Disables every option and removes the list from the tab order. */
  disabled?: boolean;
}

export interface ListboxSingleProps extends ListboxBaseProps {
  multiple?: false;
  /** The selected option's value (controlled). */
  value?: string | null;
  /** The initially selected value (uncontrolled). */
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
}

export interface ListboxMultipleProps extends ListboxBaseProps {
  /** Lets several options be selected; each pick toggles its option. */
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ListboxProps = ListboxSingleProps | ListboxMultipleProps;

export interface ListboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** The value this option selects. */
  value: string;
  /** Whether this option can be picked. */
  disabled?: boolean;
}

export interface ListboxGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Group label */
  label?: string;
}

export interface ListboxEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface ListboxContextValue {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  isSelected: (value: string) => boolean;
  select: (value: string) => void;
  disabled: boolean;
}

const ListboxContext = React.createContext<ListboxContextValue | null>(null);

function escapeId(id: string) {
  return typeof CSS !== "undefined" && typeof CSS.escape === "function"
    ? CSS.escape(id)
    : id.replace(/["\\]/g, "\\$&");
}

// ============================================
// Components
// ============================================

function ListboxEmpty({ children, className, ...htmlProps }: ListboxEmptyProps) {
  const classes = [styles.empty, className].filter(Boolean).join(" ");
  return (
    <div {...htmlProps} role="status" className={classes}>
      {children}
    </div>
  );
}

function ListboxRoot(props: ListboxProps) {
  const {
    children,
    className,
    style,
    tabIndex,
    onKeyDown,
    onFocus,
    disabled = false,
    multiple = false,
    value: valueProp,
    defaultValue,
    onValueChange,
    ...htmlProps
  } = props;

  const listboxRef = React.useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const toList = (input: string | string[] | null | undefined): string[] =>
    input == null ? [] : Array.isArray(input) ? input : [input];

  const [uncontrolled, setUncontrolled] = React.useState<string[]>(() => toList(defaultValue));
  const controlled = valueProp !== undefined;
  const selected = controlled ? toList(valueProp) : uncontrolled;

  const select = (value: string) => {
    if (disabled) return;
    if (multiple) {
      const next = selected.includes(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value];
      if (!controlled) setUncontrolled(next);
      (onValueChange as ((value: string[]) => void) | undefined)?.(next);
    } else {
      if (!controlled) setUncontrolled([value]);
      (onValueChange as ((value: string) => void) | undefined)?.(value);
    }
  };

  const getEnabledOptions = React.useCallback(() => {
    const listbox = listboxRef.current;
    if (!listbox) return [] as HTMLDivElement[];

    return Array.from(listbox.querySelectorAll<HTMLDivElement>('[role="option"]')).filter(
      (option) => option.getAttribute("aria-disabled") !== "true"
    );
  }, []);

  const moveActive = React.useCallback(
    (direction: "next" | "prev" | "first" | "last") => {
      const options = getEnabledOptions();
      if (options.length === 0) return;

      if (direction === "first") {
        setActiveId(options[0].id);
        return;
      }

      if (direction === "last") {
        setActiveId(options[options.length - 1].id);
        return;
      }

      const currentIndex = activeId ? options.findIndex((option) => option.id === activeId) : -1;

      if (direction === "next") {
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % options.length;
        setActiveId(options[nextIndex].id);
      } else {
        const prevIndex =
          currentIndex < 0
            ? options.length - 1
            : (currentIndex - 1 + options.length) % options.length;
        setActiveId(options[prevIndex].id);
      }
    },
    [activeId, getEnabledOptions]
  );

  React.useEffect(() => {
    if (!activeId) return;
    const activeOption = listboxRef.current?.querySelector<HTMLElement>(`#${escapeId(activeId)}`);
    if (!activeOption) return;

    const frame = window.requestAnimationFrame(() => {
      activeOption.scrollIntoView?.({ block: "nearest" });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [activeId]);

  const selectActiveItem = () => {
    if (!activeId) return;
    const activeOption = listboxRef.current?.querySelector<HTMLElement>(`#${escapeId(activeId)}`);
    if (activeOption && activeOption.getAttribute("aria-disabled") !== "true") {
      activeOption.click();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive("next");
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive("prev");
        break;
      case "Home":
        event.preventDefault();
        moveActive("first");
        break;
      case "End":
        event.preventDefault();
        moveActive("last");
        break;
      case "Enter":
      case " ":
        if (isComposingEnter(event)) break;
        event.preventDefault();
        selectActiveItem();
        break;
      default:
        break;
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!activeId && !disabled) {
      const options = getEnabledOptions();
      const first =
        options.find((option) => option.getAttribute("aria-selected") === "true") ?? options[0];
      if (first) setActiveId(first.id);
    }
    onFocus?.(event);
  };

  const contextValue: ListboxContextValue = {
    activeId,
    setActiveId,
    isSelected: (value) => selected.includes(value),
    select,
    disabled,
  };

  // The empty line is a status, not an option, so it sits beside the listbox
  // element on the same plane rather than inside it.
  const options: React.ReactNode[] = [];
  const empties: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === ListboxEmpty) empties.push(child);
    else options.push(child);
  });

  return (
    <ListboxContext.Provider value={contextValue}>
      <div className={[styles.root, className].filter(Boolean).join(" ")} style={style}>
        <div
          ref={listboxRef}
          {...htmlProps}
          role="listbox"
          aria-multiselectable={multiple || undefined}
          aria-disabled={disabled || undefined}
          aria-activedescendant={activeId ?? undefined}
          tabIndex={disabled ? -1 : (tabIndex ?? 0)}
          className={styles.listbox}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
        >
          {options}
        </div>
        {empties}
      </div>
    </ListboxContext.Provider>
  );
}

function ListboxItem({
  children,
  value,
  disabled: disabledProp = false,
  onClick,
  onMouseEnter,
  className,
  id,
  ...htmlProps
}: ListboxItemProps) {
  const context = React.useContext(ListboxContext);
  const generatedId = React.useId();
  const itemId = id ?? `listbox-item-${generatedId}`;
  const disabled = disabledProp || Boolean(context?.disabled);
  const selected = context?.isSelected(value) ?? false;
  const highlighted = context?.activeId === itemId;

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) context?.setActiveId(itemId);
    onMouseEnter?.(event);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    onClick?.(event);
    if (event.defaultPrevented) return;
    context?.setActiveId(itemId);
    context?.select(value);
  };

  return (
    <div
      {...htmlProps}
      id={itemId}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-selected={selected || undefined}
      data-highlighted={highlighted || undefined}
      data-disabled={disabled || undefined}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={[styles.item, className].filter(Boolean).join(" ")}
    >
      <span className={styles.itemLabel}>{children}</span>
      <span className={styles.itemIndicator} aria-hidden="true">
        {selected && <Check weight="bold" />}
      </span>
    </div>
  );
}

function ListboxGroup({ children, label, className, ...htmlProps }: ListboxGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(" ");
  const labelId = React.useId();

  return (
    <div
      {...htmlProps}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      className={classes}
    >
      {label && (
        <div id={labelId} className={styles.groupLabel}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================
// Export compound component
// ============================================

export const Listbox = Object.assign(ListboxRoot, {
  Root: ListboxRoot,
  Item: ListboxItem,
  Group: ListboxGroup,
  Empty: ListboxEmpty,
});
