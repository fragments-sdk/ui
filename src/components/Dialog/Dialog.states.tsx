/**
 * State fixtures for Dialog, rendered by `pnpm run test:states`.
 *
 * @family:overlays
 * @na:empty A dialog always carries a task; it never opens empty.
 */
import type { ReactNode } from "react";
import { Dialog } from ".";
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
import styles from "./Dialog.module.scss";

function panel() {
  return document.querySelector<HTMLElement>("[data-states-dialog]");
}

function footerEdge(surface: HTMLElement, overflows: boolean): Check[] {
  const footer = surface.querySelector<HTMLElement>(`.${styles.footer}`);
  if (!footer) return [{ label: "The dialog has a footer", actual: "missing", pass: false }];
  return footerEdgeChecks("The dialog", surface, footer, overflows);
}

function Rename({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  return (
    <Dialog defaultOpen>
      <Dialog.Trigger
        render={
          <Button variant="soft" data-role="trigger">
            Rename branch
          </Button>
        }
      />
      <Dialog.Content data-states-dialog="">
        <Dialog.Header>
          <Dialog.Title>Rename the branch</Dialog.Title>
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>{children}</Dialog.Body>
        {footer ? (
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="ghost">Cancel</Button>} />
            <Button>Rename</Button>
          </Dialog.Footer>
        ) : null}
      </Dialog.Content>
    </Dialog>
  );
}

async function checkOpen(): Promise<Check[]> {
  const { checks, add } = recorder();
  const opened = await framesUntil(() => panel()?.hasAttribute("data-open") ?? false);
  add("The dialog opens", opened < 0 ? "never" : `after ${opened} frame(s)`, opened >= 0);
  const surface = panel();
  if (!surface) return checks;
  await wait(260);
  checks.push(...overlayAtRestChecks("The dialog", surface));
  return checks;
}

async function checkPopulated(): Promise<Check[]> {
  const checks = await checkOpen();
  const surface = panel();
  if (surface) checks.push(...footerEdge(surface, false));
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Open dialog" check={checkPopulated}>
      <Rename>
        <Text as="p">Open pull requests from this branch move to the new name.</Text>
      </Rename>
    </TokenChecks>
  );
}

export function loading() {
  return (
    <TokenChecks title="Loading dialog" check={checkOpen}>
      <Rename>
        <Skeleton.Text lines={3} />
      </Rename>
    </TokenChecks>
  );
}

async function checkError(): Promise<Check[]> {
  const checks = await checkOpen();
  const box = panel()?.querySelector<HTMLElement>(`.${feedback.errbox}`);
  checks.push({
    label: "The failure shows an errbox where it happened",
    actual: box ? "in the dialog body" : "missing",
    pass: Boolean(box?.closest("[data-states-dialog]")),
  });
  return checks;
}

export function error() {
  return (
    <TokenChecks title="Dialog error" check={checkError}>
      <Rename footer={false}>
        <div className={feedback.errbox}>
          <span className={feedback.errboxIcon} aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6.25" />
              <path d="M8 4.75v3.75M8 10.75v.5" strokeLinecap="round" />
            </svg>
          </span>
          <p className={feedback.errboxWords}>Couldn’t rename the branch. It is protected.</p>
          <div className={feedback.errboxActions}>
            <Button size="sm" variant="soft">
              Retry
            </Button>
          </div>
        </div>
      </Rename>
    </TokenChecks>
  );
}

async function checkOverflow(): Promise<Check[]> {
  const checks = await checkOpen();
  const surface = panel();
  if (!surface) return checks;
  const box = surface.getBoundingClientRect();
  checks.push({
    label: "A long body keeps the dialog inside the viewport",
    actual: `${Math.round(box.top)}–${Math.round(box.bottom)} in ${innerHeight}`,
    pass: box.top >= 0 && box.bottom <= innerHeight,
  });
  checks.push(...footerEdge(surface, true));
  return checks;
}

export function overflow() {
  return (
    <TokenChecks title="Long dialog" check={checkOverflow}>
      <Rename>
        {Array.from({ length: 24 }, (_, index) => (
          <Text as="p" key={index}>
            Pull request {index + 1}: “Tokens for the card surface” moves to the new branch name.
          </Text>
        ))}
      </Rename>
    </TokenChecks>
  );
}

const checkEscape = oncePerHost(async (host) => {
  const checks = await checkOpen();
  const trigger = find(host, '[data-role="trigger"]');
  checks.push(...(await escapeCloses("dialog", () => Boolean(panel()), trigger, { limit: 20 })));
  trigger.blur();
  return checks;
});

export function lifecycleDismiss() {
  return (
    <TokenChecks title="Escape" check={checkEscape}>
      <Rename>
        <Text as="p">Open pull requests move to the new name.</Text>
      </Rename>
    </TokenChecks>
  );
}
