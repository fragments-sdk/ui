'use client';

import * as React from 'react';
import {
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from 'recharts';
import type { Props as RechartsLegendProps } from 'recharts/types/component/Legend';
import styles from './Chart.module.scss';
import '../../styles/globals.scss';

// ============================================
// Types
// ============================================

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
    icon?: React.ComponentType;
  }
>;

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactElement;
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
  ...htmlProps
}: ChartContainerProps) {
  // Build CSS custom properties from config (--chart-<key>)
  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    Object.entries(config).forEach(([key, val]) => {
      vars[`--chart-${key}`] = val.color;
    });
    return vars;
  }, [config]);

  const rootClasses = [styles.container, className].filter(Boolean).join(' ');

  // Inject responsive + width/height into the chart child (recharts v3 API)
  const chartChild = React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
    responsive: true,
    width: '100%',
    height: '100%',
  });

  return (
    <ChartConfigContext.Provider value={config}>
      <div
        {...htmlProps}
        className={rootClasses}
        style={{ ...cssVars, ...style }}
      >
        {chartChild}
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

type ChartTooltipProps = Omit<React.ComponentProps<typeof RechartsTooltip>, 'content'> & {
  indicator?: 'dot' | 'line' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelFormatter?: ChartTooltipContentProps['labelFormatter'];
  valueFormatter?: ChartTooltipContentProps['valueFormatter'];
  content?: React.ComponentProps<typeof RechartsTooltip>['content'];
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
  const defaultContent = React.useCallback(
     
    (tooltipProps: any) => (
      <ChartTooltipContent
        {...tooltipProps}
        indicator={indicator}
        hideLabel={hideLabel}
        hideIndicator={hideIndicator}
        labelFormatter={labelFormatter}
        valueFormatter={valueFormatter}
      />
    ),
    [indicator, hideLabel, hideIndicator, labelFormatter, valueFormatter],
  );

  return (
    <RechartsTooltip
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

type ChartLegendProps = Omit<RechartsLegendProps, 'content'> & {
  content?: RechartsLegendProps['content'];
};

export function ChartLegend({ content, ...props }: ChartLegendProps) {
   
  const defaultContent = (legendProps: any) => <ChartLegendContent {...legendProps} />;

  return (
    <RechartsLegend
      content={content ?? defaultContent}
      {...props}
    />
  );
}
