/**
 * State fixtures for CodeBlock, rendered by `pnpm run test:states`.
 *
 * @family:theme-reach
 * @na:empty A code block always holds code; with nothing to show, leave it out.
 */
import { CodeBlock } from ".";
import { Stack } from "../Stack";
import {
  colorAs,
  colorOf,
  find,
  framesUntil,
  near,
  oncePerHost,
  recorder,
} from "../../test/recipe-checks";
import {
  TokenChecks,
  frames,
  readLength,
  sameColor,
  waitUntil,
  type Check,
} from "../../test/token-probe";

const SNIPPET = `import { Button } from "@usefragments/ui";

export function Save() {
  return <Button>Save</Button>;
}`;

const LONG_LINE = `const reason = "The contract names Button as the canonical action, so a raw button element in a pull request is drift and blocks the merge until it is replaced.";`;

const LONG_FILE = Array.from({ length: 14 }, (_, i) => `step ${i + 1}: check the next file`).join(
  "\n"
);

// Every block on the page, not the first to finish.
async function highlighted(host: HTMLElement) {
  await framesUntil(
    () => host.querySelector('[data-slot="code-block"]:not([data-highlighted])') === null,
    120
  );
}

export function populated() {
  return (
    <TokenChecks
      title="Highlighted, titled, numbered"
      check={async (host) => {
        const { checks, add } = recorder();
        await highlighted(host);
        const root = find(host, '[data-slot="code-block"]');
        const pre = find(host, "pre");
        const style = getComputedStyle(root);
        add(
          "The block sits on the band",
          style.backgroundColor,
          sameColor(
            colorOf(style.backgroundColor),
            colorOf(colorAs(root, "var(--fui-bg-secondary)"))
          )
        );
        add(
          "The surface corner",
          style.borderTopLeftRadius,
          near(parseFloat(style.borderTopLeftRadius), readLength(root, "var(--fui-radius-surface)"))
        );
        add(
          "Code is mono 12 on an 18 line",
          `${getComputedStyle(pre).fontSize} / ${getComputedStyle(pre).lineHeight}`,
          getComputedStyle(pre).fontSize === "12px" && getComputedStyle(pre).lineHeight === "18px"
        );
        const number = find(host, ".line-number");
        add(
          "Line numbers are ink 3 at full opacity",
          `${getComputedStyle(number).color} / ${getComputedStyle(number).opacity}`,
          sameColor(
            colorOf(getComputedStyle(number).color),
            colorOf(colorAs(root, "var(--fui-text-tertiary)"))
          ) && getComputedStyle(number).opacity === "1"
        );
        const marked = find(host, ".line.highlighted");
        add(
          "A marked line takes the neutral tint, not a hue",
          getComputedStyle(marked).backgroundColor,
          sameColor(
            colorOf(getComputedStyle(marked).backgroundColor),
            colorOf(colorAs(root, "var(--fui-bg-hover)"))
          )
        );
        const copy = find(host, 'button[aria-label="Copy code"]');
        add(
          "Copy is visible without a hover",
          getComputedStyle(copy).opacity,
          getComputedStyle(copy).opacity === "1"
        );
        return checks;
      }}
    >
      <Stack gap="lg">
        <CodeBlock
          code={SNIPPET}
          title="Save.tsx"
          language="tsx"
          showLineNumbers
          highlightLines={[4]}
        />
        <CodeBlock code="npx @usefragments/cli check --ci" language="bash" size="sm" />
      </Stack>
    </TokenChecks>
  );
}

export function loading() {
  return (
    <TokenChecks
      title="Plain until highlighted, no shift"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(1);
        const before = find(host, '[data-slot="code-block-code"]').getBoundingClientRect().height;
        add(
          "The code reads at once, before the highlighter",
          find(host, "pre code").textContent?.slice(0, 24) ?? "",
          (find(host, "pre code").textContent ?? "").includes("export function Save")
        );
        await highlighted(host);
        const after = find(host, '[data-slot="code-block-code"]').getBoundingClientRect().height;
        add(
          "Highlighting keeps the same box",
          `${before.toFixed(1)}px → ${after.toFixed(1)}px`,
          near(before, after, 0.5)
        );
        return checks;
      }}
    >
      <CodeBlock code={SNIPPET} language="tsx" />
    </TokenChecks>
  );
}

// Clicks are side effects: run once per host, so a remount does not click twice.
const refusedCopy = oncePerHost(async (host: HTMLElement): Promise<Check[]> => {
  // Let the mount finish first, so the click lands on the settled block.
  await frames(2);
  const { checks, add } = recorder();
  const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: () => Promise.reject(new Error("refused")) },
  });
  try {
    find(host, 'button[aria-label="Copy code"]').click();
    await framesUntil(() => /copy/.test(find(host, '[role="status"]').textContent ?? ""), 60);
    const status = find(host, '[role="status"]');
    add(
      "The failure is words on screen",
      status.textContent ?? "",
      /Couldn.t copy/.test(status.textContent ?? "")
    );
    add(
      "In the danger ink",
      getComputedStyle(status).color,
      sameColor(
        colorOf(getComputedStyle(status).color),
        colorOf(colorAs(status, "var(--fui-color-danger-text)"))
      )
    );
  } finally {
    if (original) Object.defineProperty(navigator, "clipboard", original);
    else delete (navigator as { clipboard?: unknown }).clipboard;
  }
  return checks;
});

export function error() {
  return (
    <TokenChecks title="Copy refused" check={refusedCopy}>
      <CodeBlock code="npx @usefragments/cli check --ci" language="bash" title="Run in CI" />
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <TokenChecks
      title="Long lines, a long title, a long file"
      check={async (host) => {
        const { checks, add } = recorder();
        await highlighted(host);
        const region = find(host, '[data-slot="code-block-code"]');
        add(
          "A long line scrolls inside the block",
          `${region.scrollWidth} > ${region.clientWidth}`,
          region.scrollWidth > region.clientWidth
        );
        add("A keyboard can reach the scroll", String(region.tabIndex), region.tabIndex === 0);
        const title = find(host, '[data-slot="code-block-header"] span');
        add(
          "A long title ends in an ellipsis",
          getComputedStyle(title).textOverflow,
          getComputedStyle(title).textOverflow === "ellipsis" &&
            title.scrollWidth > title.clientWidth
        );
        const fold = find(host, "button[aria-expanded]");
        add(
          "A long file folds behind one bar",
          fold.textContent ?? "",
          /Show 10 more lines/.test(fold.textContent ?? "")
        );
        return checks;
      }}
    >
      <Stack gap="lg" style={{ maxInlineSize: 360 }}>
        <CodeBlock
          code={LONG_LINE}
          language="ts"
          title="packages/governance/src/rules/canonical-action-reason.ts"
        />
        <CodeBlock
          code={LONG_FILE}
          language="text"
          collapsible
          defaultCollapsed
          collapsedLines={4}
        />
      </Stack>
    </TokenChecks>
  );
}

const copyThenFold = oncePerHost(async (host: HTMLElement): Promise<Check[]> => {
  // Let the mount finish first, so the click lands on the settled block.
  await frames(2);
  const { checks, add } = recorder();
  const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: () => Promise.resolve() },
  });
  try {
    // Wait on the words themselves, on the clock rather than frames: a loaded engine runs
    // frames and timers late, so a fixed wait reads the status too early.
    const status = () => find(host, '[role="status"]').textContent ?? "";
    const clickedAt = performance.now();
    find(host, 'button[aria-label="Copy code"]').click();
    await waitUntil(() => status() === "Copied", 3000);
    add("Copy says Copied", status(), status() === "Copied");
    const cleared = await waitUntil(() => status() === "", 8000);
    const elapsed = performance.now() - clickedAt;
    add(
      "The words clear after two seconds",
      cleared < 0 ? `still ${JSON.stringify(status())}` : `cleared after ${elapsed.toFixed(0)}ms`,
      cleared >= 0 && elapsed >= 1900
    );
  } finally {
    if (original) Object.defineProperty(navigator, "clipboard", original);
    else delete (navigator as { clipboard?: unknown }).clipboard;
  }
  const fold = find(host, "button[aria-expanded]");
  fold.click();
  await frames(2);
  add(
    "The fold opens and says so",
    `${fold.getAttribute("aria-expanded")} · ${fold.textContent}`,
    fold.getAttribute("aria-expanded") === "true" && fold.textContent === "Show less"
  );
  return checks;
});

export function lifecycle() {
  return (
    <TokenChecks title="Copy, then the words clear; fold opens" check={copyThenFold}>
      <CodeBlock code={LONG_FILE} language="text" collapsible defaultCollapsed collapsedLines={4} />
    </TokenChecks>
  );
}
