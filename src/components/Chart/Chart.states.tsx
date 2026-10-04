/**
 * State fixtures for Chart, rendered by `pnpm run test:states`.
 *
 * @family:theme-reach
 */
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "../Button";
import { ChartContainer, ChartLegendContent, ChartTooltipContent, type ChartConfig } from ".";

const FRAME = { inlineSize: 360, blockSize: 200 } as const;

const config = {
  desktop: { label: "Desktop", series: 1 },
  mobile: { label: "Mobile", series: 2 },
} satisfies ChartConfig;

const data = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
];

export function populated() {
  return (
    <div style={FRAME}>
      <ChartContainer config={config} aria-label="Sessions by month">
        <BarChart data={data} width={360} height={200}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <Bar dataKey="desktop" fill="var(--fui-chart-1)" isAnimationActive={false} />
          <Bar dataKey="mobile" fill="var(--fui-chart-2)" isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export function empty() {
  return (
    <div style={FRAME}>
      <ChartContainer
        config={config}
        aria-label="Sessions by month"
        empty="No sessions yet"
        emptyDescription="Sessions show here once the site gets its first visit."
        emptyAction={<Button size="sm">Share the site</Button>}
      >
        <BarChart data={[]} />
      </ChartContainer>
    </div>
  );
}

export function loading() {
  return (
    <div style={FRAME}>
      <ChartContainer config={config} loading aria-label="Sessions by month">
        <BarChart data={data} />
      </ChartContainer>
    </div>
  );
}

export function error() {
  return (
    <div style={FRAME}>
      <ChartContainer
        config={config}
        error="Couldn't load sessions. Check the connection, then retry."
        onRetry={() => {}}
        aria-label="Sessions"
      >
        <BarChart data={data} />
      </ChartContainer>
    </div>
  );
}

// A legend with more keys than fit on one line wraps; the tooltip keeps long
// labels and wide values on one row each.
export function overflow() {
  const many = Object.fromEntries(
    Array.from({ length: 6 }, (_, i) => [
      `k${i}`,
      { label: `Region ${i + 1} — long label`, series: (i + 1) as 1 },
    ])
  ) as ChartConfig;
  return (
    <div style={{ inlineSize: 280, display: "grid", gap: 16 }}>
      <ChartContainer config={many} aria-label="Regions">
        <div>
          <ChartLegendContent
            payload={Object.keys(many).map((key) => ({ value: key, dataKey: key }))}
          />
        </div>
      </ChartContainer>
      <ChartContainer config={many} aria-label="Regions tooltip">
        <div>
          <ChartTooltipContent
            active
            label="Week of 12 October"
            payload={Object.keys(many)
              .slice(0, 3)
              .map((key, i) => ({ dataKey: key, value: 1234567 * (i + 1), fill: "x" }))}
          />
        </div>
      </ChartContainer>
    </div>
  );
}

// The hover read-out: label, then one row per series with its swatch shape
// following the series (dot for bars, line for lines, dashed for a target).
export function lifecycleTooltip() {
  return (
    <ChartContainer config={{ ...config, target: { label: "Target", series: 6 } }}>
      <div>
        <ChartTooltipContent
          active
          label="Feb"
          payload={[
            { dataKey: "desktop", value: 305, fill: "x" },
            { dataKey: "mobile", value: 200, stroke: "x", fill: "#fff" },
            { dataKey: "target", value: 250, stroke: "x", strokeDasharray: "4 4" },
          ]}
        />
      </div>
    </ChartContainer>
  );
}
