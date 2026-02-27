'use client';

import * as React from 'react';
import { mergeAriaIds } from '../../utils/aria';
import styles from './Chart.module.scss';
import '../../styles/globals.scss';

// ============================================
// Types (self-owned — no external dependency for types)
// ============================================

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
    icon?: React.ComponentType<Record<string, unknown>>;
  }
>;

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactElement;
  /** Non-visual summary announced to assistive technology users */
  summary?: string;
  /** Optional accessible data table or textual fallback */
  dataTable?: React.ReactNode;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: readonly {
    name?: string;
    value?: number | string;
    dataKey?: string | number;
    color?: string;
    payload?: Record<string, unknown>;
  }[];
  label?: string;
  indicator?: 'dot' | 'line' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelFormatter?: (label: string, payload: ChartTooltipContentProps['payload']) => React.ReactNode;
  valueFormatter?: (value: number | string) => string;
}

export interface ChartLegendContentProps {
  payload?: readonly {
    value?: string;
    dataKey?: string | number;
    color?: string;
  }[];
}

// Internal-only type for recharts Legend props
type RechartsLegendProps = Record<string, unknown>;

// ============================================
// Lazy-loaded dependencies (recharts)
// ============================================

let _RechartsTooltip: React.ComponentType<Record<string, unknown>> | null = null;
let _RechartsLegend: React.ComponentType<Record<string, unknown>> | null = null;
let _chartLoaded = false;
let _chartFailed = false;

function loadChartDeps() {
  if (_chartLoaded) return;
  _chartLoaded = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rc = require('recharts');
    _RechartsTooltip = rc.Tooltip as React.ComponentType<Record<string, unknown>>;
    _RechartsLegend = rc.Legend as React.ComponentType<Record<string, unknown>>;
  } catch {
    _chartFailed = true;
  }
}


// ============================================
// Context
// ============================================

const ChartConfigContext = React.createContext<ChartConfig | null>(null);

export function useChartConfig() {
  const ctx = React.useContext(ChartConfigContext);
  if (!ctx) {
    throw new Error('useChartConfig must be used within a <ChartContainer>');
  }
  return ctx;
}

// ============================================
// ChartContainer
// ============================================

export function ChartContainer({
  config,
  children,
  className,
  style,
  summary,
  dataTable,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...htmlProps
}: ChartContainerProps) {
  const chartId = React.useId();
  const summaryId = summary ? `chart-summary-${chartId}` : undefined;
  const dataTableId = dataTable ? `chart-data-${chartId}` : undefined;

  // Build CSS custom properties from config (--chart-<key>)
  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    Object.entries(config).forEach(([key, val]) => {
      vars[`--chart-${key}`] = val.color;
    });
    return vars;
  }, [config]);

  const rootClasses = [styles.container, className].filter(Boolean).join(' ');

  // Inject sizing props into the chart child (recharts API).
  // Only pass `responsive` for custom component types to avoid leaking the
  // prop to intrinsic DOM nodes in test/demo usage.
  const chartChildProps: Record<string, unknown> = {
    width: '100%',
    height: '100%',
  };

  if (typeof children.type !== 'string') {
    chartChildProps.responsive = true;
  }

  const chartChild = React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    chartChildProps
  );

  return (
    <ChartConfigContext.Provider value={config}>
      <div
        {...htmlProps}
        className={rootClasses}
        style={{ ...cssVars, ...style }}
        role="img"
        aria-label={ariaLabel || 'Chart'}
        aria-describedby={mergeAriaIds(
          ariaDescribedBy,
          summaryId,
          dataTableId
        )}
      >
        {chartChild}
        {summaryId && (
          <span id={summaryId} className={styles.srOnly}>
            {summary}
          </span>
        )}
        {dataTableId && (
          <div id={dataTableId} className={styles.srOnly}>
            {dataTable}
          </div>
        )}
      </div>
    </ChartConfigContext.Provider>
  );
}

// ============================================
// ChartTooltipContent
// ============================================

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  labelFormatter,
  valueFormatter,
}: ChartTooltipContentProps) {
  const config = React.useContext(ChartConfigContext);

  if (!active || !payload?.length) return null;

  const formattedLabel = labelFormatter
    ? labelFormatter(String(label), payload)
    : label;

  return (
    <div className={styles.tooltip}>
      {!hideLabel && formattedLabel && (
        <div className={styles.tooltipLabel}>{formattedLabel}</div>
      )}
      <div className={styles.tooltipItems}>
        {payload.map((entry, i) => {
          const key = String(entry.dataKey ?? entry.name ?? i);
          const configEntry = config?.[key];
          const displayLabel = configEntry?.label ?? entry.name ?? key;
          const color = entry.color ?? configEntry?.color;
          const displayValue = valueFormatter
            ? valueFormatter(entry.value ?? 0)
            : String(entry.value ?? '');

          const indicatorClass = [
            styles.tooltipIndicator,
            indicator === 'line' && styles.tooltipIndicatorLine,
            indicator === 'dashed' && styles.tooltipIndicatorDashed,
          ].filter(Boolean).join(' ');

          return (
            <div key={key} className={styles.tooltipItem}>
              {!hideIndicator && (
                <span
                  className={indicatorClass}
                  style={{ backgroundColor: indicator === 'dashed' ? undefined : color, borderColor: color }}
                />
              )}
              <span className={styles.tooltipItemLabel}>{displayLabel}</span>
              <span className={styles.tooltipItemValue}>{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// ChartTooltip (thin wrapper)
// ============================================

type ChartTooltipProps = {
  indicator?: 'dot' | 'line' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelFormatter?: ChartTooltipContentProps['labelFormatter'];
  valueFormatter?: ChartTooltipContentProps['valueFormatter'];
  content?: React.ReactNode | ((tooltipProps: Record<string, unknown>) => React.ReactNode);
  [key: string]: unknown;
};

export function ChartTooltip({
  indicator,
  hideLabel,
  hideIndicator,
  labelFormatter,
  valueFormatter,
  content,
  ...props
}: ChartTooltipProps) {
  loadChartDeps();

  const defaultContent = React.useCallback(

    (tooltipProps: Record<string, unknown>) => (
      <ChartTooltipContent
        {...(tooltipProps as ChartTooltipContentProps)}
        indicator={indicator}
        hideLabel={hideLabel}
        hideIndicator={hideIndicator}
        labelFormatter={labelFormatter}
        valueFormatter={valueFormatter}
      />
    ),
    [indicator, hideLabel, hideIndicator, labelFormatter, valueFormatter],
  );

  if (_chartFailed || !_RechartsTooltip) {
    if (_chartFailed && process.env.NODE_ENV === 'development') {
      console.warn(
        '[@fragments-sdk/ui] Chart: recharts is not installed. ' +
        'Install it with: npm install recharts'
      );
    }
    return null;
  }

  const RechartsTooltipComponent = _RechartsTooltip;

  return (
    <RechartsTooltipComponent
      cursor={{ stroke: 'var(--fui-border)' }}
      content={content ?? defaultContent}
      {...props}
    />
  );
}

// ============================================
// ChartLegendContent
// ============================================

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  const config = React.useContext(ChartConfigContext);

  if (!payload?.length) return null;

  return (
    <div className={styles.legend}>
      {payload.map((entry) => {
        const key = String(entry.dataKey ?? entry.value ?? '');
        const configEntry = config?.[key];
        const label = configEntry?.label ?? entry.value ?? key;
        const color = entry.color ?? configEntry?.color;

        return (
          <div key={key} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: color }}
            />
            <span className={styles.legendLabel}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// ChartLegend (thin wrapper)
// ============================================

type ChartLegendProps = RechartsLegendProps & {
  content?: React.ReactNode | ((legendProps: Record<string, unknown>) => React.ReactNode);
};

export function ChartLegend({ content, ...props }: ChartLegendProps) {
  loadChartDeps();

  const defaultContent = (legendProps: Record<string, unknown>) => (
    <ChartLegendContent {...(legendProps as ChartLegendContentProps)} />
  );

  if (_chartFailed || !_RechartsLegend) {
    if (_chartFailed && process.env.NODE_ENV === 'development') {
      console.warn(
        '[@fragments-sdk/ui] Chart: recharts is not installed. ' +
        'Install it with: npm install recharts'
      );
    }
    return null;
  }

  const RechartsLegendComponent = _RechartsLegend;

  return (
    <RechartsLegendComponent
      content={content ?? defaultContent}
      {...props}
    />
  );
}

export const Chart = Object.assign(ChartContainer, {
  Root: ChartContainer,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
  Legend: ChartLegend,
  LegendContent: ChartLegendContent,
});
