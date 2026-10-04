/**
 * Popup and overlay motion, read back from the browser. Menu, select list, popover and tooltip
 * appear and leave at once, with no scale and no travel, 4 from the anchor and 8 inside the
 * viewport; dialog, drawer and scrim fade in 200ms and out 100ms on the one easing, and under
 * reduced motion they fade only.
 *
 * @family:foundations
 * @tag:recipe-motion
 */
import { useLayoutEffect, useState } from "react";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { Drawer } from "../components/Drawer";
import { Menu } from "../components/Menu";
import { Popover } from "../components/Popover";
import { Select } from "../components/Select";
import { Stack } from "../components/Stack";
import { Text } from "../components/Text";
import { Tooltip } from "../components/Tooltip";
import {
  anchorGap,
  durationsOf,
  find,
  framesUntil,
  near,
  oncePerHost,
  popupSettled,
  recorder,
  stillPopupChecks,
} from "../test/recipe-checks";
import { TokenChecks, frames, readLength, readTime, wait } from "../test/token-probe";
import { POPUP_COLLISION_PADDING_PX, POPUP_OFFSET_PX } from "./popup";

type Add = ReturnType<typeof recorder>["add"];

/** Open and close each surface from the check, by name. */
const openers = new Map<string, (open: boolean) => void>();

function useOpener(name: string) {
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    openers.set(name, setOpen);
    return () => {
      openers.delete(name);
    };
  }, [name]);
  return open;
}

function setOpen(name: string, open: boolean) {
  const set = openers.get(name);
  if (!set) throw new Error(`No surface named ${name}`);
  set(open);
}

/** Focus returns to a trigger when its surface closes; let it go so the shot is at rest. */
function release() {
  (document.activeElement as HTMLElement | null)?.blur?.();
}

function popupOf(name: string) {
  return document.querySelector<HTMLElement>(`[data-popup="${name}"]`);
}

function overlayOf(name: string) {
  return document.querySelector<HTMLElement>(`[data-overlay="${name}"]`);
}

const IDENTITY = new Set(["none", "matrix(1, 0, 0, 1, 0, 0)"]);
const EASING = "cubic-bezier(0.2, 0, 0, 1)";

function checkMotionTokens(host: HTMLElement, add: Add) {
  const roles = [
    ["--fui-duration-enter", 0],
    ["--fui-duration-exit", 0],
    ["--fui-duration-enter-lg", 200],
    ["--fui-duration-exit-lg", 100],
  ] as const;
  for (const [role, expected] of roles) {
    const value = readTime(host, `var(${role})`);
    add(`${role} is ${expected}ms`, `${value}ms`, near(value, expected, 0.01));
  }
  const offset = readLength(host, "var(--fui-popup-offset)");
  add(
    "--fui-popup-offset is the positioner offset (4)",
    `${offset}px / ${POPUP_OFFSET_PX}px`,
    near(offset, 4, 0.01) && near(POPUP_OFFSET_PX, 4, 0.01)
  );
  const padding = readLength(host, "var(--fui-popup-collision-padding)");
  add(
    "--fui-popup-collision-padding is the positioner padding (8)",
    `${padding}px / ${POPUP_COLLISION_PADDING_PX}px`,
    near(padding, 8, 0.01) && near(POPUP_COLLISION_PADDING_PX, 8, 0.01)
  );
}

type Placement = "below" | "above";

/** Open one small popup, read it still, measure its gap, close it, and see it leave at once. */
async function checkPopup(add: Add, name: string, label: string, placement: Placement) {
  const anchor = find(document, `[data-anchor="${name}"]`);
  setOpen(name, true);
  const appeared = await framesUntil(() => popupOf(name)?.hasAttribute("data-open") ?? false);
  add(`${label} opens`, appeared < 0 ? "never" : `after ${appeared} frame(s)`, appeared >= 0);
  const popup = popupOf(name);
  if (!popup) return;
  await popupSettled(popup);

  for (const check of stillPopupChecks(label, popup)) add(check.label, check.actual, check.pass);

  const { side, gap } = anchorGap(popup, anchor);
  if (side === "none") {
    // A select opened by mouse lays its list over the trigger, the selected row on the value.
    const selected = popup.querySelector<HTMLElement>('[aria-selected="true"]');
    const row = selected?.getBoundingClientRect();
    const from = anchor.getBoundingClientRect();
    const middle = from.top + from.height / 2;
    add(
      `${label} lays the selected row over the trigger (no offset in this placement)`,
      row ? `${row.top}–${row.bottom} around ${middle}` : "no selected row",
      Boolean(row) && row!.top <= middle && row!.bottom >= middle
    );
  } else {
    add(
      `${label} sits 4 from its anchor, ${placement}`,
      `${gap.toFixed(2)}px (${side})`,
      side === (placement === "below" ? "bottom" : "top") && near(gap, 4, 0.5)
    );
  }

  // Leaving is read in the first frame the popup is ending or gone: it is already fully
  // transparent with nothing running, so no exit motion plays. The unmount after it waits
  // on the headless library's animation check, which a loaded engine can delay by frames.
  setOpen(name, false);
  type Ending = { opacity: string; durations: number[]; running: number };
  let ending: Ending | null = null;
  const hidden = await framesUntil(() => {
    const current = popupOf(name);
    if (!current) return true;
    if (!current.hasAttribute("data-ending-style")) return false;
    const style = getComputedStyle(current);
    ending = {
      opacity: style.opacity,
      durations: durationsOf(style.transitionDuration),
      running: current.getAnimations().length,
    };
    return true;
  }, 30);
  const read = ending as Ending | null;
  add(
    `${label} leaves in 0ms`,
    hidden < 0
      ? "still showing after 30 frames"
      : read
        ? `opacity ${read.opacity}, exit ${read.durations.join("/")}ms, ${read.running} running`
        : `gone after ${hidden} frame(s)`,
    hidden >= 0 &&
      (!read ||
        (read.opacity === "0" && read.durations.every((ms) => ms === 0) && read.running === 0))
  );
  const left = await framesUntil(() => !popupOf(name), 60);
  add(
    `${label} unmounts`,
    left < 0 ? "still mounted after 60 frames" : `after ${left} frame(s)`,
    left >= 0
  );
}

function Surfaces() {
  const menu = useOpener("menu");
  const select = useOpener("select");
  const popover = useOpener("popover");
  const tooltip = useOpener("tooltip");
  return (
    <Stack direction="row" gap="md" align="end" wrap>
      <Menu open={menu}>
        <Menu.Trigger
          render={
            <Button variant="soft" data-anchor="menu">
              Actions
            </Button>
          }
        />
        <Menu.Content data-popup="menu">
          <Menu.Item>Rename</Menu.Item>
          <Menu.Item>Duplicate</Menu.Item>
        </Menu.Content>
      </Menu>
      <Select defaultValue="main" open={select}>
        <Select.Trigger data-anchor="select" aria-label="Branch" />
        <Select.Content data-popup="select">
          <Select.Item value="main">main</Select.Item>
          <Select.Item value="next">next</Select.Item>
        </Select.Content>
      </Select>
      <Popover open={popover}>
        <Popover.Trigger
          render={
            <Button variant="soft" data-anchor="popover">
              Details
            </Button>
          }
        />
        <Popover.Content data-popup="popover">
          <Text as="p">Checked 4 minutes ago.</Text>
        </Popover.Content>
      </Popover>
      <Tooltip content="Copy the digest" open={tooltip} contentProps={{ "data-popup": "tooltip" }}>
        <Button variant="soft" data-anchor="tooltip">
          Copy
        </Button>
      </Tooltip>
    </Stack>
  );
}

const checkPopups = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  checkMotionTokens(host, add);
  await checkPopup(add, "menu", "Menu", "below");
  await checkPopup(add, "select", "Select list", "below");
  await checkPopup(add, "popover", "Popover", "below");
  await checkPopup(add, "tooltip", "Tooltip", "above");
  release();
  return checks;
});

export function popups() {
  return (
    <TokenChecks title="Small popups" check={checkPopups}>
      <Surfaces />
    </TokenChecks>
  );
}

const checkPopupsReducedMotion = oncePerHost(async () => {
  const { checks, add } = recorder();
  await frames(2);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  add("Reduced motion is on", String(reduced), reduced);
  await checkPopup(add, "menu", "Menu", "below");
  await checkPopup(add, "select", "Select list", "below");
  await checkPopup(add, "popover", "Popover", "below");
  await checkPopup(add, "tooltip", "Tooltip", "above");
  release();
  return checks;
});

export function popupsReducedMotion() {
  return (
    <TokenChecks title="Small popups under reduced motion" check={checkPopupsReducedMotion}>
      <Surfaces />
    </TokenChecks>
  );
}

function EdgePopover() {
  const open = useOpener("edge");
  return (
    <div data-role="edge">
      <Popover open={open}>
        <Popover.Trigger
          render={
            <Button variant="soft" data-anchor="edge">
              Edge
            </Button>
          }
        />
        <Popover.Content data-popup="edge">
          <Text as="p">A popover that would cross the viewport edge shifts back inside it.</Text>
        </Popover.Content>
      </Popover>
    </div>
  );
}

const checkCollision = oncePerHost(async () => {
  const { checks, add } = recorder();
  await frames(2);
  setOpen("edge", true);
  const appeared = await framesUntil(() => popupOf("edge")?.hasAttribute("data-open") ?? false);
  add("The edge popover opens", `after ${appeared} frame(s)`, appeared >= 0);
  await frames(2);
  const popup = popupOf("edge");
  if (popup) {
    const edge = document.documentElement.clientWidth;
    const right = popup.getBoundingClientRect().right;
    add(
      "It keeps 8 inside the viewport edge",
      `${(edge - right).toFixed(2)}px from the edge`,
      near(edge - right, 8, 0.5)
    );
  }
  setOpen("edge", false);
  await framesUntil(() => !popupOf("edge"), 10);
  release();
  return checks;
});

export function popupsCollision() {
  return (
    <TokenChecks
      title="Collision padding"
      check={checkCollision}
      hostProps={{ style: { position: "fixed", insetInlineEnd: 0, insetBlockStart: 96 } }}
    >
      <EdgePopover />
    </TokenChecks>
  );
}

type Run = { who: string; property: string; duration: number; easing: string };

/** Every transition the overlay or its scrim starts, with its duration and easing. */
function watchTransitions(name: string) {
  const runs: Run[] = [];
  const listener = (event: Event) => {
    const { target, propertyName } = event as TransitionEvent;
    if (!(target instanceof HTMLElement)) return;
    const overlay = overlayOf(name);
    const scrim = overlay ? scrimOf(overlay) : null;
    const who = target === overlay ? "panel" : target === scrim ? "scrim" : null;
    if (!who) return;
    const transition = target
      .getAnimations()
      .find(
        (animation) =>
          "transitionProperty" in animation &&
          (animation as CSSTransition).transitionProperty === propertyName
      );
    const timing = transition?.effect?.getTiming();
    runs.push({
      who,
      property: propertyName,
      duration: Number(timing?.duration ?? Number.NaN),
      easing: String(timing?.easing ?? getComputedStyle(target).transitionTimingFunction),
    });
  };
  document.addEventListener("transitionrun", listener, true);
  return {
    take() {
      return runs.splice(0, runs.length);
    },
    stop() {
      document.removeEventListener("transitionrun", listener, true);
    },
  };
}

/** The scrim is the backdrop rendered just before the overlay's viewport. */
function scrimOf(overlay: HTMLElement) {
  let node = overlay.parentElement?.previousElementSibling ?? null;
  while (node && !(node instanceof HTMLElement && node.hasAttribute("data-open"))) {
    if (node instanceof HTMLElement && node.hasAttribute("data-closed")) break;
    node = node.previousElementSibling;
  }
  return node instanceof HTMLElement ? node : null;
}

function describe(runs: Run[]) {
  return runs.length === 0
    ? "none"
    : runs.map((run) => `${run.who} ${run.property} ${run.duration}ms`).join(", ");
}

/** Open an overlay, read its fade, close it, and read its exit. */
async function checkOverlay(add: Add, name: string, label: string, reduced: boolean) {
  const watch = watchTransitions(name);
  setOpen(name, true);
  const appeared = await framesUntil(() => overlayOf(name)?.hasAttribute("data-open") ?? false);
  add(`${label} opens`, appeared < 0 ? "never" : `after ${appeared} frame(s)`, appeared >= 0);
  await wait(320);
  const enter = watch.take();
  const overlay = overlayOf(name);
  if (!overlay) {
    watch.stop();
    return;
  }
  const scrim = scrimOf(overlay);
  add(`${label} has a scrim`, String(Boolean(scrim)), Boolean(scrim));
  // Close only once the fade-in is done: a loaded engine can start it late, and closing
  // mid-fade reverses it on a shortened duration (CSS transition reversal).
  const running = [...overlay.getAnimations(), ...(scrim?.getAnimations() ?? [])];
  await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)));
  await frames(1);

  const fades = (who: string, runs: Run[], ms: number) =>
    runs.some(
      (run) => run.who === who && run.property === "opacity" && near(run.duration, ms, 0.5)
    );
  add(`${label} fades in over 200ms`, describe(enter), fades("panel", enter, 200));
  add(
    `The ${label.toLowerCase()} scrim fades in with it`,
    describe(enter),
    fades("scrim", enter, 200)
  );
  add(
    `${label} enters on opacity alone`,
    describe(enter),
    enter.every((run) => run.property === "opacity")
  );
  add(
    `${label} enters on the standard easing`,
    enter.map((run) => run.easing).join(", ") || "none",
    enter.length > 0 && enter.every((run) => run.easing === EASING)
  );
  const style = getComputedStyle(overlay);
  add(
    `${label} rests with no transform`,
    `transform ${style.transform}, scale ${style.scale}, translate ${style.translate}`,
    IDENTITY.has(style.transform) && style.scale === "none" && style.translate === "none"
  );
  if (reduced) {
    add(
      `${label} transitions opacity only under reduced motion`,
      style.transitionProperty,
      style.transitionProperty === "opacity"
    );
  }

  setOpen(name, false);
  const left = await framesUntil(() => !overlayOf(name), 60);
  const exit = watch.take();
  watch.stop();
  add(`${label} leaves`, left < 0 ? "still mounted" : `gone after ${left} frame(s)`, left >= 0);
  add(`${label} fades out over 100ms`, describe(exit), fades("panel", exit, 100));
  add(
    `The ${label.toLowerCase()} scrim fades out with it`,
    describe(exit),
    fades("scrim", exit, 100)
  );
  add(
    `${label} leaves on opacity alone`,
    describe(exit),
    exit.every((run) => run.property === "opacity")
  );
}

function Overlays() {
  const dialog = useOpener("dialog");
  const drawer = useOpener("drawer");
  return (
    <Stack direction="row" gap="md">
      <Dialog open={dialog}>
        <Dialog.Trigger render={<Button variant="soft">Rename branch</Button>} />
        <Dialog.Content data-overlay="dialog">
          <Dialog.Header>
            <Dialog.Title>Rename the branch</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text as="p">Open pull requests move to the new name.</Text>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
      <Drawer open={drawer}>
        <Drawer.Trigger render={<Button variant="soft">Show history</Button>} />
        <Drawer.Content data-overlay="drawer">
          <Drawer.Header>
            <Drawer.Title>History</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <Text as="p">Three checks ran today.</Text>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </Stack>
  );
}

const checkOverlays = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  checkMotionTokens(host, add);
  await checkOverlay(add, "dialog", "Dialog", false);
  await checkOverlay(add, "drawer", "Drawer", false);
  release();
  return checks;
});

export function overlays() {
  return (
    <TokenChecks title="Overlays" check={checkOverlays}>
      <Overlays />
    </TokenChecks>
  );
}

const checkOverlaysReducedMotion = oncePerHost(async () => {
  const { checks, add } = recorder();
  await frames(2);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  add("Reduced motion is on", String(reduced), reduced);
  await checkOverlay(add, "dialog", "Dialog", true);
  await checkOverlay(add, "drawer", "Drawer", true);
  release();
  return checks;
});

export function overlaysReducedMotion() {
  return (
    <TokenChecks title="Overlays under reduced motion" check={checkOverlaysReducedMotion}>
      <Overlays />
    </TokenChecks>
  );
}
