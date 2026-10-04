/**
 * Scoped themes: a nested Theme renders a scope element whose inputs and mode re-derive
 * every role below it, a portal opened inside carries the scope, and ThemeScript sets the
 * stored mode before the first paint, falling back to the system mode when storage is blocked.
 *
 * @family:primitives
 * @tag:theme-scope
 * @na:empty A Theme with no children still scopes nothing visible; there is no empty state to draw.
 * @na:overflow A Theme draws no box of its own size; its children own overflow.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Link } from "../Link";
import { Stack } from "../Stack";
import { Text } from "../Text";
import { Tooltip } from "../Tooltip";
import {
  TokenChecks,
  contrast,
  framesUntil,
  hex,
  hueDistance,
  readLength,
  readOklch,
  readOpacity,
  readSrgb,
  sameColor,
  type Check,
  type Srgb,
} from "../../test/token-probe";
import { Theme, useTheme } from "./index";
import { ThemeScript } from "./ThemeScript";

// The root Theme persists the page mode; its own key keeps the fixture out of 'fui-theme'.
const PAGE_KEY = "fui-theme-states";
const PAGE_BRAND = { r: 0x3d / 255, g: 0x5a / 255, b: 0xe8 / 255, alpha: 1 };
const PANEL_BRAND = "#16a34a";
const PANEL_BRAND_SRGB = { r: 0x16 / 255, g: 0xa3 / 255, b: 0x4a / 255, alpha: 1 };
const VIVID_NEUTRAL = "oklch(0.5 0.3 140)";
const PLANES = [
  "--fui-app-canvas-bg",
  "--fui-bg-secondary",
  "--fui-bg-primary",
  "--fui-bg-elevated",
];
const INKS = [
  "--fui-text-primary",
  "--fui-text-secondary",
  "--fui-text-tertiary",
  "--fui-link-ink",
];

type Add = (label: string, actual: string, pass: boolean) => void;

function collector(): [Check[], Add] {
  const checks: Check[] = [];
  return [checks, (label, actual, pass) => checks.push({ label, actual, pass })];
}

function probe(host: HTMLElement, name: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(`[data-probe="${name}"]`);
  if (!element) throw new Error(`probe "${name}" is missing`);
  return element;
}

function scopeOf(element: HTMLElement): HTMLElement {
  const scope = element.closest<HTMLElement>("[data-fui-theme]");
  if (!scope) throw new Error("no [data-fui-theme] above the probe");
  return scope;
}

function paint(host: HTMLElement, element: Element, property: "backgroundColor" | "color"): Srgb {
  return readSrgb(host, getComputedStyle(element)[property]);
}

/** A role holds `bar`:1 on every plane read at `at`, and keeps `hue` when one is given. */
function holds(add: Add, at: HTMLElement, label: string, color: Srgb, bar: number, hue?: number) {
  const planes = PLANES.map((name) => readSrgb(at, `var(${name})`));
  const worst = Math.min(...planes.map((plane) => contrast(color, plane)));
  const h = readOklch(at, hex(color)).h;
  const hueOk = hue === undefined || hueDistance(h, hue) <= 25;
  add(
    `${label} holds ${bar}:1 on every plane${hue === undefined ? "" : " and keeps its seed's hue"}`,
    `${hex(color)}, hue ${h.toFixed(1)}, worst ${worst.toFixed(2)}:1`,
    worst >= bar && hueOk
  );
}

/**
 * Whether the root Theme has written `mode` on <html>. It writes in an effect that waits for its
 * mount render, so this lands a render or more after the fixture mounts.
 */
function pageIs(mode: "light" | "dark"): boolean {
  const root = document.documentElement;
  return root.getAttribute("data-theme") === mode && root.style.colorScheme === mode;
}

/** The alpha of the first colour stop a shadow token resolves to at `at`. */
function shadowAlpha(at: HTMLElement, token: string): number {
  const element = document.createElement("span");
  element.style.boxShadow = `var(${token})`;
  at.appendChild(element);
  const shadow = getComputedStyle(element).boxShadow;
  element.remove();
  const match = /rgba\([\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)\)/.exec(shadow);
  return match ? parseFloat(match[1]) : Number.NaN;
}

async function checkScopes(host: HTMLElement): Promise<Check[]> {
  // The root Theme writes the page mode in an effect; let it land first.
  await framesUntil(() => pageIs("light"));
  const [checks, add] = collector();

  // The page: light, blue.
  const pageMode = document.documentElement.getAttribute("data-theme");
  add("The root Theme sets the page to light", String(pageMode), pageMode === "light");
  const canvas = readOklch(host, "var(--fui-body-bg)");
  add(
    "Page canvas is the light canvas",
    `L ${canvas.l.toFixed(3)}`,
    Math.abs(canvas.l - 0.94) < 0.01
  );
  const pageButton = probe(host, "page").querySelector("button")!;
  const pageFill = paint(host, pageButton, "backgroundColor");
  add("Page primary fill is the default brand", hex(pageFill), sameColor(pageFill, PAGE_BRAND));

  // An ink toolbar on the page: primary chrome is ink 1, labelled with the surface.
  const toolbar = probe(host, "ink-toolbar");
  const inkButton = toolbar.querySelector("button")!;
  const inkFill = paint(host, inkButton, "backgroundColor");
  const inkLabel = paint(host, inkButton, "color");
  const ink1 = readSrgb(toolbar, "var(--fui-text-primary)");
  add("Ink toolbar fill is ink 1, not the accent", hex(inkFill), sameColor(inkFill, ink1));
  const surface = readSrgb(toolbar, "var(--fui-bg-primary)");
  add("Ink toolbar label is the surface", hex(inkLabel), sameColor(inkLabel, surface));
  const inkRatio = contrast(inkLabel, inkFill);
  add("Ink toolbar label holds 4.5:1", `${inkRatio.toFixed(2)}:1`, inkRatio >= 4.5);

  // The nested dark panel: dark planes, green accents.
  const panel = probe(host, "panel");
  const panelScope = scopeOf(panel);
  const scheme = getComputedStyle(panelScope).colorScheme;
  add("Panel scope is dark", scheme, scheme === "dark");
  const panelCanvas = readOklch(host, getComputedStyle(panelScope).backgroundColor);
  add(
    "Panel paints the dark canvas",
    `L ${panelCanvas.l.toFixed(3)}`,
    Math.abs(panelCanvas.l - 0.182) < 0.01
  );
  const panelInk = paint(host, panelScope, "color");
  const panelInkRatio = contrast(panelInk, paint(host, panelScope, "backgroundColor"));
  add("Panel ink holds 4.5:1 on its canvas", `${panelInkRatio.toFixed(2)}:1`, panelInkRatio >= 4.5);
  const panelButton = panel.querySelector("button")!;
  const panelFill = paint(host, panelButton, "backgroundColor");
  add(
    "Panel primary fill is the panel brand",
    hex(panelFill),
    sameColor(panelFill, PANEL_BRAND_SRGB)
  );
  const panelLabel = contrast(paint(host, panelButton, "color"), panelFill);
  add("Panel primary label holds 4.5:1", `${panelLabel.toFixed(2)}:1`, panelLabel >= 4.5);
  const green = readOklch(host, PANEL_BRAND).h;
  const checkbox = panel.querySelector('[role="checkbox"][data-checked]');
  const link = panel.querySelector("a");
  if (!checkbox || !link) {
    add("Checked Checkbox and Link render in the panel", "missing", false);
  } else {
    holds(add, panel, "Panel checkbox fill", paint(host, checkbox, "backgroundColor"), 3, green);
    holds(add, panel, "Panel link ink", paint(host, link, "color"), 4.5, green);
  }
  const panelShadow = shadowAlpha(panel, "--fui-shadow-sm");
  const pageShadow = shadowAlpha(host, "--fui-shadow-sm");
  add(
    "Shadows follow each scope's mode",
    `panel ${panelShadow}, page ${pageShadow}`,
    Math.abs(panelShadow - 0.15) < 0.005 && Math.abs(pageShadow - 0.02) < 0.005
  );
  const darkToolbar = probe(host, "panel-ink-toolbar");
  const darkInk = paint(host, darkToolbar.querySelector("button")!, "backgroundColor");
  const darkInk1 = readSrgb(darkToolbar, "var(--fui-text-primary)");
  add(
    "Ink chrome inside the panel reads the panel's ink",
    hex(darkInk),
    sameColor(darkInk, darkInk1) && readOklch(host, hex(darkInk)).l > 0.85
  );

  // A scope that sets the other inputs.
  const tuned = probe(host, "tuned");
  const height = readLength(tuned, "var(--fui-control-height-md)");
  add("Scale 1.125 makes the md control 36px", `${height}px`, Math.abs(height - 36) < 0.01);
  const radius = readLength(tuned, "var(--fui-radius-control)");
  add("Radius 8 makes the control radius 8px", `${radius}px`, Math.abs(radius - 8) < 0.01);
  const press = readOpacity(tuned, "var(--fui-press-scale)");
  add("Press scale is 0.97", String(press), Math.abs(press - 0.97) < 0.001);
  const font = getComputedStyle(scopeOf(tuned)).fontFamily;
  add("Font reaches the scope", font, font.includes("Georgia"));
  const tunedSurface = readOklch(tuned, "var(--fui-bg-primary)").h;
  add(
    "Planes take the neutral's hue 250",
    `hue ${tunedSurface.toFixed(1)}`,
    hueDistance(tunedSurface, 250) <= 1
  );

  // A vivid neutral: chroma is capped, so every ink holds on every plane in both modes.
  for (const mode of ["light", "dark"]) {
    const vivid = probe(host, `vivid-${mode}`);
    const chroma = readOklch(vivid, "var(--fui-body-bg)").c;
    add(`Vivid neutral canvas chroma is capped (${mode})`, chroma.toFixed(4), chroma <= 0.0205);
    for (const ink of INKS)
      holds(add, vivid, `${ink} on a vivid neutral (${mode})`, readSrgb(vivid, `var(${ink})`), 4.5);
  }
  return checks;
}

async function checkPortal(host: HTMLElement): Promise<Check[]> {
  const popupBody = () => document.querySelector<HTMLElement>("[data-probe-popup]");
  // The page mode and the tooltip's portal both land after mount; wait for both.
  await framesUntil(
    () => pageIs("light") && Boolean(popupBody()?.closest("[data-fui-theme][data-theme]"))
  );
  const [checks, add] = collector();
  const body = popupBody();
  if (!body) {
    add("The tooltip opens", "missing", false);
    return checks;
  }
  add(
    "The popup is portalled out of the panel",
    host.contains(body) ? "inside" : "outside",
    !host.contains(body)
  );
  const portal = body.closest<HTMLElement>("[data-fui-theme]");
  add(
    "Its portal carries the panel's scope",
    portal?.getAttribute("data-theme") ?? "none",
    portal?.getAttribute("data-theme") === "dark"
  );
  // The tooltip wears the inverse plane: light inside a dark scope, dark on a light page.
  const popup = body.closest<HTMLElement>('[role="tooltip"]') ?? body.parentElement ?? body;
  const fill = paint(host, popup, "backgroundColor");
  const panelInverse = readSrgb(probe(host, "portal-panel"), "var(--fui-bg-inverse)");
  const pageInverse = readSrgb(host, "var(--fui-bg-inverse)");
  add(
    "The popup takes the panel's inverse plane, not the page's",
    `${hex(fill)} (panel ${hex(panelInverse)}, page ${hex(pageInverse)})`,
    sameColor(fill, panelInverse) && !sameColor(fill, pageInverse)
  );
  const ink = contrast(paint(host, body, "color"), fill);
  add("Its text holds 4.5:1 on it", `${ink.toFixed(2)}:1`, ink >= 4.5);
  const page = readOklch(host, "var(--fui-body-bg)");
  add("The page stays light", `L ${page.l.toFixed(3)}`, page.l > 0.9);
  return checks;
}

type ColdLoad = {
  parse: string;
  frame: string;
  system: string;
  blocked: boolean;
  errors: string[];
};

/**
 * Cold-load a document whose head holds ThemeScript's own markup, in a frame that shares this
 * origin's storage. Records the mode at body parse and at the first animation frame, both
 * before that frame paints.
 */
function coldLoad(host: HTMLElement, blockStorage: boolean): Promise<ColdLoad> {
  const key = `fui-theme-probe-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(key, "dark");
  const head = [
    '<meta charset="utf-8">',
    '<script>window.__errors=[];addEventListener("error",function(e){__errors.push(String(e.message))});</script>',
    blockStorage
      ? '<script>Object.defineProperty(window,"localStorage",{configurable:true,get:function(){throw new DOMException("blocked","SecurityError")}});</script>'
      : "",
    renderToStaticMarkup(
      <ThemeScript storageKey={key} defaultMode={blockStorage ? "system" : "light"} />
    ),
  ].join("");
  const report =
    "var d=document.documentElement;" +
    'function at(){return (d.getAttribute("data-theme")||"none")+"/"+(d.style.colorScheme||"none")}' +
    "var parse=at(),blocked=false;try{localStorage}catch(e){blocked=true}" +
    // The frame's own system preference: an embedded document's media query can follow its
    // frame element's color-scheme rather than the OS.
    'var system=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";' +
    `requestAnimationFrame(function(){parent.postMessage({probe:${JSON.stringify(key)},parse:parse,frame:at(),system:system,blocked:blocked,errors:window.__errors},"*")});`;
  const frame = document.createElement("iframe");
  frame.title = "Cold load";
  frame.width = "160";
  frame.height = "40";
  // Light around the frame, so the stored dark and the system mode differ where they can.
  frame.style.colorScheme = "light";
  frame.srcdoc = `<!doctype html><html><head>${head}</head><body><script>${report}</script></body></html>`;

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      frame.remove();
      localStorage.removeItem(key);
    };
    const onMessage = (event: MessageEvent) => {
      if ((event.data as { probe?: string } | null)?.probe !== key) return;
      cleanup();
      resolve(event.data as ColdLoad);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("the cold-load frame never reported"));
    }, 5_000);
    window.addEventListener("message", onMessage);
    host.appendChild(frame);
  });
}

async function checkColdLoad(host: HTMLElement): Promise<Check[]> {
  const [checks, add] = collector();
  const result = await coldLoad(host, false);
  add("Stored dark is on <html> at body parse", result.parse, result.parse === "dark/dark");
  add("Stored dark is on <html> at the first frame", result.frame, result.frame === "dark/dark");
  add("Nothing threw", result.errors.join("; ") || "none", result.errors.length === 0);
  return checks;
}

async function checkBlockedStorage(host: HTMLElement): Promise<Check[]> {
  const [checks, add] = collector();
  const result = await coldLoad(host, true);
  const system = result.system;
  add("Storage is blocked in the frame", String(result.blocked), result.blocked);
  add(
    `Falls back to the system mode (${system}) at body parse and first frame`,
    `${result.parse}, ${result.frame}`,
    result.parse === `${system}/${system}` && result.frame === result.parse
  );
  add("Nothing threw", result.errors.join("; ") || "none", result.errors.length === 0);
  return checks;
}

const PAD = { padding: "var(--fui-raw-space-24)" };

/** Flips the nearest scope between light and dark through the mode API. */
function ScopeModeButton() {
  const { resolvedMode, setMode } = useTheme();
  return (
    <Button
      data-probe="switch-toggle"
      onClick={() => setMode(resolvedMode === "dark" ? "light" : "dark")}
    >
      {resolvedMode === "dark" ? "Light" : "Dark"}
    </Button>
  );
}

// A scope that owns its mode switches by its own API: its element takes the
// new mode, and the planes below it re-derive; the page keeps its own.
async function checkModeSwitch(host: HTMLElement): Promise<Check[]> {
  const [checks, add] = collector();
  await framesUntil(() => pageIs("light"));
  const panel = probe(host, "switch");
  const scope = scopeOf(panel);
  const before = paint(host, panel, "backgroundColor");
  probe(host, "switch-toggle").click();
  const waited = await framesUntil(() => scope.getAttribute("data-theme") === "dark");
  add("The scope takes the new mode", scope.getAttribute("data-theme") ?? "none", waited >= 0);
  const after = paint(host, panel, "backgroundColor");
  add(
    "The scope's plane re-derives for the new mode",
    `${hex(before)} → ${hex(after)}`,
    !sameColor(before, after)
  );
  add(
    "The page keeps its mode",
    document.documentElement.getAttribute("data-theme") ?? "none",
    pageIs("light")
  );
  probe(host, "switch-toggle").click();
  return checks;
}

export function populatedNestedScope() {
  return (
    <Theme mode="light" storageKey={PAGE_KEY}>
      <TokenChecks title="Nested theme scopes" check={checkScopes}>
        <Stack gap="md" align="start">
          <div data-probe="page">
            <Button>Publish</Button>
          </div>
          <div data-probe="ink-toolbar" data-chrome="ink" role="toolbar" aria-label="Review">
            <Button>Merge</Button>
          </div>
          <Theme mode="dark" brand={PANEL_BRAND} style={PAD}>
            <Stack gap="md" align="start" data-probe="panel">
              <Text>Deploy preview</Text>
              <Button>Deploy</Button>
              <Checkbox defaultChecked label="Notify reviewers" />
              <Link href="#scope">Read the contract</Link>
              <div
                data-probe="panel-ink-toolbar"
                data-chrome="ink"
                role="toolbar"
                aria-label="Ship"
              >
                <Button>Ship</Button>
              </div>
            </Stack>
          </Theme>
          <Theme
            neutral="oklch(0.5 0.02 250)"
            scale={1.125}
            radius={8}
            font="Georgia, serif"
            pressScale={0.97}
          >
            <div data-probe="tuned">
              <Button variant="soft">Tuned</Button>
            </div>
          </Theme>
          <Theme mode="light" neutral={VIVID_NEUTRAL} style={PAD}>
            <Text data-probe="vivid-light">Vivid neutral, light</Text>
          </Theme>
          <Theme mode="dark" neutral={VIVID_NEUTRAL} style={PAD}>
            <Text data-probe="vivid-dark">Vivid neutral, dark</Text>
          </Theme>
        </Stack>
      </TokenChecks>
    </Theme>
  );
}

export function populatedPortal() {
  return (
    <Theme mode="light" storageKey={PAGE_KEY}>
      <TokenChecks title="A popup opened in a scope" check={checkPortal}>
        <Theme mode="dark" brand={PANEL_BRAND} style={PAD}>
          <div data-probe="portal-panel">
            <Tooltip
              defaultOpen
              side="right"
              content={<span data-probe-popup="">Opened from the dark panel</span>}
            >
              <Button variant="soft">Details</Button>
            </Tooltip>
          </div>
        </Theme>
      </TokenChecks>
    </Theme>
  );
}

// The stored mode applied before the first paint: the theme's own loading case.
export function loadingStoredMode() {
  return <TokenChecks title="ThemeScript on a cold load" check={checkColdLoad} />;
}

export function lifecycleModeSwitch() {
  return (
    <Theme mode="light" storageKey={PAGE_KEY}>
      <TokenChecks title="A scope switching its own mode" check={checkModeSwitch}>
        <Theme defaultMode="light" style={PAD}>
          <div data-probe="switch" style={{ background: "var(--fui-bg-primary)", ...PAD }}>
            <ScopeModeButton />
          </div>
        </Theme>
      </TokenChecks>
    </Theme>
  );
}

export function errorBlockedStorage() {
  return <TokenChecks title="ThemeScript with storage blocked" check={checkBlockedStorage} />;
}
