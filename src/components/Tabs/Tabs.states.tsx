/**
 * State fixtures for Tabs, rendered by `pnpm run test:states`.
 *
 * @family:navigation
 * @na:empty A tab row always has its tabs; with none there is nothing to render.
 * @na:loading The tab row is static; the panel owns loading, and a count shows `…` while counting.
 * @na:error The tab row cannot fail; the panel owns errors.
 */
import { Stack } from "../Stack";
import { Tabs } from ".";
import { TokenChecks, frames, type Check, type InteractionCheck } from "../../test/token-probe";

// The row scrolls, so it clips: a focused tab's ring must land inside the
// row's scrollport on every side.
const ringFits: InteractionCheck = (interaction, element) => {
  if (interaction !== "focus") return [];
  const style = getComputedStyle(element);
  const reach = Math.max(0, parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth));
  const box = element.getBoundingClientRect();
  const list = element.closest<HTMLElement>('[role="tablist"]');
  if (!list) return [{ label: "The tab sits in a tablist", actual: "none", pass: false }];
  const port = list.getBoundingClientRect();
  const edges = getComputedStyle(list);
  const fits =
    box.left - reach >= port.left + parseFloat(edges.borderLeftWidth) - 0.5 &&
    box.right + reach <= port.right - parseFloat(edges.borderRightWidth) + 0.5 &&
    box.top - reach >= port.top + parseFloat(edges.borderTopWidth) - 0.5 &&
    box.bottom + reach <= port.bottom - parseFloat(edges.borderBottomWidth) + 0.5;
  return [
    {
      label: "The focus ring fits inside the scrolling row",
      actual: `ring reach ${reach}px`,
      pass: fits,
    },
  ];
};

// Short names never overflow a wide row: the hit area grows only in the
// block axis, so the edge fade stays off.
async function shortNamesFit(host: HTMLElement): Promise<Check[]> {
  await frames(2);
  const list = host.querySelector<HTMLElement>('[aria-label="Package manager"]');
  if (!list) return [{ label: "The short-name row renders", actual: "none", pass: false }];
  return [
    {
      label: "A row of short names does not scroll",
      actual: `${list.scrollWidth} / ${list.clientWidth}`,
      pass: list.scrollWidth <= list.clientWidth && list.dataset.scrollX === "none",
    },
  ];
}

function Row({ variant, size }: { variant: "ghost" | "soft"; size: "sm" | "md" }) {
  return (
    <Tabs variant={variant} size={size} defaultValue="findings">
      <Tabs.List aria-label={`Repository, ${variant} ${size}`}>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="findings" count={12}>
          Findings
        </Tabs.Tab>
        <Tabs.Tab value="settings" dot="Changed since you looked">
          Settings
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">Overview panel</Tabs.Panel>
      <Tabs.Panel value="findings">Findings panel</Tabs.Panel>
      <Tabs.Panel value="settings">Settings panel</Tabs.Panel>
    </Tabs>
  );
}

export function populated() {
  return (
    <Stack gap="lg">
      <Row variant="ghost" size="md" />
      <Row variant="ghost" size="sm" />
      <Row variant="soft" size="md" />
      <Row variant="soft" size="sm" />
    </Stack>
  );
}

export function overflow() {
  return (
    <Stack gap="lg">
      <div style={{ maxInlineSize: 240 }}>
        <Tabs defaultValue="history">
          <Tabs.List aria-label="Repository sections">
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="findings">Findings</Tabs.Tab>
            <Tabs.Tab value="pulls">Pull requests</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>
      <div style={{ maxInlineSize: 240 }}>
        <Tabs variant="soft" defaultValue="all">
          <Tabs.List aria-label="Status">
            <Tabs.Tab value="all">Every finding in the repository</Tabs.Tab>
            <Tabs.Tab value="open">Open</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>
    </Stack>
  );
}

export function lifecycle() {
  return (
    <TokenChecks title="Tabs" check={shortNamesFit} interact={ringFits}>
      <Stack gap="lg">
        <Tabs defaultValue="findings">
          <Tabs.List aria-label="Repository, ghost">
            <Tabs.Tab value="overview" data-states-interact="hover focus">
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="findings">Findings</Tabs.Tab>
            <Tabs.Tab value="settings" disabled>
              Settings
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <Tabs variant="soft" defaultValue="findings">
          <Tabs.List aria-label="Repository, soft">
            <Tabs.Tab value="overview" data-states-interact="hover focus">
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="findings">Findings</Tabs.Tab>
            <Tabs.Tab value="settings" disabled>
              Settings
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <Tabs defaultValue="npm">
          <Tabs.List aria-label="Package manager">
            <Tabs.Tab value="npm">npm</Tabs.Tab>
            <Tabs.Tab value="pnpm">pnpm</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Stack>
    </TokenChecks>
  );
}
