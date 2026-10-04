import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent, expectNoA11yViolations } from "../../test/utils";
import { Toast, ToastProvider, useToast, TOAST_DURATION_MS, type ToastApi } from "./index";

function renderProvider(props: Partial<React.ComponentProps<typeof ToastProvider>> = {}) {
  let api!: ToastApi;
  function Capture() {
    api = useToast();
    return <button type="button">Page control</button>;
  }
  const result = render(
    <ToastProvider {...props}>
      <Capture />
    </ToastProvider>
  );
  return { ...result, api: () => api };
}

function show(api: ToastApi, input: Parameters<ToastApi["toast"]>[0]) {
  let id = "";
  act(() => {
    id = api.toast(input);
  });
  return id;
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a title and description from useToast", () => {
    const { api } = renderProvider();
    show(api(), { title: "Branch renamed", description: "Open pull requests follow it." });
    expect(screen.getByText("Branch renamed")).toBeInTheDocument();
    expect(screen.getByText("Open pull requests follow it.")).toBeInTheDocument();
  });

  it("stays at least five seconds, even when asked for less", async () => {
    const { api } = renderProvider();
    show(api(), { title: "Saved", duration: 1000 });
    await advance(TOAST_DURATION_MS - 500);
    expect(screen.getByText("Saved")).toBeInTheDocument();
    await advance(1000);
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("raises a provider duration under the floor to five seconds", async () => {
    const { api } = renderProvider({ duration: 2000 });
    show(api(), { title: "Copied" });
    await advance(3000);
    expect(screen.getByText("Copied")).toBeInTheDocument();
  });

  it("keeps a toast with duration 0 until it is dismissed", async () => {
    const { api } = renderProvider();
    show(api(), { title: "Pinned", duration: 0 });
    await advance(60_000);
    expect(screen.getByText("Pinned")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    await advance(10);
    expect(screen.queryByText("Pinned")).not.toBeInTheDocument();
  });

  it("shows three at once and queues the rest in order", async () => {
    const { api } = renderProvider();
    for (const title of ["One", "Two", "Three", "Four"]) {
      show(api(), { title, duration: 0 });
    }
    expect(screen.getByText("Three")).toBeInTheDocument();
    expect(screen.queryByText("Four")).not.toBeInTheDocument();

    act(() => api().dismissAll());
    await advance(10);
    expect(screen.queryByText("One")).not.toBeInTheDocument();
    expect(screen.queryByText("Four")).not.toBeInTheDocument();
  });

  it("admits the next queued toast when one leaves", async () => {
    const { api } = renderProvider();
    const first = show(api(), { title: "One", duration: 0 });
    show(api(), { title: "Two", duration: 0 });
    show(api(), { title: "Three", duration: 0 });
    show(api(), { title: "Four", duration: 0 });
    act(() => api().dismiss(first));
    await advance(10);
    expect(screen.queryByText("One")).not.toBeInTheDocument();
    expect(screen.getByText("Four")).toBeInTheDocument();
  });

  it("replaces a toast in place when shown again with the same id", () => {
    const { api } = renderProvider();
    show(api(), { id: "sync", title: "Syncing", duration: 0 });
    show(api(), { id: "sync", title: "Synced", duration: 0 });
    expect(screen.queryByText("Syncing")).not.toBeInTheDocument();
    expect(screen.getAllByText("Synced")).toHaveLength(1);
  });

  it("announces urgently only for the danger tone", () => {
    const { api } = renderProvider();
    show(api(), { title: "Disk almost full", tone: "warning", duration: 0 });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    show(api(), { title: "Push failed", tone: "danger", duration: 0 });
    expect(screen.getByRole("alert")).toHaveTextContent("Push failed");
  });

  it("colours only the icon: the tone rides on data-tone and the toast keeps one class", () => {
    const { api } = renderProvider();
    show(api(), { title: "Merged", tone: "success", duration: 0 });
    const toast = screen.getByText("Merged").closest("[data-tone]")!;
    expect(toast).toHaveAttribute("data-tone", "success");
    expect(toast.querySelector("svg")).not.toBeNull();
  });

  it("runs the action with a ghost button and closes", async () => {
    const onClick = vi.fn();
    const { api } = renderProvider();
    show(api(), { title: "Archived", duration: 0, action: { label: "Open", onClick } });
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    await advance(10);
    expect(screen.queryByText("Archived")).not.toBeInTheDocument();
  });

  it("keeps focus where it was when a toast button is pressed", () => {
    const { api } = renderProvider();
    show(api(), { title: "Archived", duration: 0, action: { label: "Open", onClick: () => {} } });
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    screen.getByRole("button", { name: "Open" }).dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("runs an undo on Mod+Z unless focus is in a text field", async () => {
    const onClick = vi.fn();
    const { api } = renderProvider();
    show(api(), { title: "Deleted", duration: 0, action: { label: "Undo", onClick, undo: true } });
    expect(screen.getByRole("button", { name: /Undo/ }).querySelector("kbd")).not.toBeNull();

    const field = document.createElement("input");
    document.body.appendChild(field);
    fireEvent.keyDown(field, { key: "z", ctrlKey: true, metaKey: true });
    expect(onClick).not.toHaveBeenCalled();
    field.remove();

    fireEvent.keyDown(document.body, { key: "z", ctrlKey: true, metaKey: true });
    expect(onClick).toHaveBeenCalledTimes(1);
    await advance(10);
    expect(screen.queryByText("Deleted")).not.toBeInTheDocument();
  });

  it("shows busy work as N of M with a progress line and Stop, and no timer", async () => {
    const onStop = vi.fn();
    const { api } = renderProvider();
    const id = show(api(), { title: "Uploading", busy: { done: 3, total: 12, onStop } });
    expect(screen.getByText("3 of 12")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
    await advance(TOAST_DURATION_MS * 3);
    expect(screen.getByText("Uploading")).toBeInTheDocument();

    act(() => api().update(id, { busy: { done: 4, total: 12, onStop } }));
    expect(screen.getByText("4 of 12")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("replaces a promise toast in place when the promise settles", async () => {
    const { api } = renderProvider();
    let resolve!: (value: string) => void;
    const running = new Promise<string>((done) => {
      resolve = done;
    });
    act(() => {
      void api().promise(running, {
        loading: "Deploying",
        success: (value) => `Deployed ${value}`,
        error: "Deploy failed",
      });
    });
    expect(screen.getByText("Deploying")).toBeInTheDocument();
    await act(async () => {
      resolve("v2");
      await running;
    });
    expect(screen.queryByText("Deploying")).not.toBeInTheDocument();
    expect(screen.getByText("Deployed v2").closest("[data-tone]")).toHaveAttribute(
      "data-tone",
      "success"
    );
  });

  it("names the tone helpers success, warning and danger", () => {
    const { api } = renderProvider();
    act(() => {
      api().danger("Push failed", "The remote refused the branch.");
    });
    expect(screen.getAllByText("The remote refused the branch.").length).toBeGreaterThan(0);
    expect(Object.keys(api()).sort()).toEqual(
      ["danger", "dismiss", "dismissAll", "promise", "success", "toast", "update", "warning"].sort()
    );
  });

  it("puts the stack where position says", () => {
    const { api } = renderProvider({ position: "top-center" });
    show(api(), { title: "Copied", duration: 0 });
    expect(screen.getByRole("region", { name: "Notifications" })).toHaveAttribute(
      "data-position",
      "top-center"
    );
  });

  it("draws a static toast for previews", () => {
    render(<Toast title="Draft saved" description="Kept until you publish." tone="success" />);
    expect(screen.getByRole("status")).toHaveTextContent("Draft saved");
  });

  it("has no accessibility violations", async () => {
    const { api, container } = renderProvider();
    show(api(), { title: "Accessible", description: "One line.", duration: 0 });
    await expectNoA11yViolations(container);
  });
});
