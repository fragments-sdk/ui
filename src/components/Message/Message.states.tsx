/**
 * State fixtures for Message, rendered by `pnpm run test:states`.
 *
 * @family:ai
 * @na:empty A message always carries words; an empty conversation is ConversationList's emptyState.
 */
import * as React from "react";
import { Message } from ".";
import { Stack } from "../Stack";
import { colorAs, colorOf, find, framesUntil, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, sameColor, wait, type Check } from "../../test/token-probe";

const REPLY =
  "Two files use a raw `button`. Replace them with `Button`:\n\n- `src/Save.tsx`\n- `src/Cancel.tsx`";

function Exchange() {
  return (
    <Stack gap="lg" style={{ inlineSize: 480 }}>
      <Message from="user" timestamp={new Date(Date.now() - 120000)}>
        <Message.Content>Which files break the contract?</Message.Content>
      </Message>
      <Message from="assistant">
        <Message.Content>{REPLY}</Message.Content>
      </Message>
    </Stack>
  );
}

export function populated() {
  return (
    <TokenChecks
      title="A user bubble and a flush reply"
      check={async (host) => {
        const { checks, add } = recorder();
        // The reply's list, not the harness's own <ul> of checks.
        await framesUntil(() => host.querySelector('[data-from="assistant"] li') !== null, 120);
        const user = find(host, '[data-from="user"]');
        const bubble = find(user, "[class*='content']");
        add(
          "The user's words sit on the band",
          getComputedStyle(bubble).backgroundColor,
          sameColor(
            colorOf(getComputedStyle(bubble).backgroundColor),
            colorOf(colorAs(bubble, "var(--fui-bg-secondary)"))
          )
        );
        const lane = user.parentElement!.getBoundingClientRect();
        const box = user.getBoundingClientRect();
        add(
          "The bubble sits at the end, within 80% of the measure",
          `${(box.right - lane.right).toFixed(1)}px from the end, ${((box.width / lane.width) * 100).toFixed(0)}%`,
          Math.abs(box.right - lane.right) < 1 && box.width <= lane.width * 0.8 + 1
        );
        const reply = find(host, '[data-from="assistant"]');
        const replyContent = find(reply, "[class*='content']");
        add(
          "The reply is flush: no fill",
          getComputedStyle(replyContent).backgroundColor,
          colorOf(getComputedStyle(replyContent).backgroundColor).alpha === 0
        );
        add(
          "No avatar is drawn by default",
          String(host.querySelectorAll("img").length),
          host.querySelectorAll("[class*='avatar']").length === 0
        );
        add(
          "The reply renders markdown",
          String(reply.querySelectorAll("li").length),
          reply.querySelectorAll("li").length === 2
        );
        return checks;
      }}
    >
      <Exchange />
    </TokenChecks>
  );
}

export function loading() {
  return (
    <TokenChecks
      title="Sending, then streaming"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(2);
        add(
          "A pending message says Sending…",
          find(host, '[data-status="pending"]').textContent ?? "",
          /Sending…/.test(find(host, '[data-status="pending"]').textContent ?? "")
        );
        const streaming = find(host, '[data-status="streaming"]');
        add(
          "A streaming reply is busy",
          streaming.getAttribute("aria-busy") ?? "",
          streaming.getAttribute("aria-busy") === "true"
        );
        const wash = getComputedStyle(find(streaming, "[class*='content']"), "::after");
        add(
          "A streaming reply plays the work wash",
          `${wash.content} · ${wash.animationName}`,
          wash.content !== "none" &&
            (wash.animationName.includes("fui-working-sweep") ||
              matchMedia("(prefers-reduced-motion: reduce)").matches)
        );
        const caret = find(streaming, "[class*='caret']");
        add(
          "The caret stands still",
          getComputedStyle(caret).animationName,
          getComputedStyle(caret).animationName === "none"
        );
        add(
          "The caret is ink 1",
          getComputedStyle(caret).borderInlineStartColor,
          sameColor(
            colorOf(getComputedStyle(caret).borderInlineStartColor),
            colorOf(colorAs(caret, "var(--fui-text-primary)"))
          )
        );
        return checks;
      }}
    >
      <Stack gap="lg" style={{ inlineSize: 480 }}>
        <Message from="user" status="pending">
          <Message.Content>Summarise the drift on main.</Message.Content>
        </Message>
        <Message from="assistant" status="streaming">
          <Message.Content>
            <span>Checking the contract for this pull request</span>
          </Message.Content>
        </Message>
      </Stack>
    </TokenChecks>
  );
}

export function error() {
  return (
    <TokenChecks
      title="Not sent, and a reply that did not finish"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(2);
        const alerts = host.querySelectorAll('[role="alert"]');
        add("Each failure is an alert", String(alerts.length), alerts.length === 2);
        add(
          "The user's failure says Not sent.",
          alerts[0]?.textContent ?? "",
          /Not sent\./.test(alerts[0]?.textContent ?? "")
        );
        add(
          "The reply's failure says it didn't finish",
          alerts[1]?.textContent ?? "",
          /didn.t finish/.test(alerts[1]?.textContent ?? "")
        );
        add(
          "Try again is offered",
          String(host.querySelectorAll("button").length),
          [...host.querySelectorAll("button")].every((b) => b.textContent === "Try again")
        );
        return checks;
      }}
    >
      <Stack gap="lg" style={{ inlineSize: 480 }}>
        <Message from="user" status="error" onRetry={() => {}}>
          <Message.Content>Summarise the drift on main.</Message.Content>
        </Message>
        <Message from="assistant" status="error" onRetry={() => {}}>
          <Message.Content>Two files use a raw</Message.Content>
        </Message>
      </Stack>
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <TokenChecks
      title="An unbroken link and a long code line"
      check={async (host) => {
        const { checks, add } = recorder();
        await framesUntil(() => host.querySelector("pre") !== null, 120);
        const lane = find(host, "[data-lane]");
        add(
          "Nothing pushes past the lane",
          `${lane.scrollWidth} ≤ ${lane.clientWidth}`,
          lane.scrollWidth <= lane.clientWidth
        );
        const user = find(host, '[data-from="user"]');
        add(
          "The bubble keeps its cap",
          `${user.getBoundingClientRect().width.toFixed(0)}px`,
          user.getBoundingClientRect().width <= lane.clientWidth * 0.8 + 1
        );
        return checks;
      }}
    >
      <Stack gap="lg" data-lane="" style={{ inlineSize: 360 }}>
        <Message from="user">
          <Message.Content>
            https://example.com/reports/contract/drift/2026-10-03/pull-requests/1234/files/src/components/Save.tsx
          </Message.Content>
        </Message>
        <Message from="assistant">
          <Message.Content>
            {
              'Replace it:\n\n```tsx\nexport const Save = () => <Button variant="solid" onClick={save} aria-describedby="save-help">Save changes</Button>;\n```'
            }
          </Message.Content>
        </Message>
      </Stack>
    </TokenChecks>
  );
}

function Lifecycle() {
  const [status, setStatus] = React.useState<"streaming" | "complete">("streaming");
  React.useEffect(() => {
    const timer = window.setTimeout(() => setStatus("complete"), 300);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <Message from="assistant" status={status}>
      <Message.Content>
        <span>Every changed file follows the contract.</span>
      </Message.Content>
    </Message>
  );
}

async function checkLifecycle(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  add(
    "Streaming shows the caret",
    String(host.querySelectorAll("[class*='caret']").length),
    host.querySelectorAll("[class*='caret']").length === 1
  );
  await wait(400);
  const message = find(host, "[data-from]");
  add(
    "Complete drops the caret",
    String(host.querySelectorAll("[class*='caret']").length),
    host.querySelectorAll("[class*='caret']").length === 0
  );
  add(
    "And is no longer busy",
    String(message.getAttribute("aria-busy")),
    message.getAttribute("aria-busy") === null
  );
  return checks;
}

export function lifecycle() {
  return (
    <TokenChecks title="Streaming to complete" check={checkLifecycle}>
      <Lifecycle />
    </TokenChecks>
  );
}
