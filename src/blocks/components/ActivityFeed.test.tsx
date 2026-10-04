import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, userEvent } from "../../test/utils";
import { ActivityFeed, type ActivityFeedItem } from "./ActivityFeed";

const items: ActivityFeedItem[] = Array.from({ length: 7 }, (_, index) => ({
  id: String(index),
  user: `Person ${index}`,
  action: "shared a document",
  time: `${index + 1} minutes ago`,
  dateTime: `2026-10-03T09:0${index}`,
}));

describe("ActivityFeed", () => {
  it("titles the card in sentence case by default", () => {
    render(<ActivityFeed items={[]} />);
    expect(screen.getByText("Recent activity")).toBeInTheDocument();
  });

  it("renders rows as a list with machine-readable times", () => {
    render(<ActivityFeed items={items.slice(0, 2)} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    const time = screen.getByText("1 minutes ago");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("datetime", "2026-10-03T09:00");
  });

  it("shows five rows, then Show more and Show less", async () => {
    const user = userEvent.setup();
    render(<ActivityFeed items={items} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);

    await user.click(screen.getByRole("button", { name: "Show 2 more" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(7);

    await user.click(screen.getByRole("button", { name: "Show less" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("offers no Show more when everything fits", () => {
    render(<ActivityFeed items={items.slice(0, 5)} />);
    expect(screen.queryByRole("button", { name: /Show/ })).not.toBeInTheDocument();
  });

  it("says so when there is no activity", () => {
    render(<ActivityFeed items={[]} />);
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
  });

  it("marks the loading list busy", () => {
    render(<ActivityFeed items={[]} loading />);
    expect(screen.getByRole("list", { name: "Loading activity" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });

  it("shows an error with Retry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ActivityFeed items={items} error="Activity didn’t load." onRetry={onRetry} />);
    expect(screen.getByText("Activity didn’t load.")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("forwards its ref to the root", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ActivityFeed ref={ref} items={[]} data-testid="feed" />);
    expect(ref.current).toBe(screen.getByTestId("feed"));
  });
});
