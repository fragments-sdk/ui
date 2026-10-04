/**
 * The working recipe, read back from the browser: a list row an agent is working on carries
 * the brand wash, a 1px inset edge, a 1.8s sweep and a 2.4s sheen on its words; under reduced
 * motion the wash and edge stay and nothing moves; and when the work stops, every loop stops
 * in the same frame.
 *
 * @family:foundations
 * @tag:recipe-working
 */
import { useState } from "react";
import { Button } from "../components/Button";
import { Text } from "../components/Text";
import { colorAs, computedAs, find, near, recorder, oncePerHost } from "../test/recipe-checks";
import { TokenChecks, frames, readTime } from "../test/token-probe";
import styles from "./WorkingRecipe.states.module.scss";

// Keyframe names are scoped by the module build, so checks match them by stem.

function Rows() {
  const [working, setWorking] = useState(true);
  const mark = working ? "" : undefined;
  return (
    <ul className={styles.rows}>
      <li className={styles.row} data-working={mark} data-role="agent">
        <Text as="span" className={styles.words} data-working={mark} data-role="words">
          {working ? "Fixing 3 findings in web" : "Stopped: 1 of 3 findings fixed"}
        </Text>
        {working ? (
          <Button size="sm" variant="soft" data-role="stop" onClick={() => setWorking(false)}>
            Stop
          </Button>
        ) : null}
      </li>
      <li className={styles.row}>
        <Text as="span">api: 3 findings</Text>
      </li>
    </ul>
  );
}

function running(host: HTMLElement) {
  return host
    .getAnimations({ subtree: true })
    .filter((animation) => animation.playState === "running")
    .map((animation) =>
      "animationName" in animation ? (animation as CSSAnimation).animationName : "transition"
    );
}

function readArea(host: HTMLElement) {
  const row = find(host, '[data-role="agent"]');
  return { row, after: getComputedStyle(row, "::after") };
}

function edgeOf(host: HTMLElement) {
  return computedAs(
    host,
    "box-shadow",
    "inset 0 0 0 var(--fui-stroke-hairline) var(--fui-working-edge)"
  );
}

const checkWorking = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const sweep = readTime(host, "var(--fui-working-sweep-duration)");
  const sheen = readTime(host, "var(--fui-working-sheen-duration)");
  add("--fui-working-sweep-duration is 1.8s", `${sweep}ms`, near(sweep, 1800, 0.01));
  add("--fui-working-sheen-duration is 2.4s", `${sheen}ms`, near(sheen, 2400, 0.01));

  const { after } = readArea(host);
  const wash = colorAs(host, "var(--fui-working-wash)");
  add("The row carries the brand wash", after.backgroundColor, after.backgroundColor === wash);
  add("A 1px inset edge draws it in", after.boxShadow, after.boxShadow === edgeOf(host));
  add(
    "The sweep passes over the wash",
    after.backgroundImage.slice(0, 40),
    after.backgroundImage.includes("linear-gradient")
  );
  add(
    "The sweep loops every 1.8s",
    `${after.animationName} ${after.animationDuration} ${after.animationIterationCount}`,
    /fui-working-sweep/.test(after.animationName) &&
      after.animationDuration === "1.8s" &&
      after.animationIterationCount === "infinite"
  );
  const words = getComputedStyle(find(host, '[data-role="words"]'));
  add(
    "A sheen crosses the words every 2.4s",
    `${words.animationName} ${words.animationDuration} ${words.animationIterationCount}`,
    /fui-working-sheen/.test(words.animationName) &&
      words.animationDuration === "2.4s" &&
      words.animationIterationCount === "infinite"
  );
  const loops = running(host);
  add(
    "Both loops are running",
    loops.join(", ") || "none",
    loops.some((name) => /fui-working-sweep/.test(name)) &&
      loops.some((name) => /fui-working-sheen/.test(name))
  );
  return checks;
});

export function working() {
  return (
    <TokenChecks title="Working" check={checkWorking}>
      <Rows />
    </TokenChecks>
  );
}

/** Microtasks run; no frame has passed. */
async function settleMicrotasks() {
  for (let index = 0; index < 4; index += 1) await Promise.resolve();
}

const checkStop = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const before = running(host);
  add("Work is running", before.join(", ") || "none", before.length >= 2);
  let framed = false;
  requestAnimationFrame(() => {
    framed = true;
  });
  find<HTMLButtonElement>(host, '[data-role="stop"]').click();
  await settleMicrotasks();
  const after = running(host);
  add(
    "Every loop stops in the same frame",
    `${after.join(", ") || "none"}${framed ? " (a frame passed)" : ""}`,
    after.length === 0 && !framed
  );
  const { row, after: area } = readArea(host);
  add(
    "The wash and edge leave with it",
    `${row.hasAttribute("data-working") ? "still working" : "not working"}, ::after ${area.content}`,
    !row.hasAttribute("data-working") && area.content === "none"
  );
  return checks;
});

export function workingStop() {
  return (
    <TokenChecks title="Work stops" check={checkStop}>
      <Rows />
    </TokenChecks>
  );
}

const checkWorkingReducedMotion = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  add("Reduced motion is on", String(reduced), reduced);
  const { after } = readArea(host);
  const wash = colorAs(host, "var(--fui-working-wash)");
  add("The wash stays", after.backgroundColor, after.backgroundColor === wash);
  add("The edge stays", after.boxShadow, after.boxShadow === edgeOf(host));
  add("No sweep is painted", after.backgroundImage, after.backgroundImage === "none");
  add("The area holds still", after.animationName, after.animationName === "none");
  const words = getComputedStyle(find(host, '[data-role="words"]'));
  add("The words hold still", words.animationName, words.animationName === "none");
  const ink = colorAs(host, "var(--fui-text-tertiary)");
  add("The words rest in ink 3", words.color, words.color === ink);
  const loops = running(host);
  add("Nothing animates", loops.join(", ") || "none", loops.length === 0);
  return checks;
});

export function workingReducedMotion() {
  return (
    <TokenChecks title="Working under reduced motion" check={checkWorkingReducedMotion}>
      <Rows />
    </TokenChecks>
  );
}
