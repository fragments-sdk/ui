import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { render, screen, userEvent, expectNoA11yViolations } from "../../test/utils";
import { Button } from "../Button";
import {
  Chart,
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  useChartConfig,
  type ChartConfig,
} from "./index";

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock("recharts", () => ({
  Tooltip: ({ content: _content, ...props }: any) => (
    <div data-testid="recharts-tooltip" {...props} />
  ),
  Legend: ({ content: _content, ...props }: any) => (
    <div data-testid="recharts-legend" {...props} />
  ),
}));

const config: ChartConfig = {
  revenue: { label: "Revenue", series: 1 },
  expenses: { label: "Expenses", series: 2 },
};

function FakeChart(_props: { data?: unknown[] }) {
  return <div>chart</div>;
}

describe("ChartContainer", () => {
  it("exposes the canonical compound component", () => {
    expect(Chart.Root).toBe(ChartContainer);
    expect(Chart.Tooltip).toBeDefined();
    expect(Chart.Legend).toBeDefined();
  });

  it('renders a container with role="img"', () => {
    render(
      <ChartContainer config={config}>
        <div>chart</div>
      </ChartContainer>
    );
    expect(screen.getByRole("img")).toHaveAttribute("data-state", "ready");
  });

  it('applies default aria-label "Chart"', () => {
    render(
      <ChartContainer config={config}>
        <div>chart</div>
      </ChartContainer>
    );
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Chart");
  });

  it("writes no per-key colour properties on the frame", () => {
    render(
      <ChartContainer config={config}>
        <div>chart</div>
      </ChartContainer>
    );
    expect(screen.getByRole("img").getAttribute("style") ?? "").not.toContain("--chart-");
  });

  it("renders summary text for screen readers", () => {
    render(
      <ChartContainer config={config} summary="Revenue vs Expenses over time">
        <div>chart</div>
      </ChartContainer>
    );
    expect(screen.getByText("Revenue vs Expenses over time")).toBeInTheDocument();
  });

  it("provides config context via useChartConfig", () => {
    function Consumer() {
      const ctx = useChartConfig();
      return <span>{ctx.revenue.label}</span>;
    }
    render(
      <ChartContainer config={config}>
        <Consumer />
      </ChartContainer>
    );
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("throws when useChartConfig is used outside ChartContainer", () => {
    function Consumer() {
      useChartConfig();
      return null;
    }
    expect(() => render(<Consumer />)).toThrow(
      "useChartConfig must be used within a <ChartContainer>"
    );
  });

  it("draws a busy skeleton while loading", () => {
    render(
      <ChartContainer config={config} loading aria-label="Revenue">
        <FakeChart data={[{ revenue: 1 }]} />
      </ChartContainer>
    );
    const frame = screen.getByRole("img", { name: "Revenue" });
    expect(frame).toHaveAttribute("aria-busy", "true");
    expect(frame).toHaveAttribute("data-state", "loading");
    expect(screen.queryByText("chart")).not.toBeInTheDocument();
  });

  it("shows the empty state when the chart has no data", () => {
    render(
      <ChartContainer config={config} aria-label="Revenue">
        <FakeChart data={[]} />
      </ChartContainer>
    );
    expect(screen.getByRole("group", { name: "Revenue" })).toHaveAttribute("data-state", "empty");
    expect(screen.getByText("No data to show")).toBeInTheDocument();
  });

  it("takes custom empty copy", () => {
    render(
      <ChartContainer config={config} empty="No deploys this week">
        <FakeChart data={[]} />
      </ChartContainer>
    );
    expect(screen.getByText("No deploys this week")).toBeInTheDocument();
  });

  it("replaces the chart with the error message", () => {
    render(
      <ChartContainer config={config} error="Couldn't load revenue" loading>
        <FakeChart data={[{ revenue: 1 }]} />
      </ChartContainer>
    );
    expect(screen.getByText("Couldn't load revenue")).toBeInTheDocument();
    expect(screen.getByRole("group")).toHaveAttribute("data-state", "error");
  });

  it("shows a failed load as the errbox: an alert with a retry", async () => {
    const onRetry = vi.fn();
    render(
      <ChartContainer config={config} error="Couldn't load revenue" onRetry={onRetry}>
        <FakeChart data={[{ revenue: 1 }]} />
      </ChartContainer>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load revenue");
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("draws no retry when there is nothing to retry", () => {
    render(
      <ChartContainer config={config} error="Couldn't load revenue">
        <FakeChart data={[{ revenue: 1 }]} />
      </ChartContainer>
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("gives the empty state its glyph, copy and one action", () => {
    const { container } = render(
      <ChartContainer
        config={config}
        empty="No deploys this week"
        emptyDescription="Deploys show here once a pipeline runs."
        emptyAction={<Button size="sm">Run a pipeline</Button>}
      >
        <FakeChart data={[]} />
      </ChartContainer>
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText("Deploys show here once a pipeline runs.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run a pipeline" })).toBeInTheDocument();
  });

  it("cuts the free colour and indicator props from the types", () => {
    const cut = () => [
      // @ts-expect-error v4: config colour strings merged into `series`
      <ChartContainer key="a" config={{ a: { label: "A", color: "red" } }}>
        <div />
      </ChartContainer>,
      // @ts-expect-error v4: the marker follows the series
      <ChartTooltipContent key="b" indicator="line" />,
      // @ts-expect-error v4: hidden automatically for one series
      <ChartTooltipContent key="c" hideIndicator />,
    ];
    expect(cut).toBeTypeOf("function");
  });
});

describe("ChartTooltipContent", () => {
  it("renders nothing when not active", () => {
    const { container } = render(<ChartTooltipContent active={false} payload={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders payload items when active", () => {
    render(
      <ChartTooltipContent
        active
        payload={[{ name: "revenue", value: 100, dataKey: "revenue" }]}
        label="Jan"
      />
    );
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("drops the swatch for a single series", () => {
    const { container } = render(
      <ChartTooltipContent active payload={[{ value: 100, dataKey: "revenue" }]} label="Jan" />
    );
    expect(container.querySelector("[data-marker]")).toBeNull();
  });

  it("reads series colours and infers the marker from the series", () => {
    const { container } = render(
      <ChartContainer config={config}>
        <div>
          <ChartTooltipContent
            active
            label="Jan"
            payload={[
              { value: 1, dataKey: "revenue", stroke: "x", fill: "#fff" },
              { value: 2, dataKey: "expenses", stroke: "x", strokeDasharray: "4 4" },
              { value: 3, dataKey: "other", fill: "x", color: "var(--fui-chart-3)" },
            ]}
          />
        </div>
      </ChartContainer>
    );
    const markers = Array.from(container.querySelectorAll<HTMLElement>("[data-marker]"));
    expect(markers.map((m) => m.dataset.marker)).toEqual(["line", "dashed", "dot"]);
    expect(markers[0].style.getPropertyValue("--_fui-chart-marker-color")).toBe(
      "var(--fui-chart-1)"
    );
    expect(markers[2].style.getPropertyValue("--_fui-chart-marker-color")).toBe(
      "var(--fui-chart-3)"
    );
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });
});

describe("ChartLegendContent", () => {
  it("renders legend items from payload", () => {
    render(
      <ChartLegendContent
        payload={[
          { value: "revenue", dataKey: "revenue" },
          { value: "expenses", dataKey: "expenses" },
        ]}
      />
    );
    expect(screen.getByText("revenue")).toBeInTheDocument();
    expect(screen.getByText("expenses")).toBeInTheDocument();
  });

  it("renders a config icon in place of the swatch", () => {
    function Glyph() {
      return <svg data-testid="glyph" />;
    }
    render(
      <ChartContainer config={{ revenue: { label: "Revenue", series: 4, icon: Glyph } }}>
        <div>
          <ChartLegendContent payload={[{ value: "revenue", dataKey: "revenue" }]} />
        </div>
      </ChartContainer>
    );
    expect(screen.getByTestId("glyph")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("renders nothing with empty payload", () => {
    const { container } = render(<ChartLegendContent payload={[]} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("Chart accessibility", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(
      <ChartContainer config={config} aria-label="Revenue chart" summary="Shows revenue data">
        <div>chart content</div>
      </ChartContainer>
    );
    await expectNoA11yViolations(container);
  });

  it("has no violations in the empty state", async () => {
    const { container } = render(
      <ChartContainer config={config} aria-label="Revenue chart">
        <FakeChart data={[]} />
      </ChartContainer>
    );
    await expectNoA11yViolations(container);
  });
});
