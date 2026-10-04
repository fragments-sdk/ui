/**
 * State fixtures for Menu, rendered by `pnpm run test:states`.
 *
 * @family:overlays
 * @na:empty A menu renders the actions it is given; with no actions there is no menu to open.
 * @na:error A menu holds actions only; an action that fails reports where it ran.
 */
import { Menu } from ".";
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
import { TokenChecks, frames, waitUntil, type Check } from "../../test/token-probe";

function popup() {
  return document.querySelector<HTMLElement>('[role="menu"]');
}

function Actions({
  count = 3,
  long = false,
  loading = false,
  maxVisibleItems,
}: {
  count?: number;
  long?: boolean;
  loading?: boolean;
  maxVisibleItems?: number;
}) {
  const names = [
    "Rename",
    "Duplicate",
    "Move to group",
    "Copy link",
    "Archive",
    "Export",
    "Pin",
    "Share",
  ];
  return (
    <Menu defaultOpen>
      <Menu.Trigger
        render={
          <Button variant="soft" data-role="trigger">
            Actions
          </Button>
        }
      />
      <Menu.Content loading={loading} maxVisibleItems={maxVisibleItems}>
        {names.slice(0, count).map((name) => (
          <Menu.Item key={name} shortcut={name === "Rename" ? "R" : undefined}>
            {long && name === "Move to group"
              ? "Move to the group that holds every repository connected this quarter"
              : name}
          </Menu.Item>
        ))}
      </Menu.Content>
    </Menu>
  );
}

async function checkOpen(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  const opened = await framesUntil(() => Boolean(popup()));
  add("The menu opens", opened < 0 ? "never" : `after ${opened} frame(s)`, opened >= 0);
  const menu = popup();
  if (!menu) return checks;
  await popupSettled(menu);
  checks.push(...stillPopupChecks("The menu", menu));
  const { side, gap } = anchorGap(menu, find(host, '[data-role="trigger"]'));
  add("The menu sits 4 below its trigger", `${gap.toFixed(2)}px (${side})`, near(gap, 4, 0.5));
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Open menu" check={checkOpen}>
      <Actions />
    </TokenChecks>
  );
}

async function checkOverflow(host: HTMLElement): Promise<Check[]> {
  const checks = await checkOpen(host);
  const menu = popup();
  const viewport = menu?.firstElementChild as HTMLElement | null;
  if (!menu || !viewport) return checks;
  const scrolls = viewport.scrollHeight > viewport.clientHeight;
  checks.push({
    label: "Past four and a half rows the list scrolls",
    actual: `${viewport.scrollHeight}px in ${viewport.clientHeight}px`,
    pass: scrolls,
  });
  const wide = menu.scrollWidth <= menu.clientWidth;
  checks.push({
    label: "A long label never widens the menu past its edge",
    actual: `${menu.scrollWidth}/${menu.clientWidth}`,
    pass: wide,
  });
  // Opened from the keyboard, a menu highlights its first row; arrow keys scroll from there.
  menu.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  await frames(1);
  return checks;
}

export function overflow() {
  return (
    <TokenChecks title="Long menu" check={checkOverflow}>
      <Actions count={7} long />
    </TokenChecks>
  );
}

async function checkMaxVisible(host: HTMLElement): Promise<Check[]> {
  const checks = await checkOpen(host);
  const menu = popup();
  const viewport = menu?.firstElementChild as HTMLElement | null;
  if (!menu || !viewport) return checks;
  const rows = menu.querySelectorAll('[role="menuitem"]').length;
  const fits = viewport.scrollHeight <= viewport.clientHeight;
  checks.push({
    label: "maxVisibleItems={8} shows all eight rows without scrolling",
    actual: `${rows} rows, ${viewport.scrollHeight}px in ${viewport.clientHeight}px`,
    pass: rows === 8 && fits,
  });
  const cap = menu.style.getPropertyValue("--fui-popup-viewport-rows");
  checks.push({
    label: "The popup carries the row cap inline",
    actual: cap || "not set",
    pass: cap === "8.5",
  });
  return checks;
}

export function overflowMaxVisibleItems() {
  return (
    <TokenChecks title="Eight rows, no scroll" check={checkMaxVisible}>
      <Actions count={8} maxVisibleItems={8} />
    </TokenChecks>
  );
}

const checkLoading = oncePerHost(async (host) => {
  const started = performance.now();
  const checks = await checkOpen(host);
  const early = performance.now() - started < 600;
  const { checks: more, add } = recorder();
  const menu = popup();
  if (!menu) return checks;
  const row = () => menu.querySelector<HTMLElement>("[data-menu-loading]");
  add(
    "The menu is busy at once",
    menu.getAttribute("aria-busy") ?? "not set",
    menu.getAttribute("aria-busy") === "true"
  );
  // Read only while the check is still well inside the first second.
  if (early) add("No spinner row in the first second", row() ? "shown" : "none", !row());
  const shownAfter = await waitUntil(() => Boolean(row()), 3000);
  add(
    "A spinner row shows after a second",
    shownAfter < 0 ? "never" : `after ${shownAfter}ms`,
    shownAfter >= 0
  );
  const loadingRow = row();
  if (loadingRow) {
    add(
      "The row is a disabled item",
      loadingRow.getAttribute("aria-disabled") ?? "not set",
      loadingRow.getAttribute("aria-disabled") === "true"
    );
    add(
      "The row says Loading…",
      loadingRow.textContent ?? "",
      (loadingRow.textContent ?? "").includes("Loading…")
    );
    const ink = getComputedStyle(loadingRow).opacity;
    add("The row is not dimmed", ink, ink === "1");
  }
  return [...checks, ...more];
});

export function loading() {
  return (
    <TokenChecks title="Items loading on open" check={checkLoading}>
      <Actions count={2} loading />
    </TokenChecks>
  );
}

const checkEscape = oncePerHost(async (host) => {
  const checks = await checkOpen(host);
  const menu = popup();
  if (!menu) return checks;
  menu.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  const trigger = find(host, '[data-role="trigger"]');
  checks.push(...(await escapeCloses("menu", () => showing(popup()), trigger)));
  trigger.blur();
  return checks;
});

export function lifecycleDismiss() {
  return (
    <TokenChecks title="Escape" check={checkEscape}>
      <Actions />
    </TokenChecks>
  );
}
