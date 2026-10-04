/**
 * State fixtures for Command, rendered by `pnpm run test:states`.
 *
 * @family:overlays
 */
import * as React from "react";
import { Command } from ".";
import { colorAs, framesUntil, oncePerHost, recorder } from "../../test/recipe-checks";
import { TokenChecks, waitUntil, type Check } from "../../test/token-probe";

const NAMES = ["Open pull requests", "Rename branch", "Publish contract", "Copy digest"];

function Palette({ count = NAMES.length, search }: { count?: number; search?: string }) {
  return (
    <Command defaultSearch={search} data-states-command="">
      <Command.Input placeholder="Search commands…" />
      <Command.List>
        <Command.Group heading="Repository">
          {NAMES.slice(0, count).map((name) => (
            <Command.Item key={name} onSelect={() => {}}>
              {name}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Empty>No commands match.</Command.Empty>
      </Command.List>
    </Command>
  );
}

/** Frameless, flush search row, first row active. */
const checkFrame = oncePerHost(async (host: HTMLElement): Promise<Check[]> => {
  // Items register in an effect and the first match turns active in the next one, so the
  // active row lands a few frames later (more under load or in another engine).
  await framesUntil(() => host.querySelector("[data-states-command] [data-active]") !== null, 60);
  const { checks, add } = recorder();
  const root = host.querySelector<HTMLElement>("[data-states-command]");
  if (!root) return checks;
  const style = getComputedStyle(root);
  add("Command draws no shadow", style.boxShadow, style.boxShadow === "none");
  add("Command draws no edge", style.borderTopWidth, style.borderTopWidth === "0px");
  const active = root.querySelector<HTMLElement>("[data-active]");
  add("The first row is active", active?.textContent ?? "none", Boolean(active));
  return checks;
});

export function populated() {
  return (
    <TokenChecks title="Command list" check={checkFrame}>
      <Palette />
    </TokenChecks>
  );
}

const checkEmpty = oncePerHost(async (host: HTMLElement): Promise<Check[]> => {
  const shown = () => host.querySelectorAll('[role="option"]:not([style*="display: none"])');
  // Items register and score in effects, so the filter settles a few frames after mount (more
  // under load or in another engine): wait on the filter itself, inside a bound.
  await waitUntil(() => shown().length === 0, 3000);
  const { checks, add } = recorder();
  const options = shown();
  add("No option shows for a search with no match", String(options.length), options.length === 0);
  return checks;
});

export function empty() {
  return (
    <TokenChecks title="No matches" check={checkEmpty}>
      <Palette search="zzz" />
    </TokenChecks>
  );
}

export function loading() {
  return (
    <TokenChecks
      title="Loading"
      check={(host) => {
        const { checks, add } = recorder();
        const list = host.querySelector('[role="listbox"]');
        add(
          "The list is busy",
          String(list?.getAttribute("aria-busy")),
          list?.getAttribute("aria-busy") === "true"
        );
        return checks;
      }}
    >
      <Command>
        <Command.Input placeholder="Search issues…" />
        <Command.List loading>
          <Command.Empty>No issues match.</Command.Empty>
        </Command.List>
      </Command>
    </TokenChecks>
  );
}

export function error() {
  return (
    <TokenChecks
      title="Error"
      check={(host) => {
        const { checks, add } = recorder();
        const row = host.querySelector<HTMLElement>("[data-command-error]");
        add(
          "The error row offers Retry",
          row?.textContent ?? "missing",
          Boolean(row?.querySelector("button"))
        );
        const glyph = row?.querySelector<HTMLElement>("span[aria-hidden]");
        add(
          "The error glyph is the danger text ink",
          glyph ? getComputedStyle(glyph).color : "missing",
          Boolean(glyph) &&
            getComputedStyle(glyph!).color === colorAs(host, "var(--fui-color-danger-text)")
        );
        add(
          "The error row is announced politely",
          String(row?.getAttribute("role")),
          row?.getAttribute("role") === "status"
        );
        return checks;
      }}
    >
      <Command>
        <Command.Input placeholder="Search issues…" />
        <Command.List>
          <Command.Error onRetry={() => {}}>Couldn’t load issues.</Command.Error>
        </Command.List>
      </Command>
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <TokenChecks title="Long list" check={checkFrame}>
      <Command data-states-command="">
        <Command.Input placeholder="Search commands…" />
        <Command.List>
          {Array.from({ length: 24 }, (_, index) => (
            <Command.Item key={index} onSelect={() => {}}>
              {`Open finding ${index + 1} in the governance-contract-authoring-flow branch`}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </TokenChecks>
  );
}

function RunsPalette() {
  const [ran, setRan] = React.useState("");
  return (
    <>
      <Command data-states-command="">
        <Command.Input placeholder="Search commands…" />
        <Command.List>
          {NAMES.map((name) => (
            <Command.Item key={name} onSelect={() => setRan(name)}>
              {name}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
      <output data-states-ran="">{ran}</output>
    </>
  );
}

function press(target: Element, key: string) {
  target.dispatchEvent(
    new KeyboardEvent("keydown", { key, code: key, bubbles: true, cancelable: true })
  );
}

/** Type, move, run: the first match is active, arrows move it, Return runs the active row. */
const checkLifecycle = oncePerHost(async (host: HTMLElement): Promise<Check[]> => {
  const { checks, add } = recorder();
  const input = host.querySelector<HTMLInputElement>("[data-states-command] input");
  const active = () => host.querySelector<HTMLElement>("[data-states-command] [data-active]");
  const ran = () => host.querySelector("[data-states-ran]")?.textContent ?? "";
  if (!input) return checks;
  input.focus();
  await waitUntil(() => active() !== null, 3000);
  add(
    "The first row is active",
    active()?.textContent ?? "none",
    active()?.textContent === NAMES[0]
  );
  const row = active();
  if (row) {
    const style = getComputedStyle(row);
    add("The active row draws no ring", style.boxShadow, style.boxShadow === "none");
  }
  press(input, "ArrowDown");
  await waitUntil(() => active()?.textContent === NAMES[1], 3000);
  add(
    "ArrowDown moves to the next row",
    active()?.textContent ?? "none",
    active()?.textContent === NAMES[1]
  );
  press(input, "Enter");
  await waitUntil(() => ran() !== "", 3000);
  add("Return runs the active row", ran() || "nothing ran", ran() === NAMES[1]);
  input.blur();
  return checks;
});

export function lifecycle() {
  return (
    <TokenChecks title="Type, move and run" check={checkLifecycle}>
      <RunsPalette />
    </TokenChecks>
  );
}
