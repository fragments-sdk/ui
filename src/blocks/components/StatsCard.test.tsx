import * as React from "react";
import { describe, expect, it } from "vitest";
import { CurrencyDollar } from "@phosphor-icons/react";
import { render, screen } from "../../test/utils";
import { StatsCard, type StatsCardChangeTone } from "./StatsCard";

describe("StatsCard", () => {
  it("renders the label, value and change", () => {
    render(<StatsCard title="Total revenue" value="$45,231" change="+12.5%" />);
    expect(screen.getByText("Total revenue")).toBeInTheDocument();
    expect(screen.getByText("$45,231").tagName).toBe("P");
    expect(screen.getByText("+12.5%")).toBeInTheDocument();
  });

  it("shows an em dash when there is no value", () => {
    render(<StatsCard title="Active users" value={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("keeps the change neutral unless the caller says otherwise", () => {
    const { container, rerender } = render(<StatsCard title="Findings" value={3} change="+1" />);
    expect(container.querySelector(".toneSuccess, .toneDanger")).toBeNull();
    rerender(<StatsCard title="Findings" value={3} change="+1" changeTone="success" />);
    expect(container.querySelector(".toneSuccess")).not.toBeNull();
  });

  it("draws the icon decorative, in a tile", () => {
    const { container } = render(<StatsCard title="Revenue" value={1} icon={CurrencyDollar} />);
    const tile = container.querySelector("[aria-hidden='true'] svg");
    expect(tile).not.toBeNull();
  });

  it("swaps the figures for skeletons while loading", () => {
    render(<StatsCard title="Revenue" value="$1" loading />);
    expect(screen.queryByText("$1")).not.toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("cuts the warning change tone", () => {
    const cut = () => {
      // @ts-expect-error warning is cut in v4: a change is good, bad or neutral
      const tone: StatsCardChangeTone = "warning";
      return tone;
    };
    expect(cut).toBeTypeOf("function");
  });

  it("forwards its ref to the root", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<StatsCard ref={ref} title="Revenue" value={1} data-testid="stat" />);
    expect(ref.current).toBe(screen.getByTestId("stat"));
  });
});
