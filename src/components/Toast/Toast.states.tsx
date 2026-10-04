/**
 * State fixtures for Toast, rendered by `pnpm run test:states`.
 *
 * @family:toast
 * @na:empty A toast always says what happened; it never shows empty.
 */
import * as React from "react";
import { Toast, useToast } from ".";
import { Stack } from "../Stack";
import styles from "./Toast.module.scss";
import { colorAs, oncePerHost, recorder } from "../../test/recipe-checks";
import { frames, TokenChecks, waitUntil, type Check } from "../../test/token-probe";

function toasts(host: HTMLElement) {
  return Array.from(host.querySelectorAll<HTMLElement>("[data-tone]")).filter(
    (node) => node.getAttribute("role") === "status" || node.getAttribute("role") === "alert"
  );
}

/** The plane is always raised and edgeless; only the icon carries the tone. */
function checkSurface(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const raised = colorAs(host, "var(--fui-bg-elevated)");
  for (const [index, toast] of toasts(host).entries()) {
    // Two toasts can share a tone; the ordinal keeps every label unique.
    const name = `Toast ${index + 1} (${toast.dataset.tone ?? "neutral"})`;
    const style = getComputedStyle(toast);
    add(`${name} is the raised plane`, style.backgroundColor, style.backgroundColor === raised);
    add(`${name} has no edge`, style.borderTopWidth, style.borderTopWidth === "0px");
    add(
      `${name} sits on the popup shadow`,
      style.boxShadow === "none" ? "none" : "shadow",
      style.boxShadow !== "none"
    );
    const title = toast.querySelector<HTMLElement>(`.${styles.title}`);
    if (title) {
      add(
        `${name} title is 12/550`,
        `${getComputedStyle(title).fontSize}/${getComputedStyle(title).fontWeight}`,
        getComputedStyle(title).fontSize === "12px"
      );
    }
  }
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Toast tones" check={checkSurface}>
      <Stack gap="sm" style={{ maxInlineSize: 384 }}>
        <Toast title="Draft saved" description="Kept until you publish." />
        <Toast title="Branch merged" description="Checks passed on main." tone="success" />
        <Toast title="Usage near the limit" description="9 of 10 seats in use." tone="warning" />
        <Toast
          title="Deleted 3 findings"
          action={{ label: "Undo", onClick: () => {}, undo: true }}
          onDismiss={() => {}}
        />
      </Stack>
    </TokenChecks>
  );
}

export function loading() {
  return (
    <TokenChecks title="Busy toast" check={checkSurface}>
      <div style={{ maxInlineSize: 384 }}>
        <Toast title="Uploading files" busy={{ done: 3, total: 12, onStop: () => {} }} />
      </div>
    </TokenChecks>
  );
}

export function error() {
  return (
    <TokenChecks title="Danger toast" check={checkSurface}>
      <div style={{ maxInlineSize: 384 }}>
        <Toast
          title="Push failed"
          description="The remote refused the branch."
          tone="danger"
          action={{ label: "Retry", onClick: () => {} }}
          onDismiss={() => {}}
        />
      </div>
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <TokenChecks title="Long toast" check={checkSurface}>
      <div style={{ maxInlineSize: 320 }}>
        <Toast
          title="Renamed feature/governance-contract-authoring-flow-and-approval-gate"
          description="Every open pull request, check run and review comment now points at the new branch name."
          onDismiss={() => {}}
        />
      </div>
    </TokenChecks>
  );
}

function ShowOnMount() {
  const { toast } = useToast();
  React.useEffect(() => {
    toast({
      id: "states-live",
      title: "Contract published",
      description: "Checks run against it from the next push.",
      tone: "success",
      duration: 0,
    });
  }, [toast]);
  return null;
}

/** The provider's portal and the first toast land after mount, so wait two frames. */
const checkLive = oncePerHost(async (): Promise<Check[]> => {
  await frames(2);
  const { checks, add } = recorder();
  const region = document.querySelector<HTMLElement>('[data-position="bottom-end"]');
  add("The live stack sits at the bottom end", region ? "bottom-end" : "missing", Boolean(region));
  // A live title is a heading: it keeps the static box, so it sits on the icon's line.
  await waitUntil(() => Boolean(region?.querySelector("h2")), 3000);
  const title = region?.querySelector<HTMLElement>("h2");
  const icon = region?.querySelector<HTMLElement>("span[data-tone]");
  if (title && icon) {
    const a = title.getBoundingClientRect();
    const b = icon.getBoundingClientRect();
    const offset = Math.abs(a.top + a.height / 2 - (b.top + b.height / 2));
    add("The live title sits on the icon's line", `${offset.toFixed(1)}px off`, offset <= 1);
  }
  return checks;
});

export function lifecycleLive() {
  return (
    <TokenChecks title="Live toast" check={checkLive}>
      <Toast.Provider>
        <ShowOnMount />
      </Toast.Provider>
    </TokenChecks>
  );
}
