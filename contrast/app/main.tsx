// The contrast probe page. It renders the library's global styles and three indicator
// components, then exposes `window.__contrastCollect`, which run.mjs calls once per mode:
// for every seed it sets `--fui-seed-brand` on the root and reads each source's computed
// colour string. Node does the maths; the page only reports what the engine resolved.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/globals.scss";
import { Checkbox } from "../../src/components/Checkbox";
import { Input } from "../../src/components/Input";
import { Switch } from "../../src/components/Switch";

type Source = { token?: string; system?: string; component?: string; paint?: "edge" | "fill" };

export interface CollectRequest {
  mode: "light" | "dark";
  seeds: Array<{ id: string; brand: string | null }>;
  sources: Record<string, Source>;
}

export interface CollectResult {
  readings: Record<string, Record<string, string | null>>;
  undefinedTokens: string[];
}

declare global {
  interface Window {
    __contrastCollect?: (request: CollectRequest) => CollectResult;
  }
}

// A colour no token resolves to: a probe that still reads it fell back to inheritance,
// so its declaration was invalid at computed-value time in this engine.
const SENTINEL = "rgb(1, 2, 3)";
const root = document.documentElement;

function setStatus(status: "loading" | "ready" | "error", message?: string) {
  root.dataset.contrastStatus = status;
  if (message) root.dataset.contrastError = message;
}

window.addEventListener("error", (event) => setStatus("error", String(event.message)));

/**
 * The boundary colour of the first element inside `probe` that draws one: its top border, or
 * with `paint: "fill"` its background, for an indicator drawn as a fill with no border.
 */
function boundaryColour(probe: Element, paint: Source["paint"] = "edge"): string | null {
  for (const element of [probe, ...probe.querySelectorAll("*")]) {
    const style = getComputedStyle(element);
    if (paint === "fill") {
      if (style.backgroundColor !== "rgba(0, 0, 0, 0)" && style.backgroundColor !== "transparent") {
        return style.backgroundColor;
      }
    } else if (parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== "none") {
      return style.borderTopColor;
    }
  }
  return null;
}

function collect({ mode, seeds, sources }: CollectRequest): CollectResult {
  root.dataset.theme = mode;
  const host = document.createElement("div");
  host.style.color = SENTINEL;
  host.setAttribute("aria-hidden", "true");
  document.body.append(host);

  const probes = new Map<string, HTMLElement>();
  const undefinedTokens: string[] = [];
  const rootStyle = getComputedStyle(root);
  for (const [name, source] of Object.entries(sources)) {
    if (source.component) continue;
    if (source.token && rootStyle.getPropertyValue(source.token).trim() === "") {
      undefinedTokens.push(source.token);
      continue;
    }
    const probe = document.createElement("span");
    probe.style.color = source.token ? `var(${source.token})` : (source.system ?? "");
    host.append(probe);
    probes.set(name, probe);
  }

  const readings: CollectResult["readings"] = {};
  try {
    for (const seed of seeds) {
      if (seed.brand) root.style.setProperty("--fui-seed-brand", seed.brand);
      else root.style.removeProperty("--fui-seed-brand");
      const values: Record<string, string | null> = {};
      for (const [name, source] of Object.entries(sources)) {
        if (source.component) {
          const probe = document.querySelector(`[data-contrast-probe="${source.component}"]`);
          values[name] = probe ? boundaryColour(probe, source.paint) : null;
          continue;
        }
        const probe = probes.get(name);
        const value = probe ? getComputedStyle(probe).color : null;
        values[name] = value && value !== SENTINEL ? value : null;
      }
      readings[seed.id] = values;
    }
  } finally {
    root.style.removeProperty("--fui-seed-brand");
    host.remove();
  }
  return { readings, undefinedTokens: [...new Set(undefinedTokens)].sort() };
}

function Probes() {
  return (
    <main>
      <div data-contrast-probe="field-border">
        <Input aria-label="Field boundary probe" />
      </div>
      <div data-contrast-probe="switch-off-track">
        <Switch aria-label="Switch off track probe" />
      </div>
      <div data-contrast-probe="checkbox-edge">
        <Checkbox aria-label="Checkbox edge probe" />
      </div>
    </main>
  );
}

// Rest colours only. With no transitions, a seed or mode change is visible to
// getComputedStyle at once instead of reporting the start of a 0.01ms transition
// (the reduced-motion rule in globals.scss forces that duration on every element).
const STILL = "*, *::before, *::after { transition: none !important; animation: none !important; }";

async function start() {
  setStatus("loading");
  const still = document.createElement("style");
  still.textContent = STILL;
  document.head.append(still);
  const container = document.getElementById("app");
  if (!container) throw new Error("#app is missing");
  createRoot(container).render(
    <StrictMode>
      <Probes />
    </StrictMode>
  );
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  window.__contrastCollect = collect;
  setStatus("ready");
}

start().catch((error: unknown) => setStatus("error", String(error)));
