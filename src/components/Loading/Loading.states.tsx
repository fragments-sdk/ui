/**
 * State fixtures for Loading, rendered by `pnpm run test:states`.
 *
 * @family:feedback
 * @na:populated Loading is the loading state; the result replaces it.
 * @na:empty A spinner stands in for a result that is coming; an empty result shows EmptyState.
 * @na:error A spinner never fails; a failed wait replaces it with the errbox recipe.
 * @na:overflow A spinner has one fixed size; its label is read, not shown.
 */
import { Loading } from ".";
import { Stack } from "../Stack";
import { find, near, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, readTime, wait, type Check } from "../../test/token-probe";

function Spinners() {
  return (
    <Stack direction="row" gap="lg" align="center">
      <Loading delay={0} label="Loading findings" />
      <span>
        Checking the contract <Loading delay={0} inline label="Checking the contract" />
      </span>
    </Stack>
  );
}

async function turning(host: HTMLElement, label: string): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const spinner = find(host, '[role="status"] svg');
  const style = getComputedStyle(spinner);
  add(`${label}: the spinner turns`, style.animationName, /loading-spin/.test(style.animationName));
  const spin = readTime(host, "var(--fui-duration-spin)");
  add(
    `${label}: one turn takes --fui-duration-spin (700ms)`,
    `${style.animationDuration} / ${spin}ms`,
    style.animationDuration === "0.7s" && near(spin, 700, 1)
  );
  // The layout size, not the bounding box: a turning square's box grows with its angle.
  add(`${label}: one 16px size`, style.width, near(parseFloat(style.width), 16, 0.5));
  const turn = spinner.getAnimations()[0];
  const start = Number(turn?.currentTime ?? Number.NaN);
  await wait(120);
  const later = Number(turn?.currentTime ?? Number.NaN);
  add(
    `${label}: it keeps turning`,
    `${turn?.playState ?? "no animation"}, ${start.toFixed(0)}ms → ${later.toFixed(0)}ms`,
    turn?.playState === "running" && later > start
  );
  return checks;
}

export function loading() {
  return (
    <TokenChecks title="Spinner" check={(host) => turning(host, "Normally")}>
      <Spinners />
    </TokenChecks>
  );
}

async function checkReduced(host: HTMLElement): Promise<Check[]> {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const checks = await turning(host, "Under reduced motion");
  return [{ label: "Reduced motion is on", actual: String(reduced), pass: reduced }, ...checks];
}

export function loadingReducedMotion() {
  return (
    <TokenChecks title="Spinner under reduced motion" check={checkReduced}>
      <Spinners />
    </TokenChecks>
  );
}

async function checkDelay(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  add(
    "Nothing shows during the first second",
    String(host.querySelectorAll('[role="status"] svg').length),
    host.querySelectorAll('[role="status"] svg').length === 0
  );
  await wait(1100);
  add(
    "The spinner shows after the delay",
    String(host.querySelectorAll('[role="status"] svg').length),
    host.querySelectorAll('[role="status"] svg').length === 1
  );
  return checks;
}

export function lifecycle() {
  return (
    <TokenChecks title="Shows after the delay" check={checkDelay}>
      <Loading label="Loading findings" />
    </TokenChecks>
  );
}
