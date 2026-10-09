"use client";

import * as React from "react";
import { FunnelSimple } from "@phosphor-icons/react";
import { Button, type ButtonSize } from "../Button";
import { Drawer } from "../Drawer";
import { Field } from "../Field";
import { Popover } from "../Popover";
import { VisuallyHidden } from "../VisuallyHidden";
import { useBelowBreakpoint } from "../../utils/breakpoints";
import styles from "./FilterBar.module.scss";

// ============================================
// Types
// ============================================

export type FilterBarCollapse = "auto" | "always" | "never";

export interface FilterBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The filters: `FilterBar.Item`s, each holding one control. */
  children: React.ReactNode;
  /** Names the group, the folded button and the sheet's title.
   * @default "Filters" */
  label?: string;
  /** How many filters differ from their defaults. The folded button shows it,
   * and Reset is disabled at 0.
   * @default 0 */
  activeCount?: number;
  /** Puts every filter back to its default. Without it the sheet has no Reset. */
  onReset?: () => void;
  /** @default "Reset" */
  resetLabel?: string;
  /** The sheet's closing action; filters apply as they change, so say what the
   * person will see ("Show 14 companies").
   * @default "Done" */
  doneLabel?: string;
  /** When the filters fold behind one button. `auto` folds while they do not
   * fit on one line in the room the bar is given (its own width, not the
   * viewport's); `always` and `never` fix it.
   * @default "auto" */
  collapse?: FilterBarCollapse;
  /** Size of the folded button and the sheet's actions. */
  size?: ButtonSize;
}

export interface FilterBarItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The filter's name, shown beside the control on the line and above it in the sheet. */
  label: React.ReactNode;
  /** One control: Select, Combobox, Input, NumberField join the label on their
   * own; wrap anything else in `Field.Control`. */
  children: React.ReactNode;
}

type FilterBarLayout = "inline" | "stacked";

const LayoutContext = React.createContext<FilterBarLayout>("inline");

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

// ============================================
// Sub-components
// ============================================

/** One filter: a Field, so the label names the control it holds. */
function FilterBarItem({ label, children, className, ...htmlProps }: FilterBarItemProps) {
  const layout = React.useContext(LayoutContext);
  return (
    <Field {...htmlProps} className={cx(styles.item, className)} data-layout={layout}>
      <Field.Label className={styles.label}>{label}</Field.Label>
      {children}
    </Field>
  );
}

// ============================================
// Root component
// ============================================

function FilterBarRoot({
  children,
  label = "Filters",
  activeCount = 0,
  onReset,
  resetLabel = "Reset",
  doneLabel = "Done",
  collapse = "auto",
  size,
  className,
  ...htmlProps
}: FilterBarProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const rowRef = React.useRef<HTMLDivElement>(null);
  // The width the filters took on one line when last laid out, so a folded
  // bar knows when the room is back.
  const needed = React.useRef(0);
  const [folded, setFolded] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const narrow = useBelowBreakpoint("sm");
  const collapsed = collapse === "always" || (collapse === "auto" && folded);

  // Folds before paint: the line lays out at its natural width, and when that
  // is wider than the bar's room the filters move behind the button.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (collapse !== "auto" || !root) return;
    const measure = () => {
      const room = root.clientWidth;
      const row = rowRef.current;
      if (row) {
        needed.current = row.getBoundingClientRect().width;
        if (needed.current > room + 1) setFolded(true);
      } else if (needed.current > 0 && room >= needed.current) {
        setFolded(false);
      }
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [collapse, folded]);

  React.useEffect(() => {
    if (!collapsed) setOpen(false);
  }, [collapsed]);

  if (!collapsed) {
    return (
      <div
        {...htmlProps}
        ref={rootRef}
        className={cx(styles.root, className)}
        data-slot="filter-bar"
      >
        <LayoutContext.Provider value="inline">
          <div ref={rowRef} role="group" aria-label={label} className={styles.row}>
            {children}
          </div>
        </LayoutContext.Provider>
      </div>
    );
  }

  const triggerContent = (
    <>
      <FunnelSimple aria-hidden="true" />
      {label}
      {activeCount > 0 ? (
        <span className={styles.count}>
          {activeCount}
          <VisuallyHidden> active</VisuallyHidden>
        </span>
      ) : null}
    </>
  );
  const filters = (
    <LayoutContext.Provider value="stacked">
      <div className={styles.stack}>{children}</div>
    </LayoutContext.Provider>
  );
  const reset = onReset ? (
    <Button variant="ghost" size={size} onClick={onReset} disabled={activeCount === 0}>
      {resetLabel}
    </Button>
  ) : null;

  return (
    <div
      {...htmlProps}
      ref={rootRef}
      className={cx(styles.root, className)}
      data-slot="filter-bar"
      data-collapsed=""
    >
      {narrow ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <Drawer.Trigger render={<Button variant="soft" size={size} />}>
            {triggerContent}
          </Drawer.Trigger>
          <Drawer.Content side="bottom" size="md" className={styles.sheet}>
            <Drawer.Header>
              <Drawer.Title>{label}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>{filters}</Drawer.Body>
            <Drawer.Footer>
              {reset}
              <Drawer.Close render={<Button size={size} />}>{doneLabel}</Drawer.Close>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger render={<Button variant="soft" size={size} />}>
            {triggerContent}
          </Popover.Trigger>
          <Popover.Content side="bottom" align="start">
            <Popover.Title>{label}</Popover.Title>
            <Popover.Body>{filters}</Popover.Body>
            <Popover.Footer>
              {reset}
              <Popover.Close render={<Button size={size} />}>{doneLabel}</Popover.Close>
            </Popover.Footer>
          </Popover.Content>
        </Popover>
      )}
    </div>
  );
}

// ============================================
// Compound export
// ============================================

export const FilterBar = Object.assign(FilterBarRoot, {
  Root: FilterBarRoot,
  Item: FilterBarItem,
});
