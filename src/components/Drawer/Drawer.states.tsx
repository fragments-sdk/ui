/**
 * State fixtures for Drawer, rendered by `pnpm run test:states`.
 *
 * @family:overlays
 * @na:empty A drawer opens on something to show; a list inside it shows its own empty state.
 */
import type { ReactNode } from "react";
import { Drawer } from ".";
import { Button } from "../Button";
import { Skeleton } from "../Skeleton";
import { Text } from "../Text";
import feedback from "../../recipes/FeedbackRecipe.states.module.scss";
import {
  escapeCloses,
  find,
  footerEdgeChecks,
  framesUntil,
  oncePerHost,
  overlayAtRestChecks,
  recorder,
} from "../../test/recipe-checks";
import { TokenChecks, wait, type Check } from "../../test/token-probe";
import styles from "./Drawer.module.scss";

function panel() {
  return document.querySelector<HTMLElement>("[data-states-drawer]");
}

function History({ children, footer = false }: { children: ReactNode; footer?: boolean }) {
  return (
    <Drawer defaultOpen>
      <Drawer.Trigger
        render={
          <Button variant="soft" data-role="trigger">
            Show history
          </Button>
        }
      />
      <Drawer.Content data-states-drawer="">
        <Drawer.Header>
          <Drawer.Title>History</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body>{children}</Drawer.Body>
        {footer ? (
          <Drawer.Footer>
            <Drawer.Close render={<Button variant="ghost">Close</Button>} />
          </Drawer.Footer>
        ) : null}
      </Drawer.Content>
    </Drawer>
  );
}

async function checkOpen(): Promise<Check[]> {
  const { checks, add } = recorder();
  const opened = await framesUntil(() => panel()?.hasAttribute("data-open") ?? false);
  add("The drawer opens", opened < 0 ? "never" : `after ${opened} frame(s)`, opened >= 0);
  const surface = panel();
  if (!surface) return checks;
  await wait(260);
  checks.push(...overlayAtRestChecks("The drawer", surface));
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Open drawer" check={checkOpen}>
      <History>
        <Text as="p">Three checks ran today. The last one passed at 14:02.</Text>
      </History>
    </TokenChecks>
  );
}

export function loading() {
  return (
    <TokenChecks title="Loading drawer" check={checkOpen}>
      <History>
        <Skeleton.Text lines={4} />
      </History>
    </TokenChecks>
  );
}

async function checkError(): Promise<Check[]> {
  const checks = await checkOpen();
  const box = panel()?.querySelector<HTMLElement>(`.${feedback.errbox}`);
  checks.push({
    label: "The failure shows an errbox where it happened",
    actual: box ? "in the drawer body" : "missing",
    pass: Boolean(box?.closest("[data-states-drawer]")),
  });
  return checks;
}

export function error() {
  return (
    <TokenChecks title="Drawer error" check={checkError}>
      <History>
        <div className={feedback.errbox}>
          <span className={feedback.errboxIcon} aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6.25" />
              <path d="M8 4.75v3.75M8 10.75v.5" strokeLinecap="round" />
            </svg>
          </span>
          <p className={feedback.errboxWords}>Couldn’t load the history. The request timed out.</p>
          <div className={feedback.errboxActions}>
            <Button size="sm" variant="soft">
              Retry
            </Button>
          </div>
        </div>
      </History>
    </TokenChecks>
  );
}

async function checkOverflow(): Promise<Check[]> {
  const checks = await checkOpen();
  const surface = panel();
  if (!surface) return checks;
  const box = surface.getBoundingClientRect();
  checks.push({
    label: "A long history keeps the drawer inside the viewport",
    actual: `${Math.round(box.top)}–${Math.round(box.bottom)} in ${innerHeight}`,
    pass: box.top >= 0 && box.bottom <= innerHeight,
  });
  const footer = surface.querySelector<HTMLElement>(`.${styles.footer}`);
  if (footer) checks.push(...footerEdgeChecks("The drawer", surface, footer, true));
  else checks.push({ label: "The drawer has a footer", actual: "missing", pass: false });
  return checks;
}

export function overflow() {
  return (
    <TokenChecks title="Long drawer" check={checkOverflow}>
      <History footer>
        {Array.from({ length: 40 }, (_, index) => (
          <Text as="p" key={index}>
            Check {40 - index} passed on fragments-sdk/a-repository-with-a-long-name.
          </Text>
        ))}
      </History>
    </TokenChecks>
  );
}

const checkEscape = oncePerHost(async (host) => {
  const checks = await checkOpen();
  const trigger = find(host, '[data-role="trigger"]');
  checks.push(...(await escapeCloses("drawer", () => Boolean(panel()), trigger, { limit: 20 })));
  trigger.blur();
  return checks;
});

export function lifecycleDismiss() {
  return (
    <TokenChecks title="Escape" check={checkEscape}>
      <History>
        <Text as="p">Three checks ran today.</Text>
      </History>
    </TokenChecks>
  );
}
