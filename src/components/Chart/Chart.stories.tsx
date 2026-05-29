import type { Meta, StoryObj } from '@storybook/react';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartLegend } from '.';

/**
 * ChartContainer is a composable wrapper for recharts charts with theme-aware
 * tooltips, legends, and color integration. Pass a ChartConfig mapping data
 * keys to labels and colors, with a recharts chart element as the child.
 */
const meta = {
  title: 'Display/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Composable chart wrapper for recharts with theme-aware tooltips, legends, and color integration.',
      },
    },
  },
  argTypes: {
    summary: {
      control: 'text',
      description: 'Non-visual summary announced to assistive technology users',
    },
  },
  args: {
    config: {
      revenue: { label: 'Revenue', color: 'var(--fui-color-accent)' },
    },
    children: <BarChart data={[]} />,
  },
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

const monthlyData = [
  { month: 'Jan', revenue: 4200, users: 1200 },
  { month: 'Feb', revenue: 5100, users: 1500 },
  { month: 'Mar', revenue: 4800, users: 1400 },
  { month: 'Apr', revenue: 6300, users: 1900 },
  { month: 'May', revenue: 7100, users: 2200 },
  { month: 'Jun', revenue: 6800, users: 2100 },
];

const deviceData = [
  { device: 'Desktop', sessions: 4300 },
  { device: 'Mobile', sessions: 3100 },
  { device: 'Tablet', sessions: 900 },
];

export const Line_: Story = {
  name: 'Line Chart',
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
};

export const Bar_: Story = {
  name: 'Bar Chart',
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
};

export const WithSummary: Story = {
  render: () => (
    <div style={{ width: '100%', height: 300 }}>
      <ChartContainer
        config={{
          sessions: { label: 'Sessions', color: 'var(--fui-color-accent)' },
        }}
        summary="Sessions by device: Desktop 4300, Mobile 3100, Tablet 900."
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
};
