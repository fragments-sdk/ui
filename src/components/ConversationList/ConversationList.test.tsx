import { describe, it, expect, vi } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { compiledModuleRules } from "../../test/compiled-css";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Message } from "../Message";
import { ConversationList } from "./index";

const cssText = compiledModuleRules("src/components/ConversationList/ConversationList.module.scss")
  .map((rule) => rule.cssText)
  .join("\n");

function setScroll(
  element: HTMLElement,
  { scrollTop, scrollHeight, clientHeight }: Record<string, number>
) {
  Object.defineProperty(element, "scrollHeight", { configurable: true, value: scrollHeight });
  Object.defineProperty(element, "clientHeight", { configurable: true, value: clientHeight });
  element.scrollTop = scrollTop;
}

describe("ConversationList", () => {
  it("is a named, focusable, polite log", () => {
    render(
      <ConversationList label="Chat with the assistant">
        <Message from="user">
          <Message.Content>Hello</Message.Content>
        </Message>
      </ConversationList>
    );
    const log = screen.getByRole("log", { name: "Chat with the assistant" });
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders the empty state when there are no messages", () => {
    render(<ConversationList emptyState={<p>No messages yet</p>}>{[]}</ConversationList>);
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });

  it("reads events and day breaks as text in the log", () => {
    const date = new Date();
    render(
      <ConversationList>
        <ConversationList.Event date={date} />
        <ConversationList.Event>Switched to a faster model</ConversationList.Event>
      </ConversationList>
    );
    expect(screen.getByText("Today").tagName).toBe("TIME");
    expect(screen.getByText("Switched to a faster model")).toBeInTheDocument();
    expect(screen.queryByRole("separator")).toBeNull();
  });

  it("announces loading history once as a status", () => {
    render(
      <ConversationList history="loading">
        <Message from="user">
          <Message.Content>Hi</Message.Content>
        </Message>
      </ConversationList>
    );
    const statuses = screen.getAllByRole("status");
    expect(statuses).toHaveLength(1);
    expect(statuses[0]).toHaveTextContent("Loading history…");
  });

  it("offers Retry when history fails", () => {
    const onRetryHistory = vi.fn();
    render(
      <ConversationList history="error" onRetryHistory={onRetryHistory}>
        <Message from="user">
          <Message.Content>Hi</Message.Content>
        </Message>
      </ConversationList>
    );
    expect(screen.getByText("Couldn't load earlier messages.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetryHistory).toHaveBeenCalledOnce();
  });

  it("composes onScroll and asks for history at the top", () => {
    const onScroll = vi.fn();
    const onScrollTop = vi.fn();
    render(
      <ConversationList onScroll={onScroll} onScrollTop={onScrollTop}>
        <Message from="user">
          <Message.Content>Hi</Message.Content>
        </Message>
      </ConversationList>
    );
    const log = screen.getByRole("log");
    fireEvent.scroll(log);
    expect(onScroll).toHaveBeenCalledOnce();
    expect(onScrollTop).toHaveBeenCalled();
  });

  it("offers a jump to the latest when the reader scrolls up", () => {
    render(
      <ConversationList>
        <Message from="user">
          <Message.Content>Hi</Message.Content>
        </Message>
      </ConversationList>
    );
    const log = screen.getByRole("log");
    setScroll(log, { scrollTop: 0, scrollHeight: 1000, clientHeight: 200 });
    // First scroll after a layout change only settles; the second is the reader.
    fireEvent.scroll(log);
    setScroll(log, { scrollTop: 100, scrollHeight: 1000, clientHeight: 200 });
    fireEvent.scroll(log);
    const jump = screen.getByRole("button", { name: "Jump to latest" });
    act(() => {
      fireEvent.click(jump);
    });
    expect(screen.queryByRole("button", { name: "Jump to latest" })).toBeNull();
  });

  it("anchors the log itself and rings focus inside its edge", () => {
    expect(cssText).toContain("overflow-anchor: none");
    expect(cssText).toMatch(/\.?_?scroller[^{]*:focus-visible/);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ConversationList>
        <ConversationList.Event date={new Date()} />
        <Message from="user">
          <Message.Content>Hello</Message.Content>
        </Message>
        <Message from="assistant">
          <Message.Content>Hi, how can I help?</Message.Content>
        </Message>
      </ConversationList>
    );
    await expectNoA11yViolations(container);
  });
});
