"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { WarningCircle } from "@phosphor-icons/react";
import styles from "./Command.module.scss";
import { Button } from "../Button";
import { Kbd } from "../Kbd";
import { Loading } from "../Loading";
import { useThemePortalProps } from "../Theme/context";
import { isComposingEnter } from "../../utils/isComposingEnter";
import { useLoadingPhase } from "../../recipes/loading";

// ============================================
// Types
// ============================================

/**
 * A searchable list of commands: a flush search row over a list that ranks
 * matches and keeps the first one active, so Return runs it straight away.
 * Frameless, so it sits in whatever holds it; `Command.Dialog` is the floating
 * palette.
 * @see https://usefragments.com/components/command
 */
export type CommandFilter = (value: string, search: string, keywords?: string[]) => number;

export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Controlled search value */
  search?: string;
  /** Default search value */
  defaultSearch?: string;
  /** Called when search input changes */
  onSearchChange?: (search: string) => void;
  /** Ranks an item for a search: 0 hides it, and higher scores sort first.
   * Default: a prefix beats a word start, which beats a substring, which beats a keyword. */
  filter?: CommandFilter;
  /** Whether arrow keys wrap from the last item to the first.
   * @default true */
  loop?: boolean;
}

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Results are loading: the list is busy, and after a second a spinner row shows. */
  loading?: boolean;
  /** The loading row's words. @default "Searching…" */
  loadingLabel?: string;
}

export interface CommandItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  children: React.ReactNode;
  /** Value used for filtering (falls back to text content) */
  value?: string;
  /** Extra keywords for filtering */
  keywords?: string[];
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Runs the item (Return or a press). Inside `Command.Dialog` the palette closes after it,
   * unless the handler calls `event.preventDefault()`. */
  onSelect?: (
    value: string,
    event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => void;
}

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Group heading text */
  heading?: string;
}

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CommandErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** What went wrong, in one sentence */
  children: React.ReactNode;
  /** Adds a Retry button */
  onRetry?: () => void;
  /** Label for the retry button. @default "Retry" */
  retryLabel?: string;
}

export type CommandSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export interface CommandDialogProps extends Omit<CommandProps, "title"> {
  /** Controlled open state */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Called when the open state changes */
  onOpenChange?: (open: boolean) => void;
  /** The palette's accessible name.
   * @default "Command palette" */
  label?: string;
  /** The key hints under the list. Pass `null` to leave them out. */
  footer?: React.ReactNode;
}

// ============================================
// Default filter
// ============================================

/** Prefix 4, word start 3, substring 2, keyword 1, no match 0. */
function defaultFilter(value: string, search: string, keywords?: string[]): number {
  const query = search.trim().toLowerCase();
  if (!query) return 1;
  const text = value.toLowerCase();

  if (text.startsWith(query)) return 4;
  const at = text.indexOf(query);
  if (at > 0) return /[\s\-_/.]/.test(text[at - 1] ?? "") ? 3 : 2;
  if (keywords?.some((keyword) => keyword.toLowerCase().includes(query))) return 1;
  return 0;
}

function getTextContent(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join(" ");
  if (React.isValidElement(node)) {
    const childProps = node.props as { children?: React.ReactNode };
    return getTextContent(childProps.children);
  }
  return "";
}

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

// ============================================
// Context
// ============================================

interface ItemRegistration {
  value: string;
  keywords?: string[];
  disabled: boolean;
  order: number;
}

interface CommandContextValue {
  search: string;
  setSearch: (search: string) => void;
  scores: Map<string, number>;
  /** Visible item ids, best match first */
  ranked: string[];
  /** Visible, enabled item ids, best match first: the keyboard order */
  navigable: string[];
  registerItem: (id: string, registration: Omit<ItemRegistration, "order">) => void;
  unregisterItem: (id: string) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  loop: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  visibleCount: number;
  listId: string;
  afterSelect?: () => void;
  /** True while a `Command.Error` row shows: the list is then no listbox */
  errored: boolean;
  /** Called by `Command.Error` on mount; the returned function undoes it */
  trackError: () => () => void;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

/** Set by `Command.Dialog` so a run closes the palette. */
const AfterSelectContext = React.createContext<(() => void) | undefined>(undefined);

function useCommandContext() {
  const ctx = React.useContext(CommandContext);
  if (!ctx) throw new Error("Command sub-components must be used within <Command>");
  return ctx;
}

// ============================================
// Icons
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
  defaultSearch = "",
  onSearchChange,
  filter = defaultFilter,
  loop = true,
  className,
  ...htmlProps
}: CommandProps) {
  const [uncontrolledSearch, setUncontrolledSearch] = React.useState(defaultSearch);
  const isControlled = controlledSearch !== undefined;
  const search = isControlled ? controlledSearch : uncontrolledSearch;
  const afterSelect = React.useContext(AfterSelectContext);

  const [items, setItems] = React.useState<Map<string, ItemRegistration>>(new Map());
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const orderRef = React.useRef(new Map<string, number>());
  const generatedListId = React.useId();
  const listId = `command-list-${generatedListId}`;
  const [errorRows, setErrorRows] = React.useState(0);
  const trackError = React.useCallback(() => {
    setErrorRows((count) => count + 1);
    return () => setErrorRows((count) => count - 1);
  }, []);

  const setSearch = React.useCallback(
    (value: string) => {
      if (!isControlled) {
        setUncontrolledSearch(value);
      }
      onSearchChange?.(value);
    },
    [isControlled, onSearchChange]
  );

  const registerItem = React.useCallback(
    (id: string, registration: Omit<ItemRegistration, "order">) => {
      if (!orderRef.current.has(id)) orderRef.current.set(id, orderRef.current.size);
      const order = orderRef.current.get(id)!;
      setItems((prev) => {
        const next = new Map(prev);
        next.set(id, { ...registration, order });
        return next;
      });
    },
    []
  );

  const unregisterItem = React.useCallback((id: string) => {
    setItems((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const scores = React.useMemo(() => {
    const result = new Map<string, number>();
    for (const [id, registration] of items) {
      result.set(id, filter(registration.value, search, registration.keywords));
    }
    return result;
  }, [items, search, filter]);

  // Best match first; ties keep the order the items were written in.
  const ranked = React.useMemo(
    () =>
      Array.from(items.entries())
        .filter(([id]) => (scores.get(id) ?? 0) > 0)
        .sort(
          ([a, left], [b, right]) =>
            (scores.get(b) ?? 0) - (scores.get(a) ?? 0) || left.order - right.order
        )
        .map(([id]) => id),
    [items, scores]
  );

  const navigable = React.useMemo(
    () => ranked.filter((id) => !items.get(id)?.disabled),
    [items, ranked]
  );

  // The first match is active after every search change, and whenever the
  // active item drops out of the list, so Return always runs something.
  const lastSearch = React.useRef(search);
  React.useEffect(() => {
    const searchChanged = lastSearch.current !== search;
    lastSearch.current = search;
    setActiveId((current) =>
      searchChanged || current == null || !navigable.includes(current)
        ? (navigable[0] ?? null)
        : current
    );
  }, [navigable, search]);

  const contextValue = React.useMemo<CommandContextValue>(
    () => ({
      search,
      setSearch,
      scores,
      ranked,
      navigable,
      registerItem,
      unregisterItem,
      activeId,
      setActiveId,
      loop,
      listRef,
      visibleCount: ranked.length,
      listId,
      afterSelect,
      errored: errorRows > 0,
      trackError,
    }),
    [
      search,
      setSearch,
      scores,
      ranked,
      navigable,
      registerItem,
      unregisterItem,
      activeId,
      loop,
      listId,
      afterSelect,
      errorRows,
      trackError,
    ]
  );

  return (
    <CommandContext.Provider value={contextValue}>
      <div {...htmlProps} className={classes(styles.command, className)}>
        {children}
      </div>
    </CommandContext.Provider>
  );
}

function CommandInput({ className, onChange, onKeyDown, ...htmlProps }: CommandInputProps) {
  const {
    search,
    setSearch,
    listRef,
    setActiveId,
    activeId,
    navigable,
    loop,
    listId,
    visibleCount,
  } = useCommandContext();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (navigable.length === 0) return;

    const first = navigable[0]!;
    const last = navigable[navigable.length - 1]!;
    const index = activeId ? navigable.indexOf(activeId) : -1;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (index < 0) setActiveId(first);
        else if (index < navigable.length - 1) setActiveId(navigable[index + 1]!);
        else if (loop) setActiveId(first);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (index < 0) setActiveId(last);
        else if (index > 0) setActiveId(navigable[index - 1]!);
        else if (loop) setActiveId(last);
        break;
      }
      case "Home": {
        event.preventDefault();
        setActiveId(first);
        break;
      }
      case "End": {
        event.preventDefault();
        setActiveId(last);
        break;
      }
      case "Enter": {
        // Enter confirms an IME candidate in the search field before it selects.
        if (isComposingEnter(event)) break;
        event.preventDefault();
        if (!activeId) break;
        const item = Array.from(
          listRef.current?.querySelectorAll<HTMLElement>("[data-command-item]") ?? []
        ).find((element) => element.id === activeId);
        item?.click();
        break;
      }
    }
  };

  return (
    <div className={styles.search}>
      <SearchIcon />
      <input
        type="text"
        role="combobox"
        aria-expanded={visibleCount > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId ?? undefined}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={search}
        {...htmlProps}
        onChange={(event) => {
          onChange?.(event);
          if (event.defaultPrevented) return;
          setSearch(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        className={classes(styles.input, className)}
      />
    </div>
  );
}

function CommandList({
  children,
  loading = false,
  loadingLabel = "Searching…",
  className,
  ...htmlProps
}: CommandListProps) {
  const { listRef, listId, errored, visibleCount } = useCommandContext();
  const phase = useLoadingPhase(loading);
  // A listbox owns only options and groups. An error row (with its Retry
  // button) or the empty note is neither, so while one of them is all the
  // list holds, it is a plain region; a busy list keeps the role.
  const plain = errored || (visibleCount === 0 && !loading);

  return (
    <div
      ref={listRef}
      {...htmlProps}
      id={listId}
      role={plain ? undefined : "listbox"}
      aria-busy={loading || undefined}
      className={classes(styles.list, className)}
    >
      {children}
      {loading && (phase === "loading" || phase === "slow") && (
        <div className={styles.loading} role="presentation" data-command-loading="">
          <Loading delay={0} inline aria-hidden="true" role="presentation" label={loadingLabel} />
          <span>{loadingLabel}</span>
        </div>
      )}
    </div>
  );
}

function CommandItem({
  children,
  value: valueProp,
  keywords,
  disabled = false,
  onSelect,
  className,
  onClick,
  onKeyDown,
  onMouseMove,
  style,
  ...htmlProps
}: CommandItemProps) {
  const { scores, ranked, registerItem, unregisterItem, activeId, setActiveId, afterSelect } =
    useCommandContext();
  const generatedId = React.useId();
  const itemId = (htmlProps.id as string | undefined) ?? `command-item-${generatedId}`;
  const itemRef = React.useRef<HTMLDivElement>(null);

  const textValue = React.useMemo(() => {
    if (valueProp) return valueProp;
    return getTextContent(children).trim();
  }, [valueProp, children]);

  const keywordKey = keywords?.join("\u0000") ?? "";
  React.useEffect(() => {
    registerItem(itemId, {
      value: textValue,
      keywords: keywordKey ? keywordKey.split("\u0000") : undefined,
      disabled,
    });
  }, [itemId, textValue, keywordKey, disabled, registerItem]);
  React.useEffect(() => () => unregisterItem(itemId), [itemId, unregisterItem]);

  const score = scores.get(itemId) ?? 1;
  const isVisible = score > 0;
  const isActive = activeId === itemId;
  const rank = ranked.indexOf(itemId);

  React.useEffect(() => {
    if (isActive && typeof itemRef.current?.scrollIntoView === "function") {
      itemRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isActive]);

  const activateItem = (
    event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (disabled) return;
    onSelect?.(textValue, event);
    if (!event.defaultPrevented) afterSelect?.();
  };

  return (
    <div
      ref={itemRef}
      {...htmlProps}
      id={itemId}
      role="option"
      aria-selected={isActive}
      aria-disabled={disabled || undefined}
      data-command-item=""
      data-active={isActive || undefined}
      data-disabled={disabled || undefined}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        activateItem(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || isComposingEnter(event)) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateItem(event);
        }
      }}
      // Pointer travel moves the active row; a row scrolled under a still
      // pointer does not.
      onMouseMove={(event) => {
        onMouseMove?.(event);
        if (event.defaultPrevented || disabled || isActive) return;
        setActiveId(itemId);
      }}
      className={classes(styles.item, className)}
      style={{
        ...style,
        display: isVisible ? undefined : "none",
        order: rank >= 0 ? rank : undefined,
      }}
    >
      {children}
    </div>
  );
}

function CommandGroup({ children, heading, className, style, ...htmlProps }: CommandGroupProps) {
  const labelId = React.useId();
  const groupRef = React.useRef<HTMLDivElement>(null);
  const { ranked } = useCommandContext();
  const [best, setBest] = React.useState<number | null>(0);

  // A group shows while any of its items does, and sorts by its best match.
  React.useEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    const ids = Array.from(node.querySelectorAll<HTMLElement>("[data-command-item]")).map(
      (item) => item.id
    );
    const ranks = ids.map((id) => ranked.indexOf(id)).filter((rank) => rank >= 0);
    setBest(ranks.length > 0 ? Math.min(...ranks) : null);
  }, [ranked]);

  return (
    <div
      ref={groupRef}
      {...htmlProps}
      role="group"
      aria-labelledby={heading ? labelId : undefined}
      className={classes(styles.group, className)}
      style={{ ...style, display: best == null ? "none" : undefined, order: best ?? undefined }}
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
    <div {...htmlProps} role="presentation" className={classes(styles.note, className)}>
      {children}
    </div>
  );
}

// One row: the danger glyph, what went wrong, and Retry; announced politely.
function CommandError({
  children,
  onRetry,
  retryLabel = "Retry",
  className,
  ...htmlProps
}: CommandErrorProps) {
  const { trackError } = useCommandContext();
  React.useEffect(() => trackError(), [trackError]);

  return (
    <div
      role="status"
      {...htmlProps}
      data-command-error=""
      className={classes(styles.error, className)}
    >
      <span className={styles.errorIcon} aria-hidden="true">
        <WarningCircle weight="fill" />
      </span>
      <span className={styles.errorWords}>{children}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

function CommandSeparator({ className, ...htmlProps }: CommandSeparatorProps) {
  return <div {...htmlProps} role="separator" className={classes(styles.separator, className)} />;
}

function DefaultHints() {
  return (
    <>
      <span className={styles.hint}>
        <Kbd label="Up arrow">↑</Kbd>
        <Kbd label="Down arrow">↓</Kbd> Move
      </span>
      <span className={styles.hint}>
        <Kbd label="Enter">↵</Kbd> Run
      </span>
      <span className={styles.hint}>
        <Kbd>Esc</Kbd> Close
      </span>
    </>
  );
}

/**
 * The floating palette: a scrim, and the raised panel a little below the top
 * of the window holding a Command. Running an item closes it.
 */
function CommandDialog({
  open,
  defaultOpen,
  onOpenChange,
  label = "Command palette",
  footer,
  children,
  className,
  ...commandProps
}: CommandDialogProps) {
  const portalProps = useThemePortalProps();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );
  const close = React.useCallback(() => setOpen(false), [setOpen]);

  return (
    <BaseDialog.Root open={isOpen} onOpenChange={setOpen}>
      <BaseDialog.Portal {...portalProps}>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Viewport className={styles.dialogViewport}>
          <BaseDialog.Popup aria-label={label} className={classes(styles.dialog, className)}>
            <AfterSelectContext.Provider value={close}>
              <CommandRoot {...commandProps}>{children}</CommandRoot>
            </AfterSelectContext.Provider>
            {footer !== null && (
              <div className={styles.footer}>
                {footer === undefined ? <DefaultHints /> : footer}
              </div>
            )}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
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
  Error: CommandError,
  Separator: CommandSeparator,
  Dialog: CommandDialog,
});
