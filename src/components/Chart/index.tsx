"use client";

import * as React from "react";
import { ChartLine, WarningCircle } from "@phosphor-icons/react";
import { mergeAriaIds } from "../../utils/aria";
import { isDevelopmentBuild } from "../../utils/env";
import { Button } from "../Button";
import { EmptyState } from "../EmptyState";
import { Skeleton } from "../Skeleton";
import styles from "./Chart.module.scss";

// ============================================
// Types (self-owned — no external dependency for types)
// ============================================

/** Index into the six `--fui-chart-N` series tokens. */
export type ChartSeries = 1 | 2 | 3 | 4 | 5 | 6;

export interface ChartConfigEntry {
  /** Name read in the legend, the tooltip and by screen readers. */
  label: string;
  /** Which series colour (`--fui-chart-1` … `--fui-chart-6`) draws this key. */
  series: ChartSeries;
  /** Optional glyph shown in the legend in place of the swatch. */
  icon?: React.ComponentType<Record<string, unknown>>;
}

export type ChartConfig = Record<string, ChartConfigEntry>;

export interface ChartContainerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  config: ChartConfig;
  children: React.ReactElement;
  /** Non-visual summary announced to assistive technology users */
  summary?: string;
  /** Optional accessible data table or textual fallback */
  dataTable?: React.ReactNode;
  /** Draw a skeleton at the chart's height while the data loads. */
  loading?: boolean;
  /**
   * The empty state's title, shown when the chart child's `data` is an empty array.
   * @default "No data to show"
   */
  empty?: React.ReactNode;
  /** The empty state's copy under the title: why there is nothing yet. */
  emptyDescription?: React.ReactNode;
  /** The empty state's one way forward (a Button). */
  emptyAction?: React.ReactNode;
  /** When set, replaces the chart with an error box holding this message (the data failed to load). */
  error?: React.ReactNode;
  /** Retry the failed load. Shows a retry button in the error box. */
  onRetry?: () => void;
  /** Label for the retry button. @default "Retry" */
  retryLabel?: string;
}

type ChartPayloadEntry = {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
  color?: string;
  fill?: string;
  stroke?: string;
  strokeDasharray?: string | number;
  type?: string;
  payload?: Record<string, unknown>;
};

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: readonly ChartPayloadEntry[];
  label?: string;
  hideLabel?: boolean;
  labelFormatter?: (label: string, payload: ChartTooltipContentProps["payload"]) => React.ReactNode;
  valueFormatter?: (value: number | string) => string;
}

export interface ChartLegendContentProps {
  payload?: readonly (ChartPayloadEntry & { value?: string })[];
}

// Internal-only type for recharts Legend props
type RechartsLegendProps = Record<string, unknown>;

// ============================================
// Series colour and marker
// ============================================

function seriesColor(series: ChartSeries): string {
  return `var(--fui-chart-${series})`;
}

const BLANK_FILLS = new Set(["none", "transparent", "#fff", "#ffffff", "white"]);

/**
 * The swatch follows the series: a dashed stroke reads as a dashed marker, a
 * stroke-only series (a line) as a line, anything filled (bar, area, slice)
 * as a dot.
 */
function markerFor(entry: ChartPayloadEntry): "dot" | "line" | "dashed" {
  const dash =
    entry.strokeDasharray ??
    (entry.payload?.strokeDasharray as string | number | undefined) ??
    undefined;
  if (dash && String(dash) !== "0") return "dashed";
  if (entry.type === "line" || entry.type === "plainline") return "line";
  const fill = entry.fill?.toLowerCase();
  if (entry.stroke && (!fill || BLANK_FILLS.has(fill))) return "line";
  return "dot";
}

// ============================================
// Lazy-loaded dependencies (recharts)
// ============================================

let _RechartsTooltip: React.ComponentType<Record<string, unknown>> | null = null;
let _RechartsLegend: React.ComponentType<Record<string, unknown>> | null = null;
let _chartLoadPromise: Promise<void> | null = null;
let _chartFailed = false;

// Resolved with import() rather than require(): browser ESM bundles have no
// `require`, so the synchronous shape disabled recharts even when installed.
function loadChartDeps(): Promise<void> {
  if (!_chartLoadPromise) {
    _chartLoadPromise = (async () => {
      try {
        const rc = await import("recharts");
        _RechartsTooltip = rc.Tooltip as unknown as React.ComponentType<Record<string, unknown>>;
        _RechartsLegend = rc.Legend as unknown as React.ComponentType<Record<string, unknown>>;
      } catch {
        _chartFailed = true;
        if (isDevelopmentBuild()) {
          console.warn(
            "[@usefragments/ui] Chart: recharts is not installed. " +
              "Install it with: npm install recharts"
          );
        }
      }
    })();
  }
  return _chartLoadPromise;
}

type ChartDepsState = "pending" | "ready" | "failed";

function readDepsState(): ChartDepsState {
  if (_RechartsTooltip) return "ready";
  return _chartFailed ? "failed" : "pending";
}

/** Kick off the lazy recharts load on mount and re-render once it settles. */
function useChartDeps(): ChartDepsState {
  const [, rerender] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (readDepsState() !== "pending") return;
    let active = true;
    void loadChartDeps().then(() => {
      if (active) rerender();
    });
    return () => {
      active = false;
    };
  }, []);
  return readDepsState();
}

// ============================================
// Context
// ============================================

const ChartConfigContext = React.createContext<ChartConfig | null>(null);

export function useChartConfig() {
  const ctx = React.useContext(ChartConfigContext);
  if (!ctx) {
    throw new Error("useChartConfig must be used within a <ChartContainer>");
  }
  return ctx;
}

function entryColor(config: ChartConfig | null, key: string, entry: ChartPayloadEntry) {
  const configEntry = config?.[key];
  return configEntry ? seriesColor(configEntry.series) : entry.color;
}

// ============================================
// ChartContainer
// ============================================

function hasNoData(child: React.ReactElement): boolean {
  const data = (child.props as { data?: unknown }).data;
  return Array.isArray(data) && data.length === 0;
}

export function ChartContainer({
  config,
  children,
  className,
  style,
  summary,
  dataTable,
  loading = false,
  empty,
  emptyDescription,
  emptyAction,
  error,
  onRetry,
  retryLabel = "Retry",
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  ...htmlProps
}: ChartContainerProps) {
  const chartId = React.useId();
  const deps = useChartDeps();
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  // Recharts only lays a chart out once it knows a pixel box. Percentage
  // sizing leaves the first paint blank until something else happens to
  // resize the window, so the container measures its own frame and hands the
  // chart real numbers — re-measured whenever the frame changes.
  const [frame, setFrame] = React.useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    const element = frameRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      setFrame((current) =>
        current && current.width === width && current.height === height
          ? current
          : { width, height }
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const label = ariaLabel || "Chart";
  const rootClasses = [styles.container, className].filter(Boolean).join(" ");

  // One state at a time, most urgent first: the caller's error, then a
  // missing recharts, then loading, then no data, then the chart itself.
  const state: "error" | "unavailable" | "loading" | "empty" | "ready" = error
    ? "error"
    : deps === "failed"
      ? "unavailable"
      : loading
        ? "loading"
        : hasNoData(children)
          ? "empty"
          : "ready";

  const summaryId = summary ? `chart-summary-${chartId}` : undefined;
  const dataTableId = dataTable ? `chart-data-${chartId}` : undefined;

  let body: React.ReactNode;
  if (state === "ready") {
    // Inject sizing props into the chart child (recharts API).
    // Only pass `responsive` for custom component types to avoid leaking the
    // prop to intrinsic DOM nodes in test/demo usage.
    const measured = frame !== null && frame.width > 0 && frame.height > 0;
    const chartChildProps: Record<string, unknown> = measured
      ? { width: frame.width, height: frame.height }
      : { width: "100%", height: "100%" };

    if (!measured && typeof children.type !== "string") {
      chartChildProps.responsive = true;
    }

    body = (
      <>
        {React.cloneElement(
          children as React.ReactElement<Record<string, unknown>>,
          chartChildProps
        )}
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
      </>
    );
  } else if (state === "loading") {
    body = <Skeleton fill />;
  } else if (state === "unavailable" && dataTable) {
    body = <div className={styles.fallbackTable}>{dataTable}</div>;
  } else if (state === "error") {
    // A failed load is the errbox every data surface shows: the danger glyph,
    // the words, and one way out.
    body = (
      <div className={styles.errbox} role="alert">
        <span className={styles.errboxIcon} aria-hidden="true">
          <WarningCircle weight="fill" />
        </span>
        <div className={styles.errboxWords}>{error}</div>
        {onRetry ? (
          <div className={styles.errboxActions}>
            <Button variant="soft" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          </div>
        ) : null}
      </div>
    );
  } else {
    const unavailable = state === "unavailable";
    const description = unavailable ? summary : emptyDescription;
    body = (
      <EmptyState size="sm">
        <EmptyState.Icon aria-hidden="true">
          <ChartLine />
        </EmptyState.Icon>
        <EmptyState.Title as="p">
          {unavailable ? "Chart unavailable" : (empty ?? "No data to show")}
        </EmptyState.Title>
        {description && <EmptyState.Description>{description}</EmptyState.Description>}
        {!unavailable && emptyAction && <EmptyState.Actions>{emptyAction}</EmptyState.Actions>}
      </EmptyState>
    );
  }

  const drawn = state === "ready";

  // The frame element stays the same across states so the resize observer
  // keeps measuring it when loading gives way to the chart.
  return (
    <ChartConfigContext.Provider value={config}>
      <div
        {...htmlProps}
        ref={frameRef}
        className={[rootClasses, !drawn && styles.state].filter(Boolean).join(" ")}
        style={style}
        role={drawn || state === "loading" ? "img" : "group"}
        aria-label={label}
        aria-busy={state === "loading" || undefined}
        aria-describedby={
          drawn ? mergeAriaIds(ariaDescribedBy, summaryId, dataTableId) : ariaDescribedBy
        }
        data-state={state}
      >
        {body}
      </div>
    </ChartConfigContext.Provider>
  );
}

// ============================================
// ChartTooltipContent
// ============================================

const MARKER_CLASS = {
  dot: undefined,
  line: styles.markerLine,
  dashed: styles.markerDashed,
} as const;

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  labelFormatter,
  valueFormatter,
}: ChartTooltipContentProps) {
  const config = React.useContext(ChartConfigContext);

  if (!active || !payload?.length) return null;

  const formattedLabel = labelFormatter ? labelFormatter(String(label), payload) : label;
  // One series needs no key: the swatch only maps colour to name.
  const showMarker = payload.length > 1;

  return (
    <div className={styles.tooltip}>
      {!hideLabel && formattedLabel && <div className={styles.tooltipLabel}>{formattedLabel}</div>}
      <div className={styles.tooltipItems}>
        {payload.map((entry, i) => {
          const key = String(entry.dataKey ?? entry.name ?? i);
          const displayLabel = config?.[key]?.label ?? entry.name ?? key;
          const color = entryColor(config, key, entry);
          const marker = markerFor(entry);
          const displayValue = valueFormatter
            ? valueFormatter(entry.value ?? 0)
            : String(entry.value ?? "");

          return (
            <div key={key} className={styles.tooltipItem}>
              {showMarker && (
                <span
                  className={[styles.marker, MARKER_CLASS[marker]].filter(Boolean).join(" ")}
                  data-marker={marker}
                  style={{ "--_fui-chart-marker-color": color } as React.CSSProperties}
                  aria-hidden="true"
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
  hideLabel?: boolean;
  labelFormatter?: ChartTooltipContentProps["labelFormatter"];
  valueFormatter?: ChartTooltipContentProps["valueFormatter"];
  content?: React.ReactNode | ((tooltipProps: Record<string, unknown>) => React.ReactNode);
  [key: string]: unknown;
};

export function ChartTooltip({
  hideLabel,
  labelFormatter,
  valueFormatter,
  content,
  ...props
}: ChartTooltipProps) {
  const deps = useChartDeps();

  const defaultContent = React.useCallback(
    (tooltipProps: Record<string, unknown>) => (
      <ChartTooltipContent
        {...(tooltipProps as ChartTooltipContentProps)}
        hideLabel={hideLabel}
        labelFormatter={labelFormatter}
        valueFormatter={valueFormatter}
      />
    ),
    [hideLabel, labelFormatter, valueFormatter]
  );

  // Nothing until recharts resolves; the container shows the fallback if it never does.
  if (deps !== "ready" || !_RechartsTooltip) {
    return null;
  }

  const RechartsTooltipComponent = _RechartsTooltip;

  return (
    <RechartsTooltipComponent
      cursor={{ stroke: "var(--fui-border-strong)" }}
      isAnimationActive={false}
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
        const key = String(entry.dataKey ?? entry.value ?? "");
        const configEntry = config?.[key];
        const label = configEntry?.label ?? entry.value ?? key;
        const color = entryColor(config, key, entry);
        const marker = markerFor(entry);
        const Glyph = configEntry?.icon;
        const swatchStyle = { "--_fui-chart-marker-color": color } as React.CSSProperties;

        return (
          <div key={key} className={styles.legendItem}>
            {Glyph ? (
              <span className={styles.legendGlyph} style={swatchStyle} aria-hidden="true">
                <Glyph />
              </span>
            ) : (
              <span
                className={[styles.marker, MARKER_CLASS[marker]].filter(Boolean).join(" ")}
                data-marker={marker}
                style={swatchStyle}
                aria-hidden="true"
              />
            )}
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
  const deps = useChartDeps();

  const defaultContent = (legendProps: Record<string, unknown>) => (
    <ChartLegendContent {...(legendProps as ChartLegendContentProps)} />
  );

  if (deps !== "ready" || !_RechartsLegend) {
    return null;
  }

  const RechartsLegendComponent = _RechartsLegend;

  return <RechartsLegendComponent content={content ?? defaultContent} {...props} />;
}

export const Chart = Object.assign(ChartContainer, {
  Root: ChartContainer,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
  Legend: ChartLegend,
  LegendContent: ChartLegendContent,
  /** Start resolving recharts before first render (optional). */
  preload: loadChartDeps,
});
