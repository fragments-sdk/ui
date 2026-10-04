/**
 * State fixtures for Tooltip, rendered by `pnpm run test:states`.
 *
 * @family:overlays
 * @na:empty A tooltip always names something; with no words, leave the tooltip out.
 * @na:loading A tooltip shows a fixed label; it never loads.
 * @na:error A tooltip names a control; the control shows its own error.
 */
import { Tooltip } from ".";
import { Button } from "../Button";
import {
  anchorGap,
  escapeCloses,
  find,
  framesUntil,
  near,
  oncePerHost,
  recorder,
  popupSettled,
  showing,
  stillPopupChecks,
} from "../../test/recipe-checks";
import { TokenChecks, waitUntil, type Check } from "../../test/token-probe";

function popup() {
  return document.querySelector<HTMLElement>('[role="tooltip"], [data-states-tooltip]');
}

async function checkOpen(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  const opened = await framesUntil(() => Boolean(popup()));
  add("The tooltip opens", opened < 0 ? "never" : `after ${opened} frame(s)`, opened >= 0);
  const tip = popup();
  if (!tip) return checks;
  await popupSettled(tip);
  checks.push(...stillPopupChecks("The tooltip", tip));
  const { side, gap } = anchorGap(tip, find(host, '[data-role="trigger"]'));
  add("The tooltip sits 4 above its trigger", `${gap.toFixed(2)}px (${side})`, near(gap, 4, 0.5));
  add("The tooltip draws no arrow", String(tip.children.length), !tip.querySelector("[data-side]"));
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Open tooltip" check={checkOpen} hostProps={{ style: { paddingTop: 48 } }}>
      <Tooltip
        content="Copy the digest"
        shortcut="⌘C"
        defaultOpen
        contentProps={{ "data-states-tooltip": "" }}
      >
        <Button variant="soft" data-role="trigger">
          Copy
        </Button>
      </Tooltip>
    </TokenChecks>
  );
}

async function checkOverflow(host: HTMLElement): Promise<Check[]> {
  const checks = await checkOpen(host);
  const tip = popup();
  if (!tip) return checks;
  checks.push({
    label: "Long words wrap inside the tooltip",
    actual: `${tip.scrollWidth}/${tip.clientWidth}`,
    pass: tip.scrollWidth <= tip.clientWidth,
  });
  return checks;
}

export function overflow() {
  return (
    <TokenChecks
      title="Long tooltip"
      check={checkOverflow}
      hostProps={{ style: { paddingTop: 96 } }}
    >
      <Tooltip
        content="Copies sha256:04f0238b8486ec2067efd8a0379e7c35e189bf0eaf02e7f19eaaa499fd0c15d9 to the clipboard"
        defaultOpen
        contentProps={{ "data-states-tooltip": "" }}
      >
        <Button variant="soft" data-role="trigger">
          Copy digest
        </Button>
      </Tooltip>
    </TokenChecks>
  );
}

/** Open on its trigger, then Escape: the tooltip closes and focus stays on the trigger. */
const checkLifecycle = oncePerHost(async (host: HTMLElement): Promise<Check[]> => {
  const { checks, add } = recorder();
  const trigger = find<HTMLElement>(host, '[data-role="trigger"]');
  trigger.focus();
  const opened = await waitUntil(() => showing(popup()), 3000);
  add("The tooltip shows on its trigger", opened < 0 ? "never" : `after ${opened}ms`, opened >= 0);
  if (opened < 0) return checks;
  checks.push(...(await escapeCloses("tooltip", () => showing(popup()), trigger, { limit: 30 })));
  return checks;
});

export function lifecycle() {
  return (
    <TokenChecks
      title="Open, then Escape"
      check={checkLifecycle}
      hostProps={{ style: { paddingTop: 48 } }}
    >
      <Tooltip content="Copy the digest" defaultOpen contentProps={{ "data-states-tooltip": "" }}>
        <Button variant="soft" data-role="trigger">
          Copy
        </Button>
      </Tooltip>
    </TokenChecks>
  );
}
