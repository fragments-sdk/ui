/**
 * State fixtures for Progress, rendered by `pnpm run test:states`.
 *
 * @family:feedback
 * @na:empty A bar at 0 is a value like any other; no work at all shows no bar.
 * @na:error A bar never fails; the surface that runs the work replaces it with the errbox recipe.
 */
import { Progress } from ".";
import { Stack } from "../Stack";
import { colorAs, computedAs, find, near, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, type Check } from "../../test/token-probe";

async function checkBar(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const track = find(host, "[role='progressbar'] > div:last-of-type");
  const indicator = track.firstElementChild as HTMLElement;
  const height = track.getBoundingClientRect().height;
  add("One 4px track", `${height}px`, near(height, 4));
  add(
    "The track is the band",
    getComputedStyle(track).backgroundColor,
    getComputedStyle(track).backgroundColor === colorAs(host, "var(--fui-bg-secondary)")
  );
  add(
    "The track sits on the control radius",
    getComputedStyle(track).borderTopLeftRadius,
    getComputedStyle(track).borderTopLeftRadius ===
      computedAs(host, "border-top-left-radius", "var(--fui-radius-control)")
  );
  add(
    "The fill is the selection colour",
    getComputedStyle(indicator).backgroundColor,
    getComputedStyle(indicator).backgroundColor === colorAs(host, "var(--fui-control-checked-bg)")
  );
  const filled = indicator.getBoundingClientRect().width / track.getBoundingClientRect().width;
  add("The fill is scaled to the value", filled.toFixed(2), near(filled, 0.6, 0.02));
  add(
    "The fill moves by transform, never by width",
    getComputedStyle(indicator).transitionProperty,
    getComputedStyle(indicator).transitionProperty === "transform" ||
      getComputedStyle(indicator).transitionDuration === "0s"
  );
  const header = find(host, "[role='progressbar'] > div:first-child");
  add(
    "Label and value are 11px in ink 2",
    `${getComputedStyle(header).fontSize} ${getComputedStyle(header).color}`,
    getComputedStyle(header).fontSize === "11px" &&
      getComputedStyle(header).color === colorAs(host, "var(--fui-text-secondary)")
  );
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Progress" check={checkBar}>
      <div style={{ inlineSize: 240 }}>
        <Progress value={60} label="Uploading" showValue />
      </div>
    </TokenChecks>
  );
}

export function populatedTones() {
  return (
    <div style={{ inlineSize: 240 }}>
      <Stack gap="md">
        <Progress value={42} tone="neutral" role="meter" label="Seats used" showValue />
        <Progress value={82} tone="warning" label="Storage nearly full" showValue />
        <Progress value={100} tone="danger" label="Storage full" showValue />
      </Stack>
    </div>
  );
}

async function checkRun(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const track = find(host, "[role='progressbar'] > div:last-of-type");
  const indicator = track.firstElementChild as HTMLElement;
  const style = getComputedStyle(indicator);
  const share = indicator.getBoundingClientRect().width / track.getBoundingClientRect().width;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  add(
    reduced
      ? "Under reduced motion the whole track holds at half strength"
      : "A 30% run travels the track",
    `${share.toFixed(2)} ${style.animationName} ${style.opacity}`,
    reduced
      ? near(share, 1, 0.02) && style.opacity === "0.5" && style.animationName === "none"
      : near(share, 0.3, 0.02) && /progress-run/.test(style.animationName)
  );
  return checks;
}

export function loading() {
  return (
    <TokenChecks title="Progress, not yet counted" check={checkRun}>
      <div style={{ inlineSize: 240 }}>
        <Progress value={null} label="Counting files" />
      </div>
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <div style={{ inlineSize: 160 }}>
      <Progress
        value={73}
        label="Indexing a repository whose name is far too long for the bar"
        showValue
      />
    </div>
  );
}

// From empty to full: the ends of the range, and a value past the end clamped.
export function lifecycleRange() {
  return (
    <div style={{ inlineSize: 240 }}>
      <Stack gap="md">
        <Progress value={0} label="Queued" showValue />
        <Progress value={100} label="Uploaded" showValue />
        <Progress value={140} label="Past the end, clamped" showValue />
      </Stack>
    </div>
  );
}
