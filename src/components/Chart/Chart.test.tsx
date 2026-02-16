import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  useChartConfig,
  type ChartConfig,
} from './index';

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => ({
  Tooltip: ({ content: _content, ...props }: any) => <div data-testid="recharts-tooltip" {...props} />,
  Legend: ({ content: _content, ...props }: any) => <div data-testid="recharts-legend" {...props} />,
}));

const config: ChartConfig = {
  revenue: { label: 'Revenue', color: '#3b82f6' },
  expenses: { label: 'Expenses', color: '#ef4444' },
};

describe('ChartContainer', () => {
  it('renders a container with role="img"', () => {
    render(
      <ChartContainer config={config}>
        <div>chart</div>
      </ChartContainer>
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('applies default aria-label "Chart"', () => {
    render(
      <ChartContainer config={config}>
        <div>chart</div>
      </ChartContainer>
    );
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Chart');
  });

  it('renders summary text for screen readers', () => {
    render(
      <ChartContainer config={config} summary="Revenue vs Expenses over time">
        <div>chart</div>
      </ChartContainer>
    );
    expect(screen.getByText('Revenue vs Expenses over time')).toBeInTheDocument();
  });

  it('provides config context via useChartConfig', () => {
    function Consumer() {
      const ctx = useChartConfig();
      return <span>{ctx.revenue.label}</span>;
    }
    render(
      <ChartContainer config={config}>
        <Consumer />
      </ChartContainer>
    );
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('throws when useChartConfig is used outside ChartContainer', () => {
    function Consumer() {
      useChartConfig();
      return null;
    }
    expect(() => render(<Consumer />)).toThrow('useChartConfig must be used within a <ChartContainer>');
  });
});

describe('ChartTooltipContent', () => {
  it('renders nothing when not active', () => {
    const { container } = render(
      <ChartTooltipContent active={false} payload={[]} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders payload items when active', () => {
    render(
      <ChartTooltipContent
        active
        payload={[{ name: 'revenue', value: 100, dataKey: 'revenue', color: '#3b82f6' }]}
        label="Jan"
      />
    );
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});

describe('ChartLegendContent', () => {
  it('renders legend items from payload', () => {
    render(
      <ChartLegendContent
        payload={[
          { value: 'revenue', dataKey: 'revenue', color: '#3b82f6' },
          { value: 'expenses', dataKey: 'expenses', color: '#ef4444' },
        ]}
      />
    );
    expect(screen.getByText('revenue')).toBeInTheDocument();
    expect(screen.getByText('expenses')).toBeInTheDocument();
  });

  it('renders nothing with empty payload', () => {
    const { container } = render(<ChartLegendContent payload={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('Chart accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <ChartContainer config={config} aria-label="Revenue chart" summary="Shows revenue data">
        <div>chart content</div>
      </ChartContainer>
    );
    await expectNoA11yViolations(container);
  });
});
