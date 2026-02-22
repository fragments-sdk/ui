'use client';

import * as React from 'react';
import styles from './Listbox.module.scss';

// ============================================
// Types
// ============================================

export interface ListboxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ListboxItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  children: React.ReactNode;
  /** Whether this item is currently selected/highlighted */
  selected?: boolean;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
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
}

const ListboxContext = React.createContext<ListboxContextValue | null>(null);

// ============================================
// Components
// ============================================

function ListboxRoot({
  children,
  className,
  style,
  'aria-label': ariaLabel,
  tabIndex,
  onKeyDown,
  onFocus,
  ...htmlProps
}: ListboxProps) {
  const classes = [styles.listbox, className].filter(Boolean).join(' ');
  const listboxRef = React.useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const getEnabledOptions = React.useCallback(() => {
    const listbox = listboxRef.current;
    if (!listbox) return [] as HTMLDivElement[];

    return Array.from(
      listbox.querySelectorAll<HTMLDivElement>('[role="option"]')
    ).filter((option) => option.getAttribute('aria-disabled') !== 'true');
  }, []);

  const moveActive = React.useCallback(
    (direction: 'next' | 'prev' | 'first' | 'last') => {
      const options = getEnabledOptions();
      if (options.length === 0) return;

      if (direction === 'first') {
        setActiveId(options[0].id);
        return;
      }

      if (direction === 'last') {
        setActiveId(options[options.length - 1].id);
        return;
      }

      const currentIndex = activeId
        ? options.findIndex((option) => option.id === activeId)
        : -1;

      if (direction === 'next') {
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % options.length;
        setActiveId(options[nextIndex].id);
      } else {
        const prevIndex = currentIndex < 0
          ? options.length - 1
          : (currentIndex - 1 + options.length) % options.length;
        setActiveId(options[prevIndex].id);
      }
    },
    [activeId, getEnabledOptions]
  );

  React.useEffect(() => {
    if (!activeId) return;
    const listbox = listboxRef.current;
    if (!listbox) return;

    const escapedId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(activeId)
      : activeId.replace(/["\\]/g, '\\$&');
    const activeOption = listbox.querySelector<HTMLElement>(`#${escapedId}`);
    if (!activeOption) return;

    const frame = window.requestAnimationFrame(() => {
      activeOption.scrollIntoView({ block: 'nearest' });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [activeId]);

  const selectActiveItem = React.useCallback(() => {
    if (!activeId) return;
    const listbox = listboxRef.current;
    if (!listbox) return;

    const escapedId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(activeId)
      : activeId.replace(/["\\]/g, '\\$&');
    const activeOption = listbox.querySelector<HTMLElement>(`#${escapedId}`);
    if (activeOption && activeOption.getAttribute('aria-disabled') !== 'true') {
      activeOption.click();
    }
  }, [activeId]);

  const setDefaultActiveIfNeeded = React.useCallback(() => {
    if (activeId) return;
    const options = getEnabledOptions();
    if (options.length === 0) return;

    const selectedOption = options.find((option) => option.getAttribute('aria-selected') === 'true');
    setActiveId((selectedOption ?? options[0]).id);
  }, [activeId, getEnabledOptions]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive('next');
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive('prev');
        break;
      case 'Home':
        event.preventDefault();
        moveActive('first');
        break;
      case 'End':
        event.preventDefault();
        moveActive('last');
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectActiveItem();
        break;
      default:
        break;
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    setDefaultActiveIfNeeded();
    onFocus?.(event);
  };

  const contextValue = React.useMemo<ListboxContextValue>(
    () => ({
      activeId,
      setActiveId,
    }),
    [activeId]
  );

  return (
    <ListboxContext.Provider value={contextValue}>
      <div
        ref={listboxRef}
        {...htmlProps}
        role="listbox"
        aria-label={ariaLabel}
        aria-activedescendant={activeId ?? undefined}
        tabIndex={tabIndex ?? 0}
        className={classes}
        style={style}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      >
        {children}
      </div>
    </ListboxContext.Provider>
  );
}

function ListboxItem({
  children,
  selected = false,
  disabled = false,
  onClick,
  onKeyDown,
  onMouseEnter,
  className,
  style,
  ...htmlProps
}: ListboxItemProps) {
  const context = React.useContext(ListboxContext);
  const generatedId = React.useId();
  const itemId = (htmlProps.id as string | undefined) ?? `listbox-item-${generatedId}`;
  const classes = [
    styles.item,
    selected && styles.itemSelected,
    disabled && styles.itemDisabled,
    context?.activeId === itemId && styles.itemActive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      context?.setActiveId(itemId);
    }
    onMouseEnter?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <div
      {...htmlProps}
      id={itemId}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      data-active={context?.activeId === itemId || undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      className={classes}
      style={style}
    >
      {children}
    </div>
  );
}

function ListboxGroup({ children, label, className, ...htmlProps }: ListboxGroupProps) {
  const classes = [styles.group, className].filter(Boolean).join(' ');
  const labelId = React.useId();

  return (
    <div
      {...htmlProps}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      className={classes}
    >
      {label && <div id={labelId} className={styles.groupLabel}>{label}</div>}
      {children}
    </div>
  );
}

function ListboxEmpty({ children, className, ...htmlProps }: ListboxEmptyProps) {
  const classes = [styles.empty, className].filter(Boolean).join(' ');
  return (
    <div
      {...htmlProps}
      role="option"
      aria-disabled="true"
      aria-selected="false"
      className={classes}
    >
      {children}
    </div>
  );
}

// ============================================
// Export compound component
// ============================================

export const Listbox = Object.assign(ListboxRoot, {
  Item: ListboxItem,
  Group: ListboxGroup,
  Empty: ListboxEmpty,
});

// Re-export individual components
export { ListboxRoot, ListboxItem, ListboxGroup, ListboxEmpty };
