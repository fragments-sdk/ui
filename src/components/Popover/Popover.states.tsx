/**
 * State fixtures for Popover, rendered by `pnpm run test:states`.
 *
 * @family:overlays
 * @na:empty A popover shows the content it is given; with nothing to show it is not opened.
 * @na:loading A popover has no loading state of its own; content that loads inside it shows the skeleton recipe.
 * @na:error A popover has no error state of its own; a failure inside it shows the errbox recipe.
 */
import { Popover } from ".";
import { Button } from "../Button";
import {
  anchorGap,
  escapeCloses,
  find,
  framesUntil,
  near,
  oncePerHost,
  popupSettled,
  recorder,
  showing,
  stillPopupChecks,
} from "../../test/recipe-checks";
import { TokenChecks, type Check } from "../../test/token-probe";

function popup() {
  return document.querySelector<HTMLElement>("[data-states-popover]");
}

function Evidence({ long = false }: { long?: boolean }) {
  return (
    <Popover defaultOpen>
      <Popover.Trigger
        render={
          <Button variant="soft" data-role="trigger">
            Evidence
          </Button>
        }
      />
      <Popover.Content data-states-popover="">
        <Popover.Title>Checked 4 minutes ago</Popover.Title>
        <Popover.Description>
          {long
            ? "fragments-sdk/a-repository-with-a-very-long-name-that-has-no-natural-break/src/components/index.tsx"
            : "Three findings in two files."}
        </Popover.Description>
      </Popover.Content>
    </Popover>
  );
}

async function checkOpen(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  const opened = await framesUntil(() => Boolean(popup()));
  add("The popover opens", opened < 0 ? "never" : `after ${opened} frame(s)`, opened >= 0);
  const surface = popup();
  if (!surface) return checks;
  await popupSettled(surface);
  checks.push(...stillPopupChecks("The popover", surface));
  const { side, gap } = anchorGap(surface, find(host, '[data-role="trigger"]'));
  add("The popover sits 4 from its trigger", `${gap.toFixed(2)}px (${side})`, near(gap, 4, 0.5));
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Open popover" check={checkOpen}>
      <Evidence />
    </TokenChecks>
  );
}

async function checkOverflow(host: HTMLElement): Promise<Check[]> {
  const checks = await checkOpen(host);
  const surface = popup();
  if (!surface) return checks;
  checks.push({
    label: "A long unbroken path wraps inside the popover",
    actual: `${surface.scrollWidth}/${surface.clientWidth}`,
    pass: surface.scrollWidth <= surface.clientWidth,
  });
  return checks;
}

export function overflow() {
  return (
    <TokenChecks title="Long popover" check={checkOverflow}>
      <Evidence long />
    </TokenChecks>
  );
}

const checkEscape = oncePerHost(async (host) => {
  const checks = await checkOpen(host);
  const surface = popup();
  if (!surface) return checks;
  surface.focus();
  const trigger = find(host, '[data-role="trigger"]');
  checks.push(...(await escapeCloses("popover", () => showing(popup()), trigger)));
  trigger.blur();
  return checks;
});

export function lifecycleDismiss() {
  return (
    <TokenChecks title="Escape" check={checkEscape}>
      <Evidence />
    </TokenChecks>
  );
}
