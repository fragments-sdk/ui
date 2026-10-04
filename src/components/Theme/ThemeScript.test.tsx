import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as barrel from "../../index";
import { ThemeScript, getThemeScript } from "./ThemeScript";

const root = document.documentElement;
let stored: Record<string, string> = {};

function setStorage(storage: () => Storage) {
  Object.defineProperty(window, "localStorage", { configurable: true, get: storage });
}

function setSystem(dark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({ matches: dark, media: query })),
  });
}

function run(source: string) {
  // The same text the browser runs from the inline script.
  new Function(source)();
}

beforeEach(() => {
  stored = {};
  setStorage(
    () =>
      ({
        getItem: (key: string) => stored[key] ?? null,
        setItem: (key: string, value: string) => {
          stored[key] = value;
        },
      }) as Storage
  );
  setSystem(false);
});

afterEach(() => {
  root.removeAttribute("data-theme");
  root.removeAttribute("data-chrome");
  root.removeAttribute("style");
  root.classList.remove("light", "dark");
});

describe("ThemeScript", () => {
  it("is a server module: no client directive, exported from the package root", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/Theme/ThemeScript.tsx"),
      "utf8"
    );
    expect(source).not.toMatch(/^\s*["']use client["']/m);
    expect(barrel.ThemeScript).toBe(ThemeScript);
    expect(barrel.getThemeScript).toBe(getThemeScript);
  });

  it("renders one inline script carrying the nonce", () => {
    const html = renderToStaticMarkup(<ThemeScript nonce="abc123" />);
    expect(html.startsWith('<script nonce="abc123">')).toBe(true);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).toContain(getThemeScript());
  });

  it("applies the stored mode to <html> before React runs", () => {
    stored["fui-theme"] = "dark";
    run(getThemeScript());
    expect(root).toHaveAttribute("data-theme", "dark");
    expect(root.style.colorScheme).toBe("dark");
  });

  it("resolves a stored system mode, and the default, through the media query", () => {
    setSystem(true);
    stored["fui-theme"] = "system";
    run(getThemeScript({ defaultMode: "light" }));
    expect(root).toHaveAttribute("data-theme", "dark");

    delete stored["fui-theme"];
    run(getThemeScript({ defaultMode: "light" }));
    expect(root).toHaveAttribute("data-theme", "light");
  });

  it("ignores a stored value that is not a mode", () => {
    stored["fui-theme"] = "sepia";
    run(getThemeScript({ defaultMode: "dark" }));
    expect(root).toHaveAttribute("data-theme", "dark");
  });

  it("falls back to the system mode without throwing when storage access throws", () => {
    setSystem(true);
    setStorage(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    expect(() => run(getThemeScript())).not.toThrow();
    expect(root).toHaveAttribute("data-theme", "dark");
    expect(root.style.colorScheme).toBe("dark");
  });

  it("reads its own storage key and always writes data-theme", () => {
    stored["product-theme"] = "dark";
    run(getThemeScript({ storageKey: "product-theme" }));
    expect(root).toHaveAttribute("data-theme", "dark");
    expect(root).not.toHaveClass("dark");
  });

  it("writes root inputs and the primary chrome", () => {
    run(getThemeScript({ brand: "#16a34a", neutral: "paper", scale: 1.125, primaryChrome: "ink" }));
    expect(root.style.getPropertyValue("--fui-seed-brand")).toBe("#16a34a");
    expect(root.style.getPropertyValue("--fui-seed-neutral")).toBe("oklch(0.5 0.012 80)");
    expect(root.style.getPropertyValue("--fui-scale")).toBe("1.125");
    expect(root).toHaveAttribute("data-chrome", "ink");
  });

  it("escapes every value, so none can close the script element", () => {
    const font = '</script><script>alert(1)</script>"Inter"';
    const html = renderToStaticMarkup(<ThemeScript font={font} />);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    run(getThemeScript({ font }));
    expect(root.style.getPropertyValue("--fui-font-sans")).toBe(font);
  });
});
