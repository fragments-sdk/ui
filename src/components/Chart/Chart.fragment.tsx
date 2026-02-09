import React from 'react';
import { defineSegment } from '@fragments/core';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartLegend } from '.';

// Sample data
const monthlyData = [
  { month: 'Jan', revenue: 4000, users: 2400 },
  { month: 'Feb', revenue: 3000, users: 1398 },
  { month: 'Mar', revenue: 5000, users: 3800 },
  { month: 'Apr', revenue: 4500, users: 3200 },
  { month: 'May', revenue: 6000, users: 4300 },
  { month: 'Jun', revenue: 5500, users: 4100 },
];

const deviceData = [
  { device: 'Desktop', sessions: 4500 },
  { device: 'Mobile', sessions: 3200 },
  { device: 'Tablet', sessions: 1800 },
  { device: 'Other', sessions: 500 },
];

const browserData = [
  { name: 'Chrome', value: 55, color: 'var(--fui-color-accent)' },
  { name: 'Firefox', value: 20, color: 'var(--fui-color-info)' },
  { name: 'Safari', value: 15, color: 'var(--fui-color-success)' },
  { name: 'Edge', value: 10, color: 'var(--fui-color-warning)' },
];

export default defineSegment({
  component: ChartContainer,

  meta: {
    name: 'Chart',
    description: 'Composable chart wrapper for recharts with theme-aware tooltips, legends, and color integration.',
    category: 'display',
    status: 'stable',
    tags: ['chart', 'graph', 'data-visualization', 'recharts'],
    since: '0.3.0',
  },

  usage: {
    when: [
      'Displaying data trends over time',
      'Comparing categorical data',
      'Showing distribution or composition',
      'Dashboard data visualizations',
    ],
    whenNot: [
      'Simple numeric values (use Text or Badge)',
      'Progress toward a goal (use Progress)',
      'Tabular data without visualization (use Table)',
    ],
    guidelines: [
      'Use ChartContainer to wrap recharts chart components',
      'Define a ChartConfig to map data keys to labels and colors',
      'Use FUI CSS variables for colors so charts adapt to theme changes',
      'Use ChartTooltip and ChartLegend for consistent themed overlays',
    ],
    accessibility: [
      'Charts include recharts accessibilityLayer by default',
      'Provide meaningful labels in ChartConfig for screen readers',
      'Consider providing a data table alternative for complex charts',
    ],
  },

  props: {
    config: {
      type: 'object',
      description: 'ChartConfig mapping data keys to labels and colors',
    },
    children: {
      type: 'element',
      description: 'A recharts chart component (LineChart, BarChart, etc.)',
    },
    summary: {
      type: 'string',
      description: 'Non-visual summary announced to assistive technology users',
    },
    dataTable: {
      type: 'node',
      description: 'Optional accessible data table or textual fallback',
    },
  },

  relations: [
    { component: 'Card', relationship: 'parent', note: 'Charts are typically placed inside Cards' },
    { component: 'Progress', relationship: 'alternative', note: 'Use Progress for single-value completion' },
    { component: 'Table', relationship: 'sibling', note: 'Combine with Table for full data views' },
  ],

  contract: {
    propsSummary: [
      'config: ChartConfig - maps data keys to labels and theme colors',
      'children: ReactElement - recharts chart component',
    ],
    scenarioTags: [
      'display.chart',
      'data.visualization',
      'dashboard.analytics',
    ],
    a11yRules: ['A11Y_CHART_LABEL'],
  },

  variants: [
    {
      name: 'Line Chart',
      description: 'Multi-series line chart showing trends over time',
      render: () => (
        <div style={{ width: '100%', height: 300 }}>
          <ChartContainer
            config={{
              revenue: { label: 'Revenue', color: 'var(--fui-color-accent)' },
              users: { label: 'Users', color: 'var(--fui-color-info)' },
            }}
          >
            <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip />
              <ChartLegend />
              <Line type="monotone" dataKey="revenue" stroke="var(--fui-color-accent)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="users" stroke="var(--fui-color-info)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </div>
      ),
    },
    {
      name: 'Bar Chart',
      description: 'Categorical bar chart comparing device sessions',
      render: () => (
        <div style={{ width: '100%', height: 300 }}>
          <ChartContainer
            config={{
              sessions: { label: 'Sessions', color: 'var(--fui-color-accent)' },
            }}
          >
            <BarChart data={deviceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <ChartTooltip />
              <Bar dataKey="sessions" fill="var(--fui-color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      ),
    },
    {
      name: 'Area Chart',
      description: 'Filled area chart showing revenue trend',
      render: () => (
        <div style={{ width: '100%', height: 300 }}>
          <ChartContainer
            config={{
              revenue: { label: 'Revenue', color: 'var(--fui-color-accent)' },
            }}
          >
            <AreaChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip />
              <Area type="monotone" dataKey="revenue" stroke="var(--fui-color-accent)" fill="var(--fui-color-accent)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </div>
      ),
    },
    {
      name: 'Pie Chart',
      description: 'Donut chart showing browser share distribution',
      render: () => (
        <div style={{ width: '100%', height: 300 }}>
          <ChartContainer
            config={{
              Chrome: { label: 'Chrome', color: 'var(--fui-color-accent)' },
              Firefox: { label: 'Firefox', color: 'var(--fui-color-info)' },
              Safari: { label: 'Safari', color: 'var(--fui-color-success)' },
              Edge: { label: 'Edge', color: 'var(--fui-color-warning)' },
            }}
          >
            <PieChart>
              <ChartTooltip />
              <ChartLegend />
              <Pie
                data={browserData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                strokeWidth={2}
              >
                {browserData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      ),
    },
  ],
});
