'use client';

import * as React from 'react';
import styles from './Command.module.scss';

// ============================================
// Types
// ============================================

export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Controlled search value */
  search?: string;
  /** Default search value */
  defaultSearch?: string;
  /** Called when search input changes */
  onSearchChange?: (search: string) => void;
  /** Custom filter function. Return 0 to hide, >0 to show (higher = better match).
      Default: case-insensitive substring match on value + keywords */
  filter?: (value: string, search: string, keywords?: string[]) => number;
  /** Whether to loop keyboard navigation. Default: true */
  loop?: boolean;
}

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CommandItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  children: React.ReactNode;
  /** Value used for filtering (falls back to text content) */
  value?: string;
  /** Extra keywords for filtering */
  keywords?: string[];
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Called when item is selected (Enter or click) */
  onItemSelect?: () => void;
}

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Group heading text */
  heading?: string;
}

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export type CommandSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

// ============================================
// Default filter
// ============================================

function defaultFilter(value: string, search: string, keywords?: string[]): number {
  if (!search) return 1;
  const searchLower = search.toLowerCase();
  const valueLower = value.toLowerCase();

  if (valueLower.includes(searchLower)) return 1;

  if (keywords) {
    for (const keyword of keywords) {
      if (keyword.toLowerCase().includes(searchLower)) return 1;
    }
  }

  return 0;
}

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join(' ');
  if (React.isValidElement(node)) {
    const childProps = node.props as { children?: React.ReactNode };
    return getTextContent(childProps.children);
  }
  return '';
}

// ============================================
// Context
// ============================================

interface ItemRegistration {
  value: string;
  keywords?: string[];
}

interface CommandContextValue {
  search: string;
  setSearch: (search: string) => void;
  filter: (value: string, search: string, keywords?: string[]) => number;
  scores: Map<string, number>;
  registerItem: (id: string, registration: ItemRegistration) => void;
  unregisterItem: (id: string) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  loop: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  visibleCount: number;
  listId: string;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommandContext() {
  const ctx = React.useContext(CommandContext);
  if (!ctx) throw new Error('Command sub-components must be used within <Command>');
  return ctx;
}

// ============================================
// Search Icon
// ============================================

function SearchIcon() {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ============================================
// Components
// ============================================

function CommandRoot({
  children,
  search: controlledSearch,
  defaultSearch = '',
  onSearchChange,
  filter = defaultFilter,
  loop = true,
  className,
  ...htmlProps
}: CommandProps) {
  const [uncontrolledSearch, setUncontrolledSearch] = React.useState(defaultSearch);
  const isControlled = controlledSearch !== undefined;
  const search = isControlled ? controlledSearch : uncontrolledSearch;

  const [items, setItems] = React.useState<Map<string, ItemRegistration>>(new Map());
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const generatedListId = React.useId();
  const listId = `command-list-${generatedListId}`;

  const setSearch = React.useCallback(
    (value: string) => {
      if (!isControlled) {
        setUncontrolledSearch(value);
      }
      onSearchChange?.(value);
    },
    [isControlled, onSearchChange]
  );

  const registerItem = React.useCallback((id: string, registration: ItemRegistration) => {
    setItems((prev) => {
      const next = new Map(prev);
      next.set(id, registration);
      return next;
    });
  }, []);

  const unregisterItem = React.useCallback((id: string) => {
    setItems((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Compute scores for all items
  const scores = React.useMemo(() => {
    const result = new Map<string, number>();
    for (const [id, registration] of items) {
      const score = filter(registration.value, search, registration.keywords);
      result.set(id, score);
    }
    return result;
  }, [items, search, filter]);

  const visibleCount = React.useMemo(() => {
    let count = 0;
    for (const score of scores.values()) {
      if (score > 0) count++;
    }
    return count;
  }, [scores]);

  // Reset active when search changes
  React.useEffect(() => {
    setActiveId(null);
  }, [search]);

  const contextValue = React.useMemo<CommandContextValue>(
    () => ({
      search,
      setSearch,
      filter,
      scores,
      registerItem,
      unregisterItem,
      activeId,
      setActiveId,
      loop,
      listRef,
      visibleCount,
      listId,
    }),
    [search, setSearch, filter, scores, registerItem, unregisterItem, activeId, loop, visibleCount, listId]
  );

  return (
    <CommandContext.Provider value={contextValue}>
      <div
        {...htmlProps}
        className={[styles.command, className].filter(Boolean).join(' ')}
        role="search"
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
}

function CommandInput({
  className,
  onChange,
  onKeyDown,
  ...htmlProps
}: CommandInputProps) {
  const { search, setSearch, listRef, setActiveId, activeId, loop, listId } = useCommandContext();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const getEnabledItems = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return [];
    return Array.from(
      list.querySelectorAll<HTMLElement>('[data-command-item]:not([data-disabled="true"])')
    ).filter((el) => el.style.display !== 'none');
  }, [listRef]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const items = getEnabledItems();
    if (items.length === 0) return;

    const currentIndex = activeId
      ? items.findIndex((item) => item.id === activeId)
      : -1;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (currentIndex < 0) {
          setActiveId(items[0].id);
        } else if (currentIndex < items.length - 1) {
          setActiveId(items[currentIndex + 1].id);
        } else if (loop) {
          setActiveId(items[0].id);
        }
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (currentIndex < 0) {
          setActiveId(items[items.length - 1].id);
        } else if (currentIndex > 0) {
          setActiveId(items[currentIndex - 1].id);
        } else if (loop) {
          setActiveId(items[items.length - 1].id);
        }
        break;
      }
      case 'Home': {
        event.preventDefault();
        setActiveId(items[0].id);
        break;
      }
      case 'End': {
        event.preventDefault();
        setActiveId(items[items.length - 1].id);
        break;
      }
      case 'Enter': {
        event.preventDefault();
        if (activeId) {
          const activeItem = items.find((item) => item.id === activeId);
          if (activeItem) {
            activeItem.click();
          }
        }
        break;
      }
    }
  };

  return (
    <div className={styles.inputWrapper}>
      <SearchIcon />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={true}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId ?? undefined}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={search}
        {...htmlProps}
        onChange={(e) => {
          onChange?.(e);
          if (e.defaultPrevented) return;
          setSearch(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        className={[styles.input, className].filter(Boolean).join(' ')}
      />
    </div>
  );
}

function CommandList({ children, className, ...htmlProps }: CommandListProps) {
  const { listRef, listId } = useCommandContext();

  return (
    <div
      ref={listRef}
      {...htmlProps}
      id={listId}
      role="listbox"
      className={[styles.list, className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

function CommandItem({
  children,
  value: valueProp,
  keywords,
  disabled = false,
  onItemSelect,
  className,
  onClick,
  onKeyDown,
  onMouseEnter,
  style,
  ...htmlProps
}: CommandItemProps) {
  const { scores, registerItem, unregisterItem, activeId, setActiveId } = useCommandContext();
  const generatedId = React.useId();
  const itemId = (htmlProps.id as string | undefined) ?? `command-item-${generatedId}`;
  const itemRef = React.useRef<HTMLDivElement>(null);

  // Extract text content for filtering if no value prop
  const textValue = React.useMemo(() => {
    if (valueProp) return valueProp;
    return getTextContent(children).trim();
  }, [valueProp, children]);

  // Register with context
  React.useEffect(() => {
    registerItem(itemId, { value: textValue, keywords });
    return () => unregisterItem(itemId);
  }, [itemId, textValue, keywords, registerItem, unregisterItem]);

  const score = scores.get(itemId) ?? 1;
  const isVisible = score > 0;
  const isActive = activeId === itemId;

  // Scroll active item into view
  React.useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isActive]);

  const activateItem = () => {
    if (disabled) return;
    onItemSelect?.();
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    activateItem();
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    onMouseEnter?.(event);
    if (event.defaultPrevented) return;
    if (!disabled) {
      setActiveId(itemId);
    }
  };

  return (
    <div
      ref={itemRef}
      {...htmlProps}
      id={itemId}
      role="option"
      aria-selected={isActive}
      aria-disabled={disabled}
      data-command-item=""
      data-active={isActive || undefined}
      data-disabled={disabled || undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateItem();
        }
      }}
      onMouseEnter={handleMouseEnter}
      className={[
        styles.item,
        isActive && styles.itemActive,
        disabled && styles.itemDisabled,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...style, display: isVisible ? undefined : 'none' }}
    >
      {children}
    </div>
  );
}

function CommandGroup({ children, heading, className, ...htmlProps }: CommandGroupProps) {
  const labelId = React.useId();
  const groupRef = React.useRef<HTMLDivElement>(null);
  const { scores } = useCommandContext();
  const [hasVisibleChildren, setHasVisibleChildren] = React.useState(true);

  // Check if any children are visible after each score update
  React.useEffect(() => {
    if (!groupRef.current) return;
    const items = groupRef.current.querySelectorAll<HTMLElement>('[data-command-item]');
    const anyVisible = Array.from(items).some((item) => item.style.display !== 'none');
    setHasVisibleChildren(anyVisible);
  }, [scores]);

  const { style, ...restHtmlProps } = htmlProps;

  return (
    <div
      ref={groupRef}
      {...restHtmlProps}
      role="group"
      aria-labelledby={heading ? labelId : undefined}
      className={[styles.group, className].filter(Boolean).join(' ')}
      style={{ ...style, display: hasVisibleChildren ? undefined : 'none' }}
    >
      {heading && (
        <div id={labelId} className={styles.groupHeading}>
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

function CommandEmpty({ children, className, ...htmlProps }: CommandEmptyProps) {
  const { visibleCount } = useCommandContext();

  if (visibleCount > 0) return null;

  return (
    <div
      {...htmlProps}
      role="option"
      aria-disabled="true"
      aria-selected="false"
      className={[styles.empty, className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

function CommandSeparator({ className, ...htmlProps }: CommandSeparatorProps) {
  return (
    <div
      {...htmlProps}
      role="separator"
      className={[styles.separator, className].filter(Boolean).join(' ')}
    />
  );
}

// ============================================
// Export compound component
// ============================================

export const Command = Object.assign(CommandRoot, {
  Input: CommandInput,
  List: CommandList,
  Item: CommandItem,
  Group: CommandGroup,
  Empty: CommandEmpty,
  Separator: CommandSeparator,
});

export {
  CommandRoot,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
  CommandSeparator,
};
