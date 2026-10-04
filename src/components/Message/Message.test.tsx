import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { compiledModuleRules } from "../../test/compiled-css";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Message } from "./index";

const cssText = compiledModuleRules("src/components/Message/Message.module.scss")
  .map((rule) => rule.cssText)
  .join("\n");

describe("Message", () => {
  it("marks who wrote it with data-from", () => {
    const { container } = render(
      <Message from="user">
        <Message.Content>Hello</Message.Content>
      </Message>
    );
    expect(container.firstElementChild).toHaveAttribute("data-from", "user");
  });

  it("draws no avatar by default and shows an opt-in one", () => {
    const { container, rerender } = render(
      <Message from="assistant">
        <Message.Content>Hi</Message.Content>
      </Message>
    );
    expect(container.querySelector("img, svg")).toBeNull();
    rerender(
      <Message from="assistant" avatar={<Message.Avatar src="/a.png" alt="Assistant" />}>
        <Message.Content>Hi</Message.Content>
      </Message>
    );
    expect(screen.getByRole("img", { name: "Assistant" })).toBeInTheDocument();
  });

  it("keeps the user's line breaks", () => {
    render(
      <Message from="user">
        <Message.Content>{"one\ntwo"}</Message.Content>
      </Message>
    );
    expect(screen.getByText(/one/).className).toMatch(/text/);
  });

  it("says Sending… in the time slot while pending", () => {
    render(
      <Message from="user" status="pending">
        <Message.Content>Hello</Message.Content>
      </Message>
    );
    expect(screen.getByText("Sending…")).toBeInTheDocument();
  });

  it("renders the timestamp as a time element", () => {
    const date = new Date("2026-10-03T10:00:00Z");
    const { container } = render(
      <Message from="assistant" timestamp={date}>
        <Message.Content>Hello</Message.Content>
      </Message>
    );
    expect(container.querySelector("time")).toHaveAttribute("datetime", date.toISOString());
  });

  it("is busy with a caret while streaming", () => {
    const { container } = render(
      <Message from="assistant" status="streaming">
        <Message.Content>
          <span>Partial</span>
        </Message.Content>
      </Message>
    );
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector('[class*="caret"]')).not.toBeNull();
  });

  it("shows the failure block with Try again, never a tinted bubble", () => {
    const onRetry = vi.fn();
    render(
      <Message from="user" status="error" onRetry={onRetry}>
        <Message.Content>Hello</Message.Content>
      </Message>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Not sent.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(cssText).not.toMatch(/data-status="error"\][^{]*\.content/);
  });

  it("takes a custom failure block with extra actions", () => {
    render(
      <Message from="assistant" status="error">
        <Message.Content>Half a reply</Message.Content>
        <Message.Error onRetry={() => {}} actions={<button type="button">Ask differently</button>}>
          The model stopped.
        </Message.Error>
      </Message>
    );
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Ask differently" })).toBeInTheDocument();
  });

  it("gates actions behind hover only where a pointer hovers", () => {
    expect(cssText).toMatch(/@media \(hover: hover\)[\s\S]*\.actions/);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Message from="user" timestamp={new Date()}>
          <Message.Content>What changed?</Message.Content>
        </Message>
        <Message from="assistant">
          <Message.Content>Two files.</Message.Content>
        </Message>
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
