/**
 * The feedback recipes, read back from the browser: the loading phases on a hand-driven clock,
 * empty and no-results copy, the errbox where a request failed, dismissal that hands focus on,
 * and the shared announcer.
 *
 * @family:foundations
 * @tag:recipe-feedback
 */
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Field } from "../components/Field";
import { Input } from "../components/Input";
import { Loading } from "../components/Loading";
import { Progress } from "../components/Progress";
import { Skeleton } from "../components/Skeleton";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";
import {
  colorOf,
  computedAs,
  colorAs,
  fillOf,
  find,
  framesUntil,
  near,
  oncePerHost,
  recorder,
} from "../test/recipe-checks";
import {
  TokenChecks,
  contrast,
  frames,
  readLength,
  readTime,
  wait,
  type Check,
} from "../test/token-probe";
import { useAnnounce } from "../utils/a11y";
import { LOADING_DELAY_MS, LOADING_SLOW_MS, useLoadingPhase, type LoadingTimers } from "./loading";
import styles from "./FeedbackRecipe.states.module.scss";

/** A clock the fixture moves by hand, so fifteen seconds of waiting run in a few frames. */
function createClock() {
  let now = 0;
  let next = 0;
  const pending = new Map<number, { at: number; callback: () => void }>();
  const listeners = new Set<() => void>();
  const timers: LoadingTimers = {
    setTimeout: (callback, ms) => {
      next += 1;
      pending.set(next, { at: now + ms, callback });
      return next;
    },
    clearTimeout: (handle) => {
      pending.delete(handle as number);
    },
  };
  return {
    timers,
    now: () => now,
    /** Timers set and not yet run. */
    pending: () => pending.size,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Move to `time`, running each timer that falls due on the way, in order. */
    advanceTo(time: number) {
      for (;;) {
        const due = [...pending]
          .filter(([, timer]) => timer.at <= time)
          .sort(([, a], [, b]) => a.at - b.at)[0];
        if (!due) break;
        pending.delete(due[0]);
        now = due[1].at;
        due[1].callback();
      }
      now = time;
      for (const listener of listeners) listener();
    },
  };
}

const clock = createClock();

/** Three requests: one done before loading UI is due, one in the skeleton band, one slow. */
const REQUESTS = [
  { name: "a", resolveAt: 500, result: "web: 12 findings" },
  { name: "b", resolveAt: 4000, result: "api: 3 findings" },
  { name: "c", resolveAt: 15_000, result: "docs: 40 findings" },
];

/** A request that resolves at `resolveAt` ms on the fixture clock. */
function Request({ name, resolveAt, result }: { name: string; resolveAt: number; result: string }) {
  const now = useSyncExternalStore(clock.subscribe, clock.now);
  const phase = useLoadingPhase(now < resolveAt, { timers: clock.timers });
  const row = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = row.current;
    if (!element) return;
    const seen = new Set((element.dataset.seen ?? "").split(" ").filter(Boolean));
    seen.add(phase);
    element.dataset.seen = [...seen].join(" ");
  }, [phase]);
  return (
    <div ref={row} className={styles.slot} data-request={name} data-phase={phase}>
      {phase === "loading" ? <Skeleton fill /> : null}
      {phase === "slow" ? (
        <Stack direction="row" gap="sm" align="center">
          <Progress label={`Loading ${result}`} />
          <Button size="sm" variant="soft">
            Cancel
          </Button>
        </Stack>
      ) : null}
      {phase === "idle" ? (
        <Text as="p" data-role="result">
          {result}
        </Text>
      ) : null}
    </div>
  );
}

function shows(slot: HTMLElement) {
  return {
    skeleton: Boolean(slot.querySelector(':scope > [aria-hidden="true"]')),
    progress: Boolean(slot.querySelector('[role="progressbar"]')),
    spinner: Boolean(slot.querySelector('[role="status"]')),
    cancel: [...slot.querySelectorAll("button")].some((button) => button.textContent === "Cancel"),
    result: Boolean(slot.querySelector('[data-role="result"]')),
  };
}

function describeShows(slot: HTMLElement) {
  const shown = Object.entries(shows(slot))
    .filter(([, on]) => on)
    .map(([name]) => name);
  return shown.length > 0 ? shown.join(" + ") : "nothing";
}

const checkLoading = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  const slot = (name: string) => find(host, `[data-request="${name}"]`);
  // Each request's phase at `time`, from the thresholds; a step waits until React has drawn it,
  // so a slow engine reads the frame the clock describes rather than the one before.
  const phaseAt = (time: number, resolveAt: number) =>
    time >= resolveAt
      ? "idle"
      : time < LOADING_DELAY_MS
        ? "quiet"
        : time < LOADING_SLOW_MS
          ? "loading"
          : "slow";
  const step = async (time: number) => {
    clock.advanceTo(time);
    await framesUntil(
      () =>
        REQUESTS.every(
          ({ name, resolveAt }) => slot(name).dataset.phase === phaseAt(time, resolveAt)
        ),
      30
    );
    await frames(1);
  };
  add("Loading UI waits 1s", `${LOADING_DELAY_MS}ms`, LOADING_DELAY_MS === 1000);
  add("A wait is slow after 10s", `${LOADING_SLOW_MS}ms`, LOADING_SLOW_MS === 10_000);
  // Each request sets its two timers in an effect; the clock starts once all are set.
  const armed = await framesUntil(() => clock.pending() === REQUESTS.length * 2, 60);
  add("Every request is waiting on the clock", `${clock.pending()} timer(s)`, armed >= 0);

  await step(400);
  for (const name of ["a", "b", "c"]) {
    const nothing = !Object.values(shows(slot(name))).some(Boolean);
    add(`Request ${name.toUpperCase()} at 0.4s shows nothing`, describeShows(slot(name)), nothing);
  }

  await step(500);
  const a = slot("a");
  add("Request A resolves at 0.5s with its result", describeShows(a), shows(a).result);
  add(
    "Request A never showed loading UI",
    a.dataset.seen ?? "",
    !/\b(loading|slow)\b/.test(a.dataset.seen ?? "")
  );

  await step(3900);
  const b = slot("b");
  const skeleton = b.querySelector<HTMLElement>(':scope > [aria-hidden="true"]');
  add("Request B at 3.9s shows a skeleton", describeShows(b), Boolean(skeleton));
  const slotBox = b.getBoundingClientRect();
  if (skeleton) {
    const box = skeleton.getBoundingClientRect();
    add(
      "The skeleton fills the result's slot (its final geometry)",
      `${box.width}x${box.height} in ${slotBox.width}x${slotBox.height}`,
      near(box.width, slotBox.width) && near(box.height, slotBox.height)
    );
    const name = getComputedStyle(skeleton, "::after").animationName;
    add("The skeleton pulses", name, /skeleton-pulse/.test(name));
  }
  add(
    "Request C at 3.9s also shows a skeleton",
    describeShows(slot("c")),
    shows(slot("c")).skeleton
  );

  await step(4000);
  add("Request B resolves at 4s", describeShows(b), shows(b).result);
  const resolvedBox = b.getBoundingClientRect();
  add(
    "The result lands in the box the skeleton held",
    `${slotBox.height}px → ${resolvedBox.height}px`,
    near(resolvedBox.height, slotBox.height, 0.01)
  );

  await step(10_100);
  const c = slot("c");
  add("Request C past 10s shows progress", describeShows(c), shows(c).progress);
  add("Request C past 10s offers Cancel", describeShows(c), shows(c).cancel);
  add(
    "Request C showed a skeleton first",
    c.dataset.seen ?? "",
    /\bloading\b/.test(c.dataset.seen ?? "")
  );

  await step(15_000);
  add("Request C resolves at 15s", describeShows(c), shows(c).result);
  return checks;
});

export function loading() {
  return (
    <TokenChecks title="Loading thresholds" check={checkLoading}>
      <Stack gap="sm">
        {REQUESTS.map((request) => (
          <Request key={request.name} {...request} />
        ))}
      </Stack>
    </TokenChecks>
  );
}

const checkLoadingReducedMotion = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  add("Reduced motion is on", String(reduced), reduced);

  const band = find(host, `.${styles.slot} [aria-hidden="true"]`);
  const style = getComputedStyle(band);
  add("The skeleton holds still", style.animationName, style.animationName === "none");
  add("The skeleton is one flat band", style.backgroundImage, style.backgroundImage === "none");
  const fill = colorAs(host, "var(--fui-bg-secondary)");
  add("The band is the skeleton fill", style.backgroundColor, style.backgroundColor === fill);

  const spinner = find(host, '[role="status"] svg');
  const name = getComputedStyle(spinner).animationName;
  add("The spinner still runs its turn", name, /loading-spin/.test(name));
  const turn = spinner.getAnimations()[0];
  const start = Number(turn?.currentTime ?? Number.NaN);
  await wait(150);
  const later = Number(turn?.currentTime ?? Number.NaN);
  add(
    "The spinner keeps turning (essential progress)",
    `${turn?.playState ?? "no animation"}, ${start.toFixed(0)}ms → ${later.toFixed(0)}ms`,
    turn?.playState === "running" && later > start
  );
  const spin = readTime(host, "var(--fui-duration-spin)");
  add("One turn takes --fui-duration-spin (700ms)", `${spin}ms`, near(spin, 700, 1));
  return checks;
});

export function loadingReducedMotion() {
  return (
    <TokenChecks title="Loading under reduced motion" check={checkLoadingReducedMotion}>
      <Stack gap="md">
        <div className={styles.slot}>
          <Skeleton fill />
        </div>
        <Loading delay={0} label="Loading findings" />
      </Stack>
    </TokenChecks>
  );
}

function checkEmpty(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const text = host.querySelector("section")?.textContent ?? "";
  const buttons = host.querySelectorAll("button");
  add("Says what this is", text.slice(0, 40), /repositories/i.test(text));
  add("Offers one action", `${buttons.length} button(s)`, buttons.length === 1);
  add("Never shows a fake zero", text.slice(0, 60), !/\b0\b/.test(text));
  return checks;
}

export function empty() {
  return (
    <TokenChecks title="Empty" check={checkEmpty}>
      <EmptyState>
        <EmptyState.Title>No repositories connected</EmptyState.Title>
        <EmptyState.Description>
          Connect a repository to see its findings here.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button>Connect repository</Button>
        </EmptyState.Actions>
      </EmptyState>
    </TokenChecks>
  );
}

function checkNoResults(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const state = find(host, "[data-role='no-results']");
  const text = state.textContent ?? "";
  add("Names the query", text, text.includes("zebra"));
  add("Says how to widen the search", text, /clear the search/i.test(text));
  const buttons = state.querySelectorAll("button");
  add("Offers one action", `${buttons.length} button(s)`, buttons.length === 1);
  return checks;
}

export function emptyNoResults() {
  return (
    <TokenChecks title="No results" check={checkNoResults}>
      <Stack gap="md">
        <Field>
          <Field.Label>Search repositories</Field.Label>
          <Input type="search" defaultValue="zebra" count="0 of 24" />
        </Field>
        <div data-role="no-results">
          <EmptyState>
            <EmptyState.Title>No repositories match “zebra”</EmptyState.Title>
            <EmptyState.Description>
              Check the spelling, or clear the search to see every repository.
            </EmptyState.Description>
            <EmptyState.Actions>
              <Button variant="soft">Clear search</Button>
            </EmptyState.Actions>
          </EmptyState>
        </div>
      </Stack>
    </TokenChecks>
  );
}

/** The errbox corner: nested inside the surface corner at a 12px inset. */
const NESTED_RADIUS =
  "calc(max(0px, (var(--fui-radius-surface) - 12px)) + min(var(--fui-radius-indicator), 6px) - clamp(0px, (var(--fui-radius-surface) - 12px) * 1000, min(var(--fui-radius-indicator), 6px)))";

function checkError(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const box = find(host, `.${styles.errbox}`);
  const style = getComputedStyle(box);
  const tint = colorAs(host, "var(--fui-color-danger-tint)");
  add("The errbox is the danger tint", style.backgroundColor, style.backgroundColor === tint);
  const pads = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft];
  add(
    "Padded 12 on every side",
    pads.join(" "),
    pads.every((pad) => pad === "12px")
  );
  const radius = readLength(host, NESTED_RADIUS);
  add(
    "Its corner nests inside the surface corner",
    `${style.borderTopLeftRadius} (expected ${radius}px)`,
    near(parseFloat(style.borderTopLeftRadius), radius, 0.01)
  );
  const icon = find(box, `.${styles.errboxIcon}`);
  const danger = computedAs(host, "color", "var(--fui-color-danger-text)");
  add(
    "The icon is danger text",
    getComputedStyle(icon).color,
    getComputedStyle(icon).color === danger
  );
  add(
    "The icon is drawn",
    String(Boolean(icon.querySelector("svg"))),
    Boolean(icon.querySelector("svg"))
  );
  const words = find(box, `.${styles.errboxWords}`);
  const ink = computedAs(host, "color", "var(--fui-text-primary)");
  add("The words are ink 1", getComputedStyle(words).color, getComputedStyle(words).color === ink);
  const ratio = contrast(colorOf(getComputedStyle(words).color), fillOf(box));
  add("The words read at 4.5:1 on the tint", ratio.toFixed(2), ratio >= 4.5);
  const buttons = box.querySelectorAll("button");
  add("One action", `${buttons.length} button(s)`, buttons.length === 1);
  return checks;
}

export function error() {
  return (
    <TokenChecks title="Error" check={checkError}>
      <Card>
        <Card.Body>
          <div className={styles.errbox}>
            <span className={styles.errboxIcon} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6.25" />
                <path d="M8 4.75v3.75M8 10.75v.5" strokeLinecap="round" />
              </svg>
            </span>
            <p className={styles.errboxWords}>Couldn’t load findings. The request timed out.</p>
            <div className={styles.errboxActions}>
              <Button size="sm" variant="soft">
                Retry
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </TokenChecks>
  );
}

/** Microtasks run; no frame has passed. */
async function settleMicrotasks() {
  for (let index = 0; index < 4; index += 1) await Promise.resolve();
}

const checkDismiss = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const close = find<HTMLButtonElement>(host, 'button[aria-label="Dismiss alert"]');
  const alert = close.closest<HTMLElement>('[role="status"]');
  add("The alert has one close action", String(Boolean(alert)), Boolean(alert));
  const next = find<HTMLButtonElement>(host, '[data-role="next"]');
  close.focus();
  let framed = false;
  requestAnimationFrame(() => {
    framed = true;
  });
  close.click();
  await settleMicrotasks();
  add(
    "The alert leaves before the next frame, with no exit motion",
    `${alert?.isConnected ? "still mounted" : "gone"}${framed ? " after a frame" : ""}`,
    Boolean(alert) && !alert!.isConnected && !framed
  );
  add(
    "Focus moves to the next item, never to the page",
    document.activeElement?.textContent ?? "none",
    document.activeElement === next
  );
  return checks;
});

export function lifecycleDismiss() {
  return (
    <TokenChecks title="Dismiss" check={checkDismiss}>
      <Stack gap="md">
        <Alert tone="info">
          <Alert.Body>
            <Alert.Title>Repository connected</Alert.Title>
          </Alert.Body>
          <Alert.Close />
        </Alert>
        <div>
          <Button data-role="next">Open repository</Button>
        </div>
      </Stack>
    </TokenChecks>
  );
}

function SaveButton() {
  const { announce } = useAnnounce();
  return <Button onClick={() => announce("Changes saved")}>Save</Button>;
}

function DeleteButton() {
  const { announce } = useAnnounce();
  return (
    <Button variant="soft" onClick={() => announce("Couldn’t delete the branch", "assertive")}>
      Delete branch
    </Button>
  );
}

const checkAnnouncer = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  // The regions mount in an effect, before anything is said.
  await framesUntil(() => document.querySelector("[data-fui-announcer]") !== null, 60);
  await frames(1);
  const polite = document.querySelectorAll<HTMLElement>('[data-fui-announcer="polite"]');
  const assertive = document.querySelectorAll<HTMLElement>('[data-fui-announcer="assertive"]');
  add("One polite region for every caller", `${polite.length}`, polite.length === 1);
  add("One assertive region for every caller", `${assertive.length}`, assertive.length === 1);
  const region = polite[0];
  const urgent = assertive[0];
  if (!region || !urgent) return checks;
  add(
    "The regions are mounted empty",
    JSON.stringify([region.textContent, urgent.textContent]),
    region.textContent === "" && urgent.textContent === ""
  );
  add(
    "The polite region is a status",
    `${region.getAttribute("role")} / ${region.getAttribute("aria-live")}`,
    region.getAttribute("role") === "status" && region.getAttribute("aria-live") === "polite"
  );
  add(
    "The assertive region is an alert",
    `${urgent.getAttribute("role")} / ${urgent.getAttribute("aria-live")}`,
    urgent.getAttribute("role") === "alert" && urgent.getAttribute("aria-live") === "assertive"
  );

  const said: string[] = [];
  const observer = new MutationObserver(() => {
    if (region.textContent) said.push(region.textContent);
  });
  observer.observe(region, { childList: true, characterData: true, subtree: true });
  const save = find<HTMLButtonElement>(host, '[data-role="save"] button');
  save.click();
  save.click();
  // The message lands a frame or more after the press; a second copy would land a frame later.
  await framesUntil(() => region.textContent === "Changes saved");
  await frames(2);
  observer.disconnect();
  add(
    "The message lands in the polite region",
    region.textContent ?? "",
    region.textContent === "Changes saved"
  );
  add(
    "A message posted twice before it lands is said once",
    JSON.stringify(said),
    said.length === 1
  );
  return checks;
});

export function announcer() {
  return (
    <TokenChecks title="Announcer" check={checkAnnouncer}>
      <Stack direction="row" gap="md">
        <span data-role="save">
          <SaveButton />
        </span>
        <DeleteButton />
      </Stack>
    </TokenChecks>
  );
}
