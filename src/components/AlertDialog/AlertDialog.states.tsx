/**
 * State fixtures for AlertDialog, rendered by `pnpm run test:states`.
 *
 * @family:overlays
 * @na:empty An alert dialog always asks a question; it never opens empty.
 * @na:loading The question is known before it opens; the answer's work runs after it closes.
 * @na:overflow The question is a sentence; a long read belongs in Dialog.
 */
import type { ReactNode } from "react";
import { AlertDialog } from ".";
import { Button } from "../Button";
import feedback from "../../recipes/FeedbackRecipe.states.module.scss";
import {
  escapeCloses,
  find,
  framesUntil,
  oncePerHost,
  overlayAtRestChecks,
  recorder,
} from "../../test/recipe-checks";
import { TokenChecks, wait, type Check } from "../../test/token-probe";

function panel() {
  return document.querySelector<HTMLElement>("[data-states-alert-dialog]");
}

function Question({ children }: { children?: ReactNode }) {
  return (
    <AlertDialog defaultOpen>
      <AlertDialog.Trigger
        render={
          <Button variant="soft" data-role="trigger">
            Delete branch
          </Button>
        }
      />
      <AlertDialog.Content data-states-alert-dialog="">
        <AlertDialog.Header>
          <AlertDialog.Title>Delete the branch?</AlertDialog.Title>
          <AlertDialog.Description>Its 3 open findings close with it.</AlertDialog.Description>
        </AlertDialog.Header>
        {children ? <AlertDialog.Body>{children}</AlertDialog.Body> : null}
        <AlertDialog.Footer>
          <AlertDialog.Cancel render={<Button variant="ghost">Cancel</Button>} />
          <AlertDialog.Action
            render={
              <Button variant="solid" tone="danger">
                Delete branch
              </Button>
            }
          />
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}

async function checkOpen(): Promise<Check[]> {
  const { checks, add } = recorder();
  const opened = await framesUntil(() => panel()?.hasAttribute("data-open") ?? false);
  add("The alert dialog opens", opened < 0 ? "never" : `after ${opened} frame(s)`, opened >= 0);
  const surface = panel();
  if (!surface) return checks;
  await wait(260);
  checks.push(...overlayAtRestChecks("The alert dialog", surface));
  const cancel = surface.querySelector("[data-alert-dialog-cancel]");
  add(
    "Focus starts on Cancel",
    document.activeElement === cancel ? "Cancel" : String(document.activeElement?.textContent),
    document.activeElement === cancel
  );
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Open alert dialog" check={checkOpen}>
      <Question />
    </TokenChecks>
  );
}

async function checkError(): Promise<Check[]> {
  const checks = await checkOpen();
  const box = panel()?.querySelector<HTMLElement>(`.${feedback.errbox}`);
  checks.push({
    label: "A failed answer shows an errbox in the sheet",
    actual: box ? "in the body" : "missing",
    pass: Boolean(box?.closest("[data-states-alert-dialog]")),
  });
  return checks;
}

export function error() {
  return (
    <TokenChecks title="Alert dialog error" check={checkError}>
      <Question>
        <div className={feedback.errbox}>
          <span className={feedback.errboxIcon} aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6.25" />
              <path d="M8 4.75v3.75M8 10.75v.5" strokeLinecap="round" />
            </svg>
          </span>
          <p className={feedback.errboxWords}>Couldn’t delete the branch. It is protected.</p>
        </div>
      </Question>
    </TokenChecks>
  );
}

const checkEscape = oncePerHost(async (host) => {
  const checks = await checkOpen();
  const trigger = find(host, '[data-role="trigger"]');
  checks.push(
    ...(await escapeCloses("alert dialog", () => Boolean(panel()), trigger, { limit: 20 }))
  );
  trigger.blur();
  return checks;
});

export function lifecycleDismiss() {
  return (
    <TokenChecks title="Escape" check={checkEscape}>
      <Question />
    </TokenChecks>
  );
}
