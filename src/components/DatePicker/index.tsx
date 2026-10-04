"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { WarningCircle } from "@phosphor-icons/react";
import { mergeAriaIds } from "../../utils/aria";
import { POPUP_COLLISION_PADDING_PX, POPUP_OFFSET_PX } from "../../recipes/popup";
import { isDevelopmentBuild } from "../../utils/env";
import { Button } from "../Button";
import { useResolvedControlSize } from "../ComponentDefaults";
import { Skeleton } from "../Skeleton";
import { useThemePortalProps } from "../Theme/context";
import styles from "./DatePicker.module.scss";

// ============================================
// Types (self-owned — no external dependency for types)
// ============================================

export type DateRange = { from: Date | undefined; to?: Date | undefined };
export type Matcher = Date | DateRange | ((date: Date) => boolean) | Date[];
type Locale = { [key: string]: unknown };

export type DatePickerSize = "sm" | "md";

interface DatePickerBaseProps {
  children: React.ReactNode;
  /** Wrapper class name */
  className?: string;
  /** Visible label; it names the trigger through aria-labelledby */
  label?: string;
  /** Helper text shown below the field */
  helperText?: string;
  /** Marks the value invalid: danger edge plus the error message */
  invalid?: boolean;
  /** Words shown under the field while it is invalid */
  errorMessage?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Show the value without letting it change (the calendar stays shut) */
  readOnly?: boolean;
  /** Number of months displayed side-by-side */
  numberOfMonths?: number;
  /** Trigger size.
   * @default "md" */
  size?: DatePickerSize;
  /** react-day-picker Matcher for disabled dates */
  disabledDates?: Matcher | Matcher[];
  /** Trigger placeholder text */
  placeholder?: string;
  /** date-fns locale: drives the calendar and the default Intl formatting */
  locale?: Locale;
  /** Formats one date for the trigger; a range joins two with an en dash */
  format?: (date: Date) => string;
  /** Controlled popover open state */
  open?: boolean;
  /** Popover open state change callback */
  onOpenChange?: (open: boolean) => void;
  /** Hidden input name for forms */
  name?: string;
}

export interface DatePickerSingleProps extends DatePickerBaseProps {
  mode?: "single";
  /** The selected date (controlled) */
  value?: Date | null;
  /** The initially selected date (uncontrolled) */
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
}

export interface DatePickerRangeProps extends DatePickerBaseProps {
  mode: "range";
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (value: DateRange | null) => void;
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

export interface DatePickerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  placeholder?: string;
}

export interface DatePickerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  sideOffset?: number;
  align?: "start" | "center" | "end";
}

export interface DatePickerCalendarProps {
  /** Override number of months from root */
  numberOfMonths?: number;
  className?: string;
}

export interface DatePickerPresetProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "color"
> {
  children: React.ReactNode;
  /** Date to select (single mode) */
  date?: Date;
  /** Range to select (range mode) */
  range?: DateRange;
}

// ============================================
// Icons
// ============================================

function CalendarIcon() {
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChevronLeftIcon() {
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ============================================
// Context
// ============================================

interface DatePickerContextValue {
  mode: "single" | "range";
  selected: Date | null;
  selectedRange: DateRange | null;
  setSelected: (date: Date | null) => void;
  setSelectedRange: (range: DateRange | null) => void;
  numberOfMonths: number;
  disabled: boolean;
  disabledDates?: Matcher | Matcher[];
  placeholder: string;
  locale?: Locale;
  formatDate: (date: Date) => string;
  formatRange: (range: DateRange) => string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  size: DatePickerSize;
  readOnly: boolean;
  labelId?: string;
  describedBy?: string;
  /** Mirrors the wrapper's `data-invalid` onto the trigger as `aria-invalid`,
   * so assistive tech hears the state the danger edge is painting. */
  invalid?: boolean;
}

const DatePickerContext = React.createContext<DatePickerContextValue | null>(null);

function useDatePickerContext() {
  const context = React.useContext(DatePickerContext);
  if (!context) {
    throw new Error("DatePicker compound components must be used within <DatePicker>");
  }
  return context;
}

// ============================================
// Default formatters
// ============================================
//
// Zero-dependency `Intl.DateTimeFormat` so the default trigger label needs no
// optional peer. `date-fns` remains an optional peer only for consumers who pass
// their own `formatDate`/`formatRange`; the default path never imports it, so a
// bundler that pulls DatePicker into the graph does not fail on a missing peer.
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function intlFormatter(code: string, style: "long" | "medium"): Intl.DateTimeFormat {
  const key = `${code}|${style}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(
      code,
      style === "long"
        ? { month: "long", day: "numeric", year: "numeric" }
        : { month: "short", day: "numeric", year: "numeric" }
    );
    formatterCache.set(key, formatter);
  }
  return formatter;
}

function localeCode(locale?: Locale): string {
  const code = locale?.code;
  return typeof code === "string" ? code : "en-US";
}

/** Ranges join their two ends with a spaced en dash. */
const RANGE_SEPARATOR = " \u2013 ";

function joinRange(range: DateRange, formatOne: (date: Date) => string): string {
  if (!range.from) return "";
  if (!range.to) return formatOne(range.from);
  return `${formatOne(range.from)}${RANGE_SEPARATOR}${formatOne(range.to)}`;
}

function formatDateForHiddenInput(date?: Date): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ============================================
// Lazy-loaded dependency (react-day-picker)
// ============================================
//
// Loaded on demand via import() so the barrel never statically references the
// optional `react-day-picker` peer (or its transitive `date-fns` dependency),
// and — unlike require(), which browser ESM bundles do not define — the
// calendar actually resolves when the peer is installed.

type DayPickerComponent = React.ComponentType<Record<string, unknown>>;
type RdpEnum = Record<string, string>;

let _DayPicker: DayPickerComponent | null = null;
let _UI: RdpEnum | null = null;
let _SelectionState: RdpEnum | null = null;
let _DayFlag: RdpEnum | null = null;
let _rdpLoadPromise: Promise<void> | null = null;
let _rdpFailed = false;

function loadDayPickerDeps(): Promise<void> {
  if (!_rdpLoadPromise) {
    _rdpLoadPromise = (async () => {
      try {
        const rdp = await import("react-day-picker");
        _DayPicker = rdp.DayPicker as unknown as DayPickerComponent;
        _UI = rdp.UI as unknown as RdpEnum;
        _SelectionState = rdp.SelectionState as unknown as RdpEnum;
        _DayFlag = rdp.DayFlag as unknown as RdpEnum;
      } catch {
        _rdpFailed = true;
        if (isDevelopmentBuild()) {
          console.warn(
            "[@usefragments/ui] DatePicker: react-day-picker is not installed. " +
              "Install it with: npm install react-day-picker"
          );
        }
      }
    })();
  }
  return _rdpLoadPromise;
}

/** Kick off the lazy react-day-picker load on mount and re-render once it settles. */
function useDayPickerDeps(): boolean {
  const [, rerender] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (_DayPicker || _rdpFailed) return;
    let active = true;
    void loadDayPickerDeps().then(() => {
      if (active) rerender();
    });
    return () => {
      active = false;
    };
  }, []);
  return _DayPicker !== null;
}

// ============================================
// ClassNames mapping (built lazily)
// ============================================

function getCalendarClassNames() {
  const UI = _UI!;
  const SelectionState = _SelectionState!;
  const DayFlag = _DayFlag!;
  return {
    [UI.Root]: styles.calendar,
    [UI.Months]: styles.months,
    [UI.Month]: styles.month,
    [UI.MonthCaption]: styles.monthCaption,
    [UI.CaptionLabel]: styles.captionLabel,
    [UI.Nav]: styles.nav,
    [UI.PreviousMonthButton]: styles.navButton,
    [UI.NextMonthButton]: styles.navButton,
    [UI.MonthGrid]: styles.monthGrid,
    [UI.Weekdays]: styles.weekdays,
    [UI.Weekday]: styles.weekday,
    [UI.Weeks]: styles.weeks,
    [UI.Week]: styles.week,
    [UI.Day]: styles.day,
    [UI.DayButton]: styles.dayButton,
    [UI.Chevron]: styles.chevron,
    [SelectionState.selected]: styles.selected,
    [SelectionState.range_start]: styles.rangeStart,
    [SelectionState.range_middle]: styles.rangeMiddle,
    [SelectionState.range_end]: styles.rangeEnd,
    [DayFlag.today]: styles.today,
    [DayFlag.outside]: styles.outside,
    [DayFlag.disabled]: styles.disabled,
    [DayFlag.focused]: styles.focused,
  };
}

// ============================================
// Components
// ============================================

const DatePickerRoot = React.forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePickerRoot(props, ref) {
    const {
      children,
      label,
      helperText,
      invalid = false,
      errorMessage,
      className,
      mode = "single",
      numberOfMonths = 1,
      disabled = false,
      readOnly = false,
      size: sizeProp,
      disabledDates,
      placeholder,
      locale,
      format,
      open: openProp,
      onOpenChange,
      name,
    } = props;
    const resolvedSize = useResolvedControlSize(sizeProp);
    const size: DatePickerSize = resolvedSize === "sm" ? "sm" : "md";
    // Warm the calendar dependency while the popover is still closed.
    React.useEffect(() => {
      void loadDayPickerDeps();
    }, []);

    const isRange = mode === "range";
    const controlled = props.value !== undefined;
    const [internalValue, setInternalValue] = React.useState<Date | DateRange | null>(
      props.defaultValue ?? null
    );
    const value = controlled ? (props.value ?? null) : internalValue;

    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlledOpen = openProp !== undefined;
    const isOpen = readOnly ? false : isControlledOpen ? openProp : internalOpen;

    const handleOpenChange = React.useCallback(
      (newOpen: boolean) => {
        if (readOnly && newOpen) return;
        if (!isControlledOpen) setInternalOpen(newOpen);
        onOpenChange?.(newOpen);
      },
      [isControlledOpen, onOpenChange, readOnly]
    );

    const onValueChange = props.onValueChange as
      | ((value: Date | DateRange | null) => void)
      | undefined;

    const setSelected = React.useCallback(
      (date: Date | null) => {
        if (!controlled) setInternalValue(date);
        onValueChange?.(date);
        // A single pick is the whole job: close at once (popups are instant).
        if (date) handleOpenChange(false);
      },
      [controlled, onValueChange, handleOpenChange]
    );

    // A range stays open: the second click, Escape or an outside click closes it.
    const setSelectedRange = React.useCallback(
      (range: DateRange | null) => {
        if (!controlled) setInternalValue(range);
        onValueChange?.(range);
      },
      [controlled, onValueChange]
    );

    const baseId = React.useId();
    const labelId = label ? `datepicker-label-${baseId}` : undefined;
    const helperId = helperText ? `datepicker-helper-${baseId}` : undefined;
    const hasError = invalid;
    const errorId = hasError && errorMessage ? `datepicker-error-${baseId}` : undefined;

    const code = localeCode(locale);
    const formatDate = format ?? ((date: Date) => intlFormatter(code, "long").format(date));
    const formatRangeEnd = format ?? ((date: Date) => intlFormatter(code, "medium").format(date));

    const selected = !isRange && value instanceof Date ? value : null;
    const selectedRange = isRange && value && !(value instanceof Date) ? value : null;

    const contextValue: DatePickerContextValue = {
      mode,
      selected,
      selectedRange,
      setSelected,
      setSelectedRange,
      numberOfMonths,
      disabled,
      disabledDates,
      placeholder: placeholder ?? (isRange ? "Select date range" : "Pick a date"),
      locale,
      formatDate,
      formatRange: (range) => joinRange(range, formatRangeEnd),
      isOpen,
      setIsOpen: handleOpenChange,
      size,
      readOnly,
      labelId,
      describedBy: mergeAriaIds(helperId, errorId),
      invalid: hasError,
    };

    const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(" ");

    return (
      <DatePickerContext.Provider value={contextValue}>
        {/* data-invalid lets the trigger pick up the error border; without it only
          the message turns red and the control still looks valid. */}
        <div
          ref={ref}
          className={wrapperClasses}
          data-invalid={hasError || undefined}
          data-readonly={readOnly || undefined}
        >
          {label && (
            <span id={labelId} className={styles.label}>
              {label}
            </span>
          )}
          <BasePopover.Root open={isOpen} onOpenChange={handleOpenChange}>
            {children}
          </BasePopover.Root>
          {helperText && (
            <span id={helperId} className={styles.helper}>
              {helperText}
            </span>
          )}
          {errorId && (
            <span id={errorId} className={styles.errorMessage}>
              <WarningCircle aria-hidden="true" weight="bold" className={styles.errorIcon} />
              {errorMessage}
            </span>
          )}
        </div>
        {name && (
          <input
            type="hidden"
            name={name}
            value={
              isRange
                ? selectedRange
                  ? `${formatDateForHiddenInput(selectedRange.from)},${formatDateForHiddenInput(selectedRange.to)}`
                  : ""
                : formatDateForHiddenInput(selected ?? undefined)
            }
          />
        )}
      </DatePickerContext.Provider>
    );
  }
);

function DatePickerTrigger({
  children,
  placeholder,
  className,
  type = "button",
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...htmlProps
}: DatePickerTriggerProps) {
  const ctx = useDatePickerContext();
  const valueId = React.useId();
  const placeholderText = placeholder ?? ctx.placeholder;

  const classes = [styles.trigger, ctx.size === "sm" && styles.triggerSm, className]
    .filter(Boolean)
    .join(" ");

  let displayText: string | null = null;
  if (ctx.mode === "single" && ctx.selected) {
    displayText = ctx.formatDate(ctx.selected);
  } else if (ctx.mode === "range" && ctx.selectedRange?.from) {
    displayText = ctx.formatRange(ctx.selectedRange);
  }

  // The visible label names the trigger, followed by what it currently holds.
  const labelledBy =
    ariaLabelledBy ?? (ctx.labelId && !children ? `${ctx.labelId} ${valueId}` : ctx.labelId);

  return (
    <BasePopover.Trigger
      {...htmlProps}
      type={type}
      className={classes}
      disabled={ctx.disabled}
      aria-invalid={ctx.invalid || undefined}
      aria-labelledby={labelledBy}
      aria-describedby={mergeAriaIds(ariaDescribedBy, ctx.describedBy)}
      data-readonly={ctx.readOnly || undefined}
    >
      {children ?? (
        <>
          <span className={styles.triggerIcon}>
            <CalendarIcon />
          </span>
          <span
            id={valueId}
            className={displayText ? styles.triggerValue : styles.triggerPlaceholder}
          >
            {displayText ?? placeholderText}
          </span>
        </>
      )}
    </BasePopover.Trigger>
  );
}

function DatePickerContent({
  children,
  className,
  sideOffset = POPUP_OFFSET_PX,
  align = "start",
  ...htmlProps
}: DatePickerContentProps) {
  const portalProps = useThemePortalProps();
  const popupClasses = [styles.popup, className].filter(Boolean).join(" ");

  return (
    <BasePopover.Portal {...portalProps}>
      <BasePopover.Positioner
        side="bottom"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={POPUP_COLLISION_PADDING_PX}
        className={styles.positioner}
      >
        <BasePopover.Popup {...htmlProps} className={popupClasses}>
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

/** The calendar's footprint while react-day-picker resolves: caption, weekday
 * row and six weeks of cells, so the popup never jumps when it arrives. */
function CalendarSkeleton({ months }: { months: number }) {
  return (
    <div className={styles.calendarSkeleton} aria-hidden="true">
      {Array.from({ length: months }, (_, index) => (
        <div key={index} className={styles.calendarSkeletonMonth}>
          <Skeleton fill />
        </div>
      ))}
    </div>
  );
}

function DatePickerCalendar({
  numberOfMonths: numberOfMonthsProp,
  className,
}: DatePickerCalendarProps) {
  const ctx = useDatePickerContext();
  const monthCount = numberOfMonthsProp ?? ctx.numberOfMonths;

  const components = React.useMemo(
    () => ({
      Chevron: (props: { orientation?: string }) =>
        props.orientation === "left" ? <ChevronLeftIcon /> : <ChevronRightIcon />,
    }),
    []
  );

  const rdpReady = useDayPickerDeps();
  if (!rdpReady || !_DayPicker || !_UI) {
    return <CalendarSkeleton months={monthCount} />;
  }
  const DayPicker = _DayPicker;
  const UI = _UI;

  const calendarClassNames = getCalendarClassNames();

  const calendarClasses = className
    ? { ...calendarClassNames, [UI.Root]: [styles.calendar, className].join(" ") }
    : calendarClassNames;

  // Fixed weeks always: six rows, so the popup height never jumps by month.
  const shared = {
    numberOfMonths: monthCount,
    disabled: ctx.disabledDates,
    locale: ctx.locale,
    fixedWeeks: true,
    classNames: calendarClasses,
    components,
    showOutsideDays: true,
  };

  if (ctx.mode === "range") {
    const rangeSelected = ctx.selectedRange
      ? { from: ctx.selectedRange.from ?? undefined, to: ctx.selectedRange.to ?? undefined }
      : undefined;

    return (
      <DayPicker
        {...shared}
        mode="range"
        selected={rangeSelected}
        onSelect={(range: { from?: Date; to?: Date } | undefined) => {
          ctx.setSelectedRange(
            range ? { from: range.from ?? undefined, to: range.to ?? undefined } : null
          );
        }}
      />
    );
  }

  return (
    <DayPicker
      {...shared}
      mode="single"
      selected={ctx.selected ?? undefined}
      onSelect={(date: Date | undefined) => {
        ctx.setSelected(date ?? null);
      }}
    />
  );
}

function DatePickerPreset({
  children,
  date,
  range,
  className,
  onClick,
  ...buttonProps
}: DatePickerPresetProps) {
  const ctx = useDatePickerContext();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (ctx.mode === "single" && date) {
      ctx.setSelected(date);
    } else if (ctx.mode === "range" && range) {
      ctx.setSelectedRange(range);
    }
  };

  return (
    <Button
      type="button"
      {...buttonProps}
      variant="ghost"
      size="sm"
      className={[styles.preset, className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}

// ============================================
// Export compound component
// ============================================

export const DatePicker = Object.assign(DatePickerRoot, {
  Root: DatePickerRoot,
  Trigger: DatePickerTrigger,
  Content: DatePickerContent,
  Calendar: DatePickerCalendar,
  Preset: DatePickerPreset,
  /** Start resolving react-day-picker before first render (optional). */
  preload: loadDayPickerDeps,
});
