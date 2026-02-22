'use client';

import * as React from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import styles from './DatePicker.module.scss';
// Import globals to ensure CSS variables are defined
import '../../styles/globals.scss';

// ============================================
// Types (self-owned — no external dependency for types)
// ============================================

export type DateRange = { from: Date | undefined; to?: Date | undefined };
export type Matcher = Date | DateRange | ((date: Date) => boolean) | Date[];
type Locale = { [key: string]: unknown };

export interface DatePickerProps {
  children: React.ReactNode;
  /** Selection mode */
  mode?: 'single' | 'range';
  /** Controlled date (single mode) */
  selected?: Date | null;
  /** Controlled range (range mode) */
  selectedRange?: DateRange | null;
  /** Single selection callback */
  onSelect?: (date: Date | null) => void;
  /** Range selection callback */
  onRangeSelect?: (range: DateRange | null) => void;
  /** Number of months displayed side-by-side */
  numberOfMonths?: number;
  /** Disable the picker */
  disabled?: boolean;
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
  align?: 'start' | 'center' | 'end';
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
// Lazy-loaded dependencies (react-day-picker + date-fns)
// ============================================

let _DayPicker: any = null;
let _dpUI: any = null;
let _SelectionState: any = null;
let _DayFlag: any = null;
let _formatDate: ((date: Date, fmt: string) => string) | null = null;
let _dpLoaded = false;
let _dpFailed = false;

function loadDatePickerDeps() {
  if (_dpLoaded) return;
  _dpLoaded = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rdp = require('react-day-picker');
    _DayPicker = rdp.DayPicker;
    _dpUI = rdp.UI;
    _SelectionState = rdp.SelectionState;
    _DayFlag = rdp.DayFlag;
  } catch {
    _dpFailed = true;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _formatDate = require('date-fns').format;
  } catch {
    _dpFailed = true;
  }
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
  mode: 'single' | 'range';
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
  name?: string;
}

const DatePickerContext = React.createContext<DatePickerContextValue | null>(null);

function useDatePickerContext() {
  const context = React.useContext(DatePickerContext);
  if (!context) {
    throw new Error('DatePicker compound components must be used within <DatePicker>');
  }
  return context;
}

// ============================================
// Default formatters
// ============================================

function defaultFormatDate(date: Date): string {
  if (_formatDate) return _formatDate(date, 'PPP');
  return date.toLocaleDateString();
}

function defaultFormatRange(range: DateRange): string {
  if (!range.from) return '';
  if (_formatDate) {
    if (!range.to) return _formatDate(range.from, 'LLL dd, y');
    return `${_formatDate(range.from, 'LLL dd, y')} - ${_formatDate(range.to, 'LLL dd, y')}`;
  }
  if (!range.to) return range.from.toLocaleDateString();
  return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
}

function formatDateForHiddenInput(date?: Date): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================
// ClassNames mapping (built lazily)
// ============================================

function getCalendarClassNames() {
  if (!_dpUI || !_SelectionState || !_DayFlag) return {};
  return {
    [_dpUI.Root]: styles.calendar,
    [_dpUI.Months]: styles.months,
    [_dpUI.Month]: styles.month,
    [_dpUI.MonthCaption]: styles.monthCaption,
    [_dpUI.CaptionLabel]: styles.captionLabel,
    [_dpUI.Nav]: styles.nav,
    [_dpUI.PreviousMonthButton]: styles.navButton,
    [_dpUI.NextMonthButton]: styles.navButton,
    [_dpUI.MonthGrid]: styles.monthGrid,
    [_dpUI.Weekdays]: styles.weekdays,
    [_dpUI.Weekday]: styles.weekday,
    [_dpUI.Weeks]: styles.weeks,
    [_dpUI.Week]: styles.week,
    [_dpUI.Day]: styles.day,
    [_dpUI.DayButton]: styles.dayButton,
    [_dpUI.Chevron]: styles.chevron,
    [_SelectionState.selected]: styles.selected,
    [_SelectionState.range_start]: styles.rangeStart,
    [_SelectionState.range_middle]: styles.rangeMiddle,
    [_SelectionState.range_end]: styles.rangeEnd,
    [_DayFlag.today]: styles.today,
    [_DayFlag.outside]: styles.outside,
    [_DayFlag.disabled]: styles.disabled,
    [_DayFlag.focused]: styles.focused,
  };
}

// ============================================
// Components
// ============================================

function DatePickerRoot({
  children,
  mode = 'single',
  selected: selectedProp,
  selectedRange: selectedRangeProp,
  onSelect,
  onRangeSelect,
  numberOfMonths = 1,
  disabled = false,
  disabledDates,
  placeholder,
  locale,
  fixedWeeks = false,
  formatDate: formatDateProp,
  formatRange: formatRangeProp,
  open: openProp,
  onOpenChange,
  name,
}: DatePickerProps) {
  // Load deps eagerly so date formatters are available in the trigger
  loadDatePickerDeps();
  const [internalSelected, setInternalSelected] = React.useState<Date | null>(
    selectedProp ?? null
  );
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

  const setSelected = React.useCallback(
    (date: Date | null) => {
      if (selectedProp === undefined) {
        setInternalSelected(date);
      }
      onSelect?.(date);

      // Auto-close after single selection (controlled and uncontrolled).
      if (date) {
        setTimeout(() => {
          handleOpenChange(false);
        }, 150);
      }
    },
    [selectedProp, onSelect, handleOpenChange]
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

  const defaultPlaceholder = mode === 'range' ? 'Select date range' : 'Pick a date';

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
      name,
    ]
  );

  return (
    <DatePickerContext.Provider value={contextValue}>
      <BasePopover.Root
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        {children}
      </BasePopover.Root>
      {name && (
        <input
          type="hidden"
          name={name}
          value={
              mode === 'single'
              ? formatDateForHiddenInput(contextValue.selected ?? undefined)
              : contextValue.selectedRange
                ? `${formatDateForHiddenInput(contextValue.selectedRange.from)},${formatDateForHiddenInput(contextValue.selectedRange.to)}`
                : ''
          }
        />
      )}
    </DatePickerContext.Provider>
  );
}

function DatePickerTrigger({
  children,
  placeholder,
  className,
  type = 'button',
  ...htmlProps
}: DatePickerTriggerProps) {
  const ctx = useDatePickerContext();
  const placeholderText = placeholder ?? ctx.placeholder;

  const classes = [styles.trigger, className].filter(Boolean).join(' ');

  let displayText: string | null = null;
  if (ctx.mode === 'single' && ctx.selected) {
    displayText = ctx.formatDate(ctx.selected);
  } else if (ctx.mode === 'range' && ctx.selectedRange?.from) {
    displayText = ctx.formatRange(ctx.selectedRange);
  }

  return (
    <BasePopover.Trigger
      {...htmlProps}
      type={type}
      className={classes}
      disabled={ctx.disabled}
    >
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
  align = 'start',
  ...htmlProps
}: DatePickerContentProps) {
  const popupClasses = [styles.popup, className].filter(Boolean).join(' ');

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

function DatePickerCalendar({ numberOfMonths: numberOfMonthsProp, className }: DatePickerCalendarProps) {
  loadDatePickerDeps();

  const ctx = useDatePickerContext();
  const monthCount = numberOfMonthsProp ?? ctx.numberOfMonths;

  const components = React.useMemo(
    () => ({
      Chevron: (props: { orientation?: string }) =>
        props.orientation === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />,
    }),
    []
  );

  if (_dpFailed || !_DayPicker) {
    if (_dpFailed && process.env.NODE_ENV === 'development') {
      console.warn(
        '[@fragments-sdk/ui] DatePicker: react-day-picker and date-fns are not installed. ' +
        'Install them with: npm install react-day-picker date-fns'
      );
    }
    return null;
  }

  const calendarClassNames = getCalendarClassNames();

  const calendarClasses = className
    ? { ...calendarClassNames, [_dpUI.Root]: [styles.calendar, className].join(' ') }
    : calendarClassNames;

  const DayPickerComponent = _DayPicker;

  if (ctx.mode === 'range') {
    const rangeSelected = ctx.selectedRange
      ? { from: ctx.selectedRange.from ?? undefined, to: ctx.selectedRange.to ?? undefined }
      : undefined;

    return (
      <DayPickerComponent
        mode="range"
        selected={rangeSelected}
        onSelect={(range: any) => {
          ctx.setSelectedRange(range ? { from: range.from ?? undefined, to: range.to ?? undefined } : null);
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
    <DayPickerComponent
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
  const classes = [styles.preset, className].filter(Boolean).join(' ');

  const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (ctx.mode === 'single' && date) {
      ctx.setSelected(date);
    } else if (ctx.mode === 'range' && range) {
      ctx.setSelectedRange(range);
    }
  }, [ctx, date, range, onClick]);

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
