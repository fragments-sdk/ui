"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { useFormFieldIds, type FormFieldProps } from "../../utils/aria";
import { useResolvedControlSize } from "../ComponentDefaults";
import styles from "./DatePicker.module.scss";

// ============================================
// Types (self-owned — no external dependency for types)
// ============================================

export type DateRange = { from: Date | undefined; to?: Date | undefined };
export type Matcher = Date | DateRange | ((date: Date) => boolean) | Date[];
type Locale = { [key: string]: unknown };

export interface DatePickerProps extends FormFieldProps {
  children: React.ReactNode;
  /** Wrapper class name */
  className?: string;
  /** Selection mode */
  mode?: "single" | "range";
  /** Controlled date (single mode) */
  selected?: Date | null;
  /** Controlled range (range mode) */
  selectedRange?: DateRange | null;
  /** Single selection callback */
  onSelect?: (date: Date | null) => void;
  /** Alias for onSelect (consistent with Input/Select onChange convention) */
  onChange?: (date: Date | null) => void;
  /** Range selection callback */
  onRangeSelect?: (range: DateRange | null) => void;
  /** Number of months displayed side-by-side */
  numberOfMonths?: number;
  /** Disable the picker */
  disabled?: boolean;
  /** Size variant.
   * @default "md" */
  size?: "sm" | "md" | "lg";
  /** react-day-picker Matcher for disabled dates */
  disabledDates?: Matcher | Matcher[];
  /** Trigger placeholder text */
  placeholder?: string;
  /** date-fns locale for i18n */
  locale?: Locale;
  /** Always show 6 rows */
  fixedWeeks?: boolean;
  /** Custom trigger date formatter */
  formatDate?: (date: Date) => string;
  /** Custom trigger range formatter */
  formatRange?: (range: DateRange) => string;
  /** Controlled popover open state */
  open?: boolean;
  /** Popover open state change callback */
  onOpenChange?: (open: boolean) => void;
  /** Hidden input name for forms */
  name?: string;
}

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

export interface DatePickerPresetProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  fixedWeeks: boolean;
  formatDate: (date: Date) => string;
  formatRange: (range: DateRange) => string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isControlledOpen: boolean;
  size: "sm" | "md" | "lg";
  name?: string;
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
const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});
const mediumDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

function defaultFormatDate(date: Date): string {
  return longDateFormatter.format(date);
}

function defaultFormatRange(range: DateRange): string {
  if (!range.from) return "";
  if (!range.to) return mediumDateFormatter.format(range.from);
  return `${mediumDateFormatter.format(range.from)} - ${mediumDateFormatter.format(range.to)}`;
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
// Loaded on demand via require() so the barrel never statically references the
// optional `react-day-picker` peer. Importing anything else from
// @usefragments/ui must not drag the calendar (or its transitive `date-fns`
// dependency) into a consumer's build graph. Mirrors the Chart/recharts pattern.

type DayPickerComponent = React.ComponentType<Record<string, unknown>>;
type RdpEnum = Record<string, string>;

let _DayPicker: DayPickerComponent | null = null;
let _UI: RdpEnum | null = null;
let _SelectionState: RdpEnum | null = null;
let _DayFlag: RdpEnum | null = null;
let _rdpLoaded = false;
let _rdpFailed = false;

function loadDayPickerDeps(): void {
  if (_rdpLoaded) return;
  _rdpLoaded = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rdp = require("react-day-picker");
    _DayPicker = rdp.DayPicker as DayPickerComponent;
    _UI = rdp.UI as RdpEnum;
    _SelectionState = rdp.SelectionState as RdpEnum;
    _DayFlag = rdp.DayFlag as RdpEnum;
  } catch {
    _rdpFailed = true;
  }
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

const DatePickerRoot = React.forwardRef<HTMLDivElement, DatePickerProps>(function DatePickerRoot(
  {
    children,
    label,
    helperText,
    error,
    className,
    mode = "single",
    selected: selectedProp,
    selectedRange: selectedRangeProp,
    onSelect,
    onChange: onChangeProp,
    onRangeSelect,
    numberOfMonths = 1,
    disabled = false,
    size: sizeProp,
    disabledDates,
    placeholder,
    locale,
    fixedWeeks = false,
    formatDate: formatDateProp,
    formatRange: formatRangeProp,
    open: openProp,
    onOpenChange,
    name,
  }: DatePickerProps,
  ref
) {
  const size = useResolvedControlSize(sizeProp);
  // Load deps eagerly so date formatters are available in the trigger
  const [internalSelected, setInternalSelected] = React.useState<Date | null>(selectedProp ?? null);
  const [internalRange, setInternalRange] = React.useState<DateRange | null>(
    selectedRangeProp ?? null
  );
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlledOpen = openProp !== undefined;
  const isOpen = isControlledOpen ? openProp : internalOpen;

  // Sync controlled selected
  React.useEffect(() => {
    if (selectedProp !== undefined) {
      setInternalSelected(selectedProp);
    }
  }, [selectedProp]);

  // Sync controlled range
  React.useEffect(() => {
    if (selectedRangeProp !== undefined) {
      setInternalRange(selectedRangeProp);
    }
  }, [selectedRangeProp]);

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlledOpen) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlledOpen, onOpenChange]
  );

  const resolvedOnSelect = onSelect ?? onChangeProp;

  const setSelected = React.useCallback(
    (date: Date | null) => {
      if (selectedProp === undefined) {
        setInternalSelected(date);
      }
      resolvedOnSelect?.(date);

      // Auto-close after single selection (controlled and uncontrolled).
      if (date) {
        setTimeout(() => {
          handleOpenChange(false);
        }, 150);
      }
    },
    [selectedProp, resolvedOnSelect, handleOpenChange]
  );

  const setSelectedRange = React.useCallback(
    (range: DateRange | null) => {
      if (selectedRangeProp === undefined) {
        setInternalRange(range);
      }
      onRangeSelect?.(range);

      // Range mode never auto-closes. The user closes manually via
      // click-outside, Escape, or clicking the trigger again. This
      // matches shadcn behavior and avoids premature close on first
      // click or preset selection.
    },
    [selectedRangeProp, onRangeSelect]
  );

  const defaultPlaceholder = mode === "range" ? "Select date range" : "Pick a date";

  const contextValue = React.useMemo<DatePickerContextValue>(
    () => ({
      mode,
      selected: selectedProp !== undefined ? selectedProp : internalSelected,
      selectedRange: selectedRangeProp !== undefined ? selectedRangeProp : internalRange,
      setSelected,
      setSelectedRange,
      numberOfMonths,
      disabled,
      disabledDates,
      placeholder: placeholder ?? defaultPlaceholder,
      locale,
      fixedWeeks,
      formatDate: formatDateProp ?? defaultFormatDate,
      formatRange: formatRangeProp ?? defaultFormatRange,
      isOpen,
      setIsOpen: handleOpenChange,
      isControlledOpen,
      size,
      name,
    }),
    [
      mode,
      selectedProp,
      internalSelected,
      selectedRangeProp,
      internalRange,
      setSelected,
      setSelectedRange,
      numberOfMonths,
      disabled,
      disabledDates,
      placeholder,
      defaultPlaceholder,
      locale,
      fixedWeeks,
      formatDateProp,
      formatRangeProp,
      isOpen,
      handleOpenChange,
      isControlledOpen,
      size,
      name,
    ]
  );

  const { labelId, helperId, errorId, hasError, errorMessage } = useFormFieldIds("datepicker", {
    label,
    helperText,
    error,
  });

  const wrapperClasses = [styles.wrapper, className].filter(Boolean).join(" ");
  const helperClasses = [styles.helper, hasError && styles.helperError].filter(Boolean).join(" ");

  return (
    <DatePickerContext.Provider value={contextValue}>
      <div ref={ref} className={wrapperClasses}>
        {label && (
          <span id={labelId} className={styles.label}>
            {label}
          </span>
        )}
        <BasePopover.Root open={isOpen} onOpenChange={handleOpenChange}>
          {children}
        </BasePopover.Root>
        {helperText && (
          <span id={helperId} className={helperClasses}>
            {helperText}
          </span>
        )}
        {errorMessage && (
          <span id={errorId} className={styles.errorMessage}>
            {errorMessage}
          </span>
        )}
      </div>
      {name && (
        <input
          type="hidden"
          name={name}
          value={
            mode === "single"
              ? formatDateForHiddenInput(contextValue.selected ?? undefined)
              : contextValue.selectedRange
                ? `${formatDateForHiddenInput(contextValue.selectedRange.from)},${formatDateForHiddenInput(contextValue.selectedRange.to)}`
                : ""
          }
        />
      )}
    </DatePickerContext.Provider>
  );
});

function DatePickerTrigger({
  children,
  placeholder,
  className,
  type = "button",
  ...htmlProps
}: DatePickerTriggerProps) {
  const ctx = useDatePickerContext();
  const placeholderText = placeholder ?? ctx.placeholder;

  const classes = [
    styles.trigger,
    ctx.size === "sm" && styles.triggerSm,
    ctx.size === "lg" && styles.triggerLg,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  let displayText: string | null = null;
  if (ctx.mode === "single" && ctx.selected) {
    displayText = ctx.formatDate(ctx.selected);
  } else if (ctx.mode === "range" && ctx.selectedRange?.from) {
    displayText = ctx.formatRange(ctx.selectedRange);
  }

  return (
    <BasePopover.Trigger {...htmlProps} type={type} className={classes} disabled={ctx.disabled}>
      {children ?? (
        <>
          <span className={styles.triggerIcon}>
            <CalendarIcon />
          </span>
          <span className={displayText ? styles.triggerValue : styles.triggerPlaceholder}>
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
  sideOffset = 4,
  align = "start",
  ...htmlProps
}: DatePickerContentProps) {
  const popupClasses = [styles.popup, className].filter(Boolean).join(" ");

  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        side="bottom"
        align={align}
        sideOffset={sideOffset}
        className={styles.positioner}
      >
        <BasePopover.Popup {...htmlProps} className={popupClasses}>
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
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

  loadDayPickerDeps();
  if (_rdpFailed || !_DayPicker || !_UI) {
    // react-day-picker is an optional peer: render nothing rather than crash
    // when a consumer mounts <DatePicker> without installing the calendar dep.
    return null;
  }
  const DayPicker = _DayPicker;
  const UI = _UI;

  const calendarClassNames = getCalendarClassNames();

  const calendarClasses = className
    ? { ...calendarClassNames, [UI.Root]: [styles.calendar, className].join(" ") }
    : calendarClassNames;

  if (ctx.mode === "range") {
    const rangeSelected = ctx.selectedRange
      ? { from: ctx.selectedRange.from ?? undefined, to: ctx.selectedRange.to ?? undefined }
      : undefined;

    return (
      <DayPicker
        mode="range"
        selected={rangeSelected}
        onSelect={(range: any) => {
          ctx.setSelectedRange(
            range ? { from: range.from ?? undefined, to: range.to ?? undefined } : null
          );
        }}
        numberOfMonths={monthCount}
        disabled={ctx.disabledDates}
        locale={ctx.locale}
        fixedWeeks={ctx.fixedWeeks}
        classNames={calendarClasses}
        components={components}
        showOutsideDays
      />
    );
  }

  return (
    <DayPicker
      mode="single"
      selected={ctx.selected ?? undefined}
      onSelect={(date: any) => {
        ctx.setSelected(date ?? null);
      }}
      numberOfMonths={monthCount}
      disabled={ctx.disabledDates}
      locale={ctx.locale}
      fixedWeeks={ctx.fixedWeeks}
      classNames={calendarClasses}
      components={components}
      showOutsideDays
    />
  );
}

function DatePickerPreset({
  children,
  date,
  range,
  className,
  onClick,
  ...htmlProps
}: DatePickerPresetProps) {
  const ctx = useDatePickerContext();
  const classes = [styles.preset, className].filter(Boolean).join(" ");

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (ctx.mode === "single" && date) {
        ctx.setSelected(date);
      } else if (ctx.mode === "range" && range) {
        ctx.setSelectedRange(range);
      }
    },
    [ctx, date, range, onClick]
  );

  return (
    <button type="button" {...htmlProps} className={classes} onClick={handleClick}>
      {children}
    </button>
  );
}

// ============================================
// Export compound component
// ============================================

export const DatePicker = Object.assign(DatePickerRoot, {
  Trigger: DatePickerTrigger,
  Content: DatePickerContent,
  Calendar: DatePickerCalendar,
  Preset: DatePickerPreset,
});

// Re-export individual components
export {
  DatePickerRoot,
  DatePickerTrigger,
  DatePickerContent,
  DatePickerCalendar,
  DatePickerPreset,
};
