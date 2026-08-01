import { describe, expect, it, vi } from "vitest";
import type { Plugin, UserConfig } from "vite";

vi.mock("vite", () => ({ defineConfig: (config: UserConfig) => config }));
vi.mock("@vitejs/plugin-react", () => ({ default: () => ({ name: "react" }) }));

import configExport from "../vite.config";

function configuredPlugins(): Plugin[] {
  const config = configExport as UserConfig;
  return (config.plugins ?? []).flat(Infinity).filter(Boolean) as Plugin[];
}

describe("library-only Vite plugins", () => {
  it("does not send Storybook HTML through the directive parser", async () => {
    const plugin = configuredPlugins().find(
      (candidate) => candidate.name === "preserve-directives"
    );
    expect(plugin).toBeDefined();
    expect(typeof plugin?.transform).toBe("function");

    const parse = vi.fn(() => {
      throw new Error("HTML reached the JavaScript parser");
    });
    const transform = plugin?.transform as NonNullable<Plugin["transform"]> &
      ((code: string, id: string) => unknown);
    const result = await transform.call({ parse } as never, "<!doctype html>", "/iframe.html");

    expect(result).toBeUndefined();
    expect(parse).not.toHaveBeenCalled();
  });
});
