/**
 * The action recipe, read back from the browser: pending holds its width and swallows the
 * second press, press scales only a plain control, and disabled dims once at the outermost
 * element while a focusable disabled button stays in the tab order.
 *
 * @family:foundations
 * @tag:recipe-action
 */
import { useRef, useState } from "react";
import { Button } from "../components/Button";
import { Fieldset } from "../components/Fieldset";
import { Stack } from "../components/Stack";
import { effectiveOpacity, find, near, recorder } from "../test/recipe-checks";
import {
  TokenChecks,
  frames,
  framesUntil,
  readOpacity,
  readTime,
  settle,
  wait,
  type Check,
  type InteractionCheck,
} from "../test/token-probe";

/** Work that takes three seconds, started by a press. */
function SaveButton() {
  const [pending, setPending] = useState(false);
  const presses = useRef(0);
  const [count, setCount] = useState(0);
  return (
    <Button
      data-role="pending"
      data-presses={count}
      pending={pending}
      onClick={() => {
        presses.current += 1;
        setCount(presses.current);
        setPending(true);
        setTimeout(() => setPending(false), 3000);
      }}
    >
      Save changes
    </Button>
  );
}

function opacityOf(element: Element) {
  return parseFloat(getComputedStyle(element).opacity);
}

// StrictMode runs the check twice on one host; the pending timeline must run once.
const pendingRuns = new WeakMap<HTMLElement, Promise<Check[]>>();

async function runPending(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  const button = find<HTMLButtonElement>(host, '[data-role="pending"]');
  const label = find(button, ":scope > span:not([aria-hidden])");
  const spinner = find(button, ':scope > span[aria-hidden="true"]');
  const delay = readTime(host, "var(--fui-pending-delay)");
  add("--fui-pending-delay is 1s", `${delay}ms`, near(delay, 1000, 1));

  const width = button.getBoundingClientRect().width;
  button.click();
  await framesUntil(() => button.getAttribute("aria-busy") === "true");
  add(
    "aria-busy is true as soon as the work starts",
    String(button.getAttribute("aria-busy")),
    button.getAttribute("aria-busy") === "true"
  );

  await wait(500);
  add("At 0.5s the label still shows", `${opacityOf(label)}`, opacityOf(label) > 0.99);
  add("At 0.5s no spinner shows", `${opacityOf(spinner)}`, opacityOf(spinner) < 0.01);
  button.click();
  await frames(2);
  add(
    "A second press while pending does nothing",
    `${button.dataset.presses} press(es) handled`,
    button.dataset.presses === "1"
  );

  await wait(900);
  add("At 1.4s the label is hidden in place", `${opacityOf(label)}`, opacityOf(label) < 0.01);
  add("At 1.4s the spinner shows", `${opacityOf(spinner)}`, opacityOf(spinner) > 0.99);
  const pendingWidth = button.getBoundingClientRect().width;
  add(
    "The width is unchanged to the pixel",
    `${width}px → ${pendingWidth}px`,
    Math.abs(pendingWidth - width) < 0.01
  );
  add(
    "The spinner turns",
    getComputedStyle(find(spinner, "svg")).animationName,
    getComputedStyle(find(spinner, "svg")).animationName !== "none"
  );
  add(
    "The pending button never scales",
    getComputedStyle(button).scale,
    getComputedStyle(button).scale === "none"
  );

  // The work resolves at 3s; the label comes back at once.
  await wait(1900);
  await framesUntil(() => !button.hasAttribute("aria-busy"));
  add(
    "aria-busy clears when the work resolves",
    String(button.getAttribute("aria-busy")),
    !button.hasAttribute("aria-busy")
  );
  await wait(250);
  add("The label returns after the work resolves", `${opacityOf(label)}`, opacityOf(label) > 0.99);
  return checks;
}

function checkPending(host: HTMLElement) {
  const running = pendingRuns.get(host) ?? runPending(host);
  pendingRuns.set(host, running);
  return running;
}

export function pending() {
  return (
    <TokenChecks title="Pending" check={checkPending}>
      <SaveButton />
    </TokenChecks>
  );
}

function checkPressAtRest(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const scale = readOpacity(host, "var(--fui-press-scale)");
  add("--fui-press-scale is 0.985", String(scale), near(scale, 0.985, 0.0001));
  for (const button of host.querySelectorAll<HTMLElement>("[data-press]")) {
    const rest = getComputedStyle(button).scale;
    add(`${button.textContent} does not scale at rest`, rest, rest === "none");
  }
  return checks;
}

/** While pressed: a plain button scales to 0.985; the others never scale. */
const checkPress: InteractionCheck = (interaction, element) => {
  if (interaction !== "press") return [];
  const button = element.closest<HTMLElement>("[data-press]");
  if (!button) return [];
  settle(button);
  const scale = getComputedStyle(button).scale;
  const expected = button.dataset.press ?? "none";
  return [
    {
      label: `${button.textContent} scales to ${expected} while pressed`,
      actual: scale,
      pass: expected === "none" ? scale === "none" : near(parseFloat(scale), +expected, 0.0001),
    },
  ];
};

export function press() {
  return (
    <TokenChecks title="Press" check={checkPressAtRest} interact={checkPress}>
      <Stack direction="row" gap="md" wrap>
        <Button data-press="0.985" data-states-interact="press">
          Save
        </Button>
        <Button data-press="none" data-states-interact="press" aria-haspopup="menu">
          Options
        </Button>
        <Button data-press="none" data-states-interact="press" pending>
          Saving
        </Button>
        <Button data-press="none" data-states-interact="press" disabled focusableWhenDisabled>
          Unavailable
        </Button>
      </Stack>
    </TokenChecks>
  );
}

function checkDisabledOnce(host: HTMLElement): Check[] {
  const { checks, add } = recorder();
  const dim = readOpacity(host, "var(--fui-opacity-disabled)");
  add("--fui-opacity-disabled is 0.45", String(dim), near(dim, 0.45, 0.0001));

  const fieldset = find(host, "fieldset");
  const nested = find<HTMLButtonElement>(fieldset, "button");
  add(
    "The disabled Fieldset dims",
    `${opacityOf(fieldset)}`,
    near(opacityOf(fieldset), dim, 0.001)
  );
  add("The button inside does not dim again", `${opacityOf(nested)}`, opacityOf(nested) === 1);
  const effective = effectiveOpacity(nested);
  add(
    "The nested button is painted at 0.45 once, never 0.2",
    effective.toFixed(4),
    near(effective, dim, 0.001)
  );
  add(
    "The nested button shows cursor not-allowed",
    getComputedStyle(nested).cursor,
    getComputedStyle(nested).cursor === "not-allowed"
  );

  const lone = find<HTMLButtonElement>(host, '[data-role="lone"]');
  add("A disabled button on its own dims", `${opacityOf(lone)}`, near(opacityOf(lone), dim, 0.001));
  const label = lone.firstElementChild;
  if (label) {
    add(
      "Its label does not dim again",
      `${effectiveOpacity(label).toFixed(4)}`,
      near(effectiveOpacity(label), dim, 0.001)
    );
  }

  const focusable = find<HTMLButtonElement>(host, '[data-role="focusable"]');
  add(
    "focusableWhenDisabled keeps the button in the tab order",
    `tabIndex ${focusable.tabIndex}, disabled ${focusable.disabled}, aria-disabled ${focusable.getAttribute("aria-disabled")}`,
    focusable.tabIndex >= 0 &&
      !focusable.disabled &&
      focusable.getAttribute("aria-disabled") === "true"
  );
  add(
    "The focusable disabled button dims",
    `${opacityOf(focusable)}`,
    near(opacityOf(focusable), dim, 0.001)
  );
  add(
    "The focusable disabled button shows cursor not-allowed",
    getComputedStyle(focusable).cursor,
    getComputedStyle(focusable).cursor === "not-allowed"
  );
  return checks;
}

export function disabledOnce() {
  return (
    <TokenChecks title="Disabled once" check={checkDisabledOnce}>
      <Stack gap="md">
        <Fieldset disabled>
          <Fieldset.Legend>Billing</Fieldset.Legend>
          <Stack direction="row" gap="md">
            <Button disabled>Update card</Button>
          </Stack>
        </Fieldset>
        <Stack direction="row" gap="md">
          <Button data-role="lone" disabled pending={false}>
            Archive
          </Button>
          <Button data-role="focusable" data-states-interact="focus" disabled focusableWhenDisabled>
            Publish
          </Button>
        </Stack>
      </Stack>
    </TokenChecks>
  );
}
