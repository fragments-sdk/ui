import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { fireEvent } from "@testing-library/react";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Message } from "../Message";
import { ConversationList } from "./index";

const conversationListStyles = readFileSync(
  resolve(process.cwd(), "src/components/ConversationList/ConversationList.module.scss"),
  "utf8"
);

// jsdom does not implement scrollTo
beforeAll(() => {
  Element.prototype.scrollTo = vi.fn();
});

describe("ConversationList", () => {
  it("keeps conversation chrome on neutral surfaces and the body foreground", () => {
    expect(conversationListStyles).toContain("color: var(--fui-text-primary, $fui-text-primary);");
    expect(conversationListStyles).toContain(
      "background-color: var(--fui-bg-secondary, $fui-bg-secondary);"
    );
    expect(conversationListStyles).not.toContain("--fui-color-accent");
  });

  it("renders children as messages", () => {
    render(
      <ConversationList>
        <div>Message 1</div>
        <div>Message 2</div>
      </ConversationList>
    );
    expect(screen.getByText("Message 1")).toBeInTheDocument();
    expect(screen.getByText("Message 2")).toBeInTheDocument();
  });

  it("renders empty state when no children", () => {
    render(<ConversationList emptyState={<div>No messages yet</div>}>{null}</ConversationList>);
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });

  it('renders DateSeparator with role="separator"', () => {
    const date = new Date(2025, 0, 15);
    render(
      <ConversationList>
        <ConversationList.DateSeparator date={date} />
        <div>Message</div>
      </ConversationList>
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("renders DateSeparator with custom format function", () => {
    const date = new Date(2025, 0, 15);
    render(
      <ConversationList>
        <ConversationList.DateSeparator date={date} format={() => "Custom Date"} />
      </ConversationList>
    );
    expect(screen.getByText("Custom Date")).toBeInTheDocument();
  });

  it("renders TypingIndicator with accessible label", () => {
    const { container } = render(
      <ConversationList>
        <ConversationList.TypingIndicator name="Claude" />
      </ConversationList>
    );
    expect(screen.getByRole("status", { name: "Claude is typing" })).toBeInTheDocument();
    expect(container.querySelector(".typingDot")).not.toBeInTheDocument();
  });

  it("hides message and typing-indicator avatars without retaining their outer inset", async () => {
    const { container } = render(
      <ConversationList showAvatars={false}>
        <Message role="assistant">
          <Message.Content>Avatarless response</Message.Content>
        </Message>
        <ConversationList.TypingIndicator
          name="Claude"
          avatar={<span data-testid="typing-avatar">C</span>}
        />
      </ConversationList>
    );

    expect(container.querySelector('[data-role="assistant"] svg')).not.toBeInTheDocument();
    expect(container.querySelector('[data-role="assistant"]')).toHaveClass("withoutAvatar");
    expect(screen.queryByTestId("typing-avatar")).not.toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Claude is typing" })).toHaveClass("withoutAvatar");
    await expectNoA11yViolations(container);
  });

  it("shows loading history spinner when loadingHistory is true", () => {
    render(
      <ConversationList loadingHistory>
        <div>Message</div>
      </ConversationList>
    );
    expect(screen.getByText("Loading history...")).toBeInTheDocument();
  });

  it("composes root onScroll and passes event to onScrollTop", () => {
    const onScroll = vi.fn();
    const onScrollTop = vi.fn();
    const { container } = render(
      <ConversationList onScroll={onScroll} onScrollTop={onScrollTop}>
        <div>Message</div>
      </ConversationList>
    );

    const root = container.firstElementChild as HTMLDivElement;
    Object.defineProperty(root, "scrollTop", { value: 0, configurable: true });
    Object.defineProperty(root, "scrollHeight", { value: 1000, configurable: true });
    Object.defineProperty(root, "clientHeight", { value: 500, configurable: true });

    fireEvent.scroll(root);
    expect(onScroll).toHaveBeenCalled();
    expect(onScrollTop).toHaveBeenCalled();
    expect(onScrollTop.mock.calls[0][0]).toBeDefined();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ConversationList>
        <div>Message 1</div>
        <div>Message 2</div>
      </ConversationList>
    );
    await expectNoA11yViolations(container);
  });
});
