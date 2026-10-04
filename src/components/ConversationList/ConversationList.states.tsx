/**
 * State fixtures for ConversationList, rendered by `pnpm run test:states`.
 *
 * @family:ai
 */
import * as React from "react";
import { ConversationList } from ".";
import { EmptyState } from "../EmptyState";
import { Message } from "../Message";
import { find, framesUntil, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, wait, type Check } from "../../test/token-probe";

function Frame({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", blockSize: 320, inlineSize: 420 }}>{children}</div>;
}

function turns(count: number, from = 0) {
  return Array.from({ length: count }, (_, i) => (
    <Message key={from + i} from={(from + i) % 2 ? "assistant" : "user"}>
      <Message.Content>{`Message ${from + i + 1}: checking the contract for the next file`}</Message.Content>
    </Message>
  ));
}

function atEnd(scroller: HTMLElement) {
  return scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 2;
}

export function populated() {
  return (
    <TokenChecks
      title="A named log with a day break"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(2);
        const log = find(host, '[role="log"]');
        add(
          "The log is named",
          log.getAttribute("aria-label") ?? "",
          log.getAttribute("aria-label") === "Conversation"
        );
        add("A keyboard can reach it", String(log.tabIndex), log.tabIndex === 0);
        add(
          "The day break reads Today",
          find(host, "time").textContent ?? "",
          find(host, "time").textContent === "Today"
        );
        return checks;
      }}
    >
      <Frame>
        <ConversationList>
          <ConversationList.Event date={new Date()} />
          {turns(2)}
        </ConversationList>
      </Frame>
    </TokenChecks>
  );
}

export function empty() {
  return (
    <TokenChecks
      title="No messages yet"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(2);
        add(
          "The empty state shows",
          host.textContent ?? "",
          /Ask about your design system/.test(host.textContent ?? "")
        );
        return checks;
      }}
    >
      <Frame>
        <ConversationList
          emptyState={
            <EmptyState>
              <EmptyState.Title>Ask about your design system</EmptyState.Title>
            </EmptyState>
          }
        >
          {[]}
        </ConversationList>
      </Frame>
    </TokenChecks>
  );
}

/** The history row is on screen: inside the frame, not scrolled away above the log. */
function onScreen(label: string, element: Element, log: Element): Check {
  const box = element.getBoundingClientRect();
  const frame = (log.parentElement ?? log).getBoundingClientRect();
  return {
    label: `${label} is on screen above the log`,
    actual: `top ${box.top.toFixed(0)}, frame top ${frame.top.toFixed(0)}`,
    pass: box.top >= frame.top - 0.5 && box.bottom <= frame.bottom + 0.5,
  };
}

export function loading() {
  return (
    <TokenChecks
      title="Loading earlier messages"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(2);
        const status = find(host, '[role="status"]');
        add(
          "Loading history is a status in words",
          status.textContent ?? "",
          /Loading history/.test(status.textContent ?? "")
        );
        checks.push(onScreen("The loading row", status, find(host, '[role="log"]')));
        return checks;
      }}
    >
      <Frame>
        <ConversationList history="loading">{turns(2)}</ConversationList>
      </Frame>
    </TokenChecks>
  );
}

export function error() {
  return (
    <TokenChecks
      title="Earlier messages failed"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(2);
        add(
          "The failure is words",
          host.textContent ?? "",
          /Couldn.t load earlier messages\./.test(host.textContent ?? "")
        );
        add(
          "Retry is offered",
          find(host, "button").textContent ?? "",
          find(host, "button").textContent === "Retry"
        );
        checks.push(onScreen("Retry", find(host, "button"), find(host, '[role="log"]')));
        return checks;
      }}
    >
      <Frame>
        <ConversationList history="error" onRetryHistory={() => {}}>
          {turns(2)}
        </ConversationList>
      </Frame>
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <TokenChecks
      title="A long conversation opens at the end"
      check={async (host) => {
        const { checks, add } = recorder();
        const log = find(host, '[role="log"]');
        await framesUntil(() => atEnd(log), 30);
        add(
          "It scrolls",
          `${log.scrollHeight} > ${log.clientHeight}`,
          log.scrollHeight > log.clientHeight
        );
        add("It opens at the newest message", `${log.scrollTop.toFixed(0)}px`, atEnd(log));
        add(
          "No jump button at the end",
          String(host.querySelectorAll("button").length),
          host.querySelectorAll("button").length === 0
        );
        return checks;
      }}
    >
      <Frame>
        <ConversationList>{turns(30)}</ConversationList>
      </Frame>
    </TokenChecks>
  );
}

function Arriving() {
  const [count, setCount] = React.useState(20);
  return (
    <div>
      <button type="button" data-add onClick={() => setCount((n) => n + 3)}>
        Add three
      </button>
      <Frame>
        <ConversationList>{turns(count)}</ConversationList>
      </Frame>
    </div>
  );
}

async function checkArriving(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  const log = find(host, '[role="log"]');
  await framesUntil(() => atEnd(log), 30);
  log.scrollTop = 40;
  log.dispatchEvent(new Event("scroll"));
  await frames(2);
  const first = [...log.querySelectorAll("[data-from]")].find(
    (el) => el.getBoundingClientRect().bottom > log.getBoundingClientRect().top
  )!;
  const before = first.getBoundingClientRect().top;
  find(host, "[data-add]").click();
  await wait(100);
  add(
    "The reader's place holds while messages arrive",
    `${before.toFixed(1)} → ${first.getBoundingClientRect().top.toFixed(1)}`,
    Math.abs(first.getBoundingClientRect().top - before) < 2
  );
  const jump = [...host.querySelectorAll("button")].find((b) =>
    /new message/.test(b.textContent ?? "")
  );
  add(
    "The arrivals are counted",
    jump?.textContent ?? "none",
    jump?.textContent === "3 new messages"
  );
  jump?.click();
  await framesUntil(() => atEnd(log), 30);
  add("The jump returns to the end", `${log.scrollTop.toFixed(0)}px`, atEnd(log));
  return checks;
}

export function lifecycle() {
  return (
    <TokenChecks title="Scrolled up while messages arrive" check={checkArriving}>
      <Arriving />
    </TokenChecks>
  );
}
