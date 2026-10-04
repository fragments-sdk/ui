/**
 * State fixtures for Skeleton, rendered by `pnpm run test:states`.
 *
 * @family:feedback
 * @na:populated A skeleton is the loading state; the loaded content replaces it.
 * @na:empty A skeleton stands in for content that is coming; an empty result shows EmptyState.
 * @na:error A skeleton never fails; a failed load replaces it with the errbox recipe.
 * @na:overflow A skeleton takes the geometry it is given and never holds text.
 * @na:lifecycle The swap from skeleton to content belongs to the caller; FeedbackRecipe proves it lands in place.
 */
import { Skeleton } from ".";
import { Stack } from "../Stack";
import { colorAs, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, type Check } from "../../test/token-probe";

function Rows() {
  return (
    <Stack gap="md">
      <Stack direction="row" gap="sm" align="center">
        <Skeleton shape="avatar" size="md" />
        <Skeleton shape="heading" width={160} />
      </Stack>
      <Skeleton.Text lines={3} />
      <Stack gap="none">
        <Skeleton shape="row" width="64%" />
        <Skeleton shape="row" width="48%" />
      </Stack>
      <Skeleton shape="control" size="md" />
    </Stack>
  );
}

/** The drawn bars: every element painted in the band. */
function bars(host: HTMLElement) {
  const band = colorAs(host, "var(--fui-bg-secondary)");
  return [...host.querySelectorAll<HTMLElement>("section *")].filter(
    (element) => getComputedStyle(element).backgroundColor === band
  );
}

async function checkLoading(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const all = bars(host);
  add("Every bar is drawn on the band", `${all.length} bar(s)`, all.length >= 7);
  const text = all.find((bar) => bar.matches(".textLine, [class*='text']"));
  add(
    "A text bar is 10px",
    `${text?.getBoundingClientRect().height ?? "none"}px`,
    !!text && Math.abs(text.getBoundingClientRect().height - 10) < 0.5
  );
  const tint = colorAs(host, "var(--fui-bg-active)");
  const overlays = all.map((bar) => getComputedStyle(bar, "::after"));
  add(
    "Every bar pulses",
    [...new Set(overlays.map((style) => style.animationName))].join(", "),
    overlays.every((style) => /skeleton-pulse/.test(style.animationName))
  );
  add(
    "The pulse is the press tint over the band",
    [...new Set(overlays.map((style) => style.backgroundColor))].join(", "),
    overlays.every((style) => style.backgroundColor === tint)
  );
  add(
    "No bar draws a gradient",
    [...new Set(all.map((bar) => getComputedStyle(bar).backgroundImage))].join(", "),
    all.every((bar) => getComputedStyle(bar).backgroundImage === "none")
  );
  return checks;
}

export function loading() {
  return (
    <TokenChecks title="Skeleton" check={checkLoading}>
      <Rows />
    </TokenChecks>
  );
}

async function checkStill(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  add("Reduced motion is on", String(reduced), reduced);
  const all = bars(host);
  const overlays = all.map((bar) => getComputedStyle(bar, "::after"));
  add(
    "Every bar holds still",
    [...new Set(overlays.map((style) => style.animationName))].join(", "),
    all.length > 0 && overlays.every((style) => style.animationName === "none")
  );
  add(
    "Every bar is one flat band",
    [...new Set(overlays.map((style) => style.opacity))].join(", "),
    overlays.every((style) => style.opacity === "0")
  );
  const running = host.getAnimations({ subtree: true }).length;
  add("Nothing animates", `${running} animation(s)`, running === 0);
  return checks;
}

export function loadingReducedMotion() {
  return (
    <TokenChecks title="Skeleton under reduced motion" check={checkStill}>
      <Rows />
    </TokenChecks>
  );
}
