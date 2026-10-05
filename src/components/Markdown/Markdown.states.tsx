/**
 * State fixtures for Markdown, rendered by `pnpm run test:states`.
 *
 * @family:primitives
 * @na:empty An empty string renders nothing; the reply shows ThinkingIndicator until words arrive.
 * @na:error Markdown never fails: without the parser it degrades to plain paragraphs.
 */
import * as React from "react";
import { Markdown } from ".";
import { find, framesUntil, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, wait, type Check } from "../../test/token-probe";

const REPLY = [
  "## Drift on main",
  "",
  "Two files use a raw `button`. Replace them with **Button**:",
  "",
  "- `src/Save.tsx`",
  "- `src/Cancel.tsx`",
  "",
  "> The contract names Button as the canonical action.",
  "",
  "```tsx",
  "<Button onClick={save}>Save</Button>",
  "```",
].join("\n");

// The harness lists its checks in a <ul> of its own, so wait for the heading, which only
// the parser draws.
async function parsed(host: HTMLElement) {
  await framesUntil(() => host.querySelector("h2") !== null, 120);
}

export function populated() {
  return (
    <TokenChecks
      title="A reply at chat scale"
      check={async (host) => {
        const { checks, add } = recorder();
        await parsed(host);
        const paragraph = find(host, "p");
        add(
          "Body reads 12 on 18",
          `${getComputedStyle(paragraph).fontSize} / ${getComputedStyle(paragraph).lineHeight}`,
          getComputedStyle(paragraph).fontSize === "12px" &&
            getComputedStyle(paragraph).lineHeight === "18px"
        );
        const heading = find(host, "h2");
        add(
          "Headings stay compact (title-sm, 15)",
          getComputedStyle(heading).fontSize,
          getComputedStyle(heading).fontSize === "15px"
        );
        await framesUntil(() => host.querySelector("[data-language]") !== null, 60);
        add(
          "The fence renders through CodeBlock",
          host.querySelector("[data-language]")?.getAttribute("data-language") ?? "none",
          host.querySelector('[data-language="tsx"]') !== null
        );
        return checks;
      }}
    >
      <div style={{ inlineSize: 480 }}>
        <Markdown content={REPLY} />
      </div>
    </TokenChecks>
  );
}

export function loading() {
  return (
    <TokenChecks
      title="Streaming with an open fence"
      check={async (host) => {
        const { checks, add } = recorder();
        await framesUntil(() => host.querySelector("[data-language]") !== null, 120);
        const root = find(host, "[aria-busy]");
        add(
          "A streaming reply is busy",
          root.getAttribute("aria-busy") ?? "",
          root.getAttribute("aria-busy") === "true"
        );
        add(
          "The open fence shows as code",
          host.querySelector("pre")?.textContent ?? "none",
          /<button onClick/.test(host.querySelector("pre")?.textContent ?? "")
        );
        const last = root.lastElementChild as HTMLElement;
        const caret = getComputedStyle(last, "::after");
        add(
          "A still caret follows the last block",
          `${caret.content} · ${caret.animationName}`,
          caret.content !== "none" && caret.animationName === "none"
        );
        return checks;
      }}
    >
      <div style={{ inlineSize: 480 }}>
        <Markdown
          streaming
          content={["Two files use a raw `button`:", "", "```tsx", "<button onClick={save}>"].join(
            "\n"
          )}
        />
      </div>
    </TokenChecks>
  );
}

const WIDE = [
  "| Repository | Findings | Owner | Last checked | Contract |",
  "| --- | --- | --- | --- | --- |",
  "| fragments-sdk/ui | 12 | design-systems | 2026-10-03 14:02 | Active |",
  "| fragments-sdk/cloud | 3 | platform | 2026-10-03 13:40 | Active |",
  "",
  "See https://example.com/reports/contract/drift/2026-10-03/pull-requests/1234/files/src/components/Save.tsx",
].join("\n");

export function overflow() {
  return (
    <TokenChecks
      title="A wide table and an unbroken link"
      check={async (host) => {
        const { checks, add } = recorder();
        await framesUntil(() => host.querySelector("table") !== null, 120);
        const region = find(host, '[role="region"]');
        add(
          "A wide table scrolls in its own region",
          `${region.scrollWidth} > ${region.clientWidth}`,
          region.scrollWidth > region.clientWidth
        );
        add("A keyboard can reach it", String(region.tabIndex), region.tabIndex === 0);
        const lane = find(host, "[data-lane]");
        add(
          "Nothing pushes past the lane",
          `${lane.scrollWidth} ≤ ${lane.clientWidth}`,
          lane.scrollWidth <= lane.clientWidth
        );
        return checks;
      }}
    >
      <div data-lane="" style={{ inlineSize: 320 }}>
        <Markdown content={WIDE} />
      </div>
    </TokenChecks>
  );
}

function Arrives() {
  const [streaming, setStreaming] = React.useState(true);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setStreaming(false), 400);
    return () => window.clearTimeout(timer);
  }, []);
  return <Markdown streaming={streaming} content="Every changed file follows the contract." />;
}

async function checkArrives(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  add(
    "Busy while streaming",
    String(host.querySelector("[aria-busy]") !== null),
    host.querySelector("[aria-busy]") !== null
  );
  await wait(600);
  add(
    "Done: no longer busy",
    String(host.querySelector("[aria-busy]") !== null),
    host.querySelector("[aria-busy]") === null
  );
  const last = host.querySelector("p");
  add(
    "Done: the caret is gone",
    last ? getComputedStyle(last, "::after").content : "none",
    !last || getComputedStyle(last, "::after").content === "none"
  );
  return checks;
}

export function lifecycle() {
  return (
    <TokenChecks title="Streaming to done" check={checkArrives}>
      <Arrives />
    </TokenChecks>
  );
}
