import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartLegend, type ChartConfig } from ".";
import { Button } from "../Button";

/**
 * ChartContainer wraps a recharts chart. Each data key maps to a label and a
 * series index; the index picks one of the six `--fui-chart-N` colours, so
 * charts never spend a status hue.
 */
const meta = {
  title: "Display/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Composable chart wrapper for recharts: series colours, a raised tooltip, a legend, and loading, empty and error states in the chart's own box.",
      },
    },
  },
  argTypes: {
    summary: {
      control: "text",
      description: "Non-visual summary announced to assistive technology users",
    },
    loading: { control: "boolean" },
  },
  args: {
    config: { revenue: { label: "Revenue", series: 1 } },
    children: <BarChart data={[]} />,
  },
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

const monthlyData = [
  { month: "Jan", revenue: 4200, users: 1200, target: 4500 },
  { month: "Feb", revenue: 5100, users: 1500, target: 4800 },
  { month: "Mar", revenue: 4800, users: 1400, target: 5100 },
  { month: "Apr", revenue: 6300, users: 1900, target: 5400 },
  { month: "May", revenue: 7100, users: 2200, target: 5700 },
  { month: "Jun", revenue: 6800, users: 2100, target: 6000 },
];

const deviceData = [
  { device: "Desktop", sessions: 4300 },
  { device: "Mobile", sessions: 3100 },
  { device: "Tablet", sessions: 900 },
];

const lineConfig = {
  revenue: { label: "Revenue", series: 1 },
  users: { label: "Users", series: 2 },
  target: { label: "Target", series: 6 },
} satisfies ChartConfig;

const frame = { width: "100%", height: 300 };

export const Line_: Story = {
  name: "Line Chart",
  render: () => (
    <div style={frame}>
      <ChartContainer config={lineConfig} aria-label="Revenue, users and target by month">
        <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip />
          <ChartLegend />
          <Line dataKey="revenue" stroke="var(--fui-chart-1)" strokeWidth={2} dot={false} />
          <Line dataKey="users" stroke="var(--fui-chart-2)" strokeWidth={2} dot={false} />
          <Line
            dataKey="target"
            stroke="var(--fui-chart-6)"
            strokeDasharray="4 4"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  ),
};

export const Bar_: Story = {
  name: "Bar Chart",
  render: () => (
    <div style={frame}>
      <ChartContainer
        config={{ sessions: { label: "Sessions", series: 1 } }}
        aria-label="Sessions by device"
        summary="Sessions by device: Desktop 4300, Mobile 3100, Tablet 900."
      >
        <BarChart data={deviceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="device" />
          <YAxis />
          <ChartTooltip />
          <Bar dataKey="sessions" fill="var(--fui-chart-1)" />
        </BarChart>
      </ChartContainer>
    </div>
  ),
};

export const Area_: Story = {
  name: "Area Chart",
  render: () => (
    <div style={frame}>
      <ChartContainer
        config={{ revenue: { label: "Revenue", series: 3 } }}
        aria-label="Revenue by month"
      >
        <AreaChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip />
          <Area
            dataKey="revenue"
            stroke="var(--fui-chart-3)"
            fill="var(--fui-chart-3)"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  ),
};

/** Six series, one per token, so the palette reads side by side. */
export const SeriesPalette: Story = {
  render: () => {
    const keys = ["one", "two", "three", "four", "five", "six"] as const;
    const config = Object.fromEntries(
      keys.map((key, index) => [key, { label: `Series ${index + 1}`, series: index + 1 }])
    ) as ChartConfig;
    const row = Object.fromEntries(keys.map((key, index) => [key, 6 - index]));
    return (
      <div style={frame}>
        <ChartContainer config={config} aria-label="The six series colours">
          <BarChart data={[{ name: "Series", ...row }]}>
            <XAxis dataKey="name" />
            <ChartTooltip />
            <ChartLegend />
            {keys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={`var(--fui-chart-${index + 1})`} />
            ))}
          </BarChart>
        </ChartContainer>
      </div>
    );
  },
};

export const Loading: Story = {
  render: () => (
    <div style={frame}>
      <ChartContainer config={lineConfig} loading aria-label="Revenue by month">
        <LineChart data={monthlyData} />
      </ChartContainer>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={frame}>
      <ChartContainer
        config={lineConfig}
        empty="No revenue in this range"
        emptyDescription="Pick a wider range, or wait for the first invoice to settle."
        emptyAction={<Button size="sm">Show all time</Button>}
        aria-label="Revenue"
      >
        <LineChart data={[]} />
      </ChartContainer>
    </div>
  ),
};

export const ErrorState: Story = {
  name: "Error",
  render: () => (
    <div style={frame}>
      <ChartContainer
        config={lineConfig}
        error="Couldn't load revenue. Check the connection, then retry."
        onRetry={() => {}}
        aria-label="Revenue"
      >
        <LineChart data={monthlyData} />
      </ChartContainer>
    </div>
  ),
};
