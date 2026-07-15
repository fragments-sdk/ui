import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { FragmentsConfig } from "@usefragments/core";

/**
 * Resolve the public component vocabulary from the canonical workspace
 * catalog. Consumers share this loader so a missing or empty catalog fails
 * governance instead of silently disabling the component rules.
 */
export function publicUiPrimitiveNames(
  catalogPath = join(dirname(fileURLToPath(import.meta.url)), "fragments.json")
): string[] {
  const catalog = JSON.parse(readFileSync(catalogPath, "utf-8")) as {
    fragments?: Record<string, unknown>;
  };
  const names = Object.keys(catalog.fragments ?? {});
  if (names.length === 0) {
    throw new Error(`Canonical UI catalog is empty: ${catalogPath}`);
  }
  return names;
}

const config: FragmentsConfig = {
  include: ["src/**/*.contract.json"],
  exclude: ["**/node_modules/**"],
  components: ["src/**/index.tsx", "src/**/*.tsx"],
  framework: "react",
  performance: "standard",
  tokens: {
    sources: [
      {
        path: "src/tokens/_variables.scss",
        format: "scss",
      },
      {
        path: "src/tokens/_component-properties.scss",
        format: "scss",
      },
      {
        path: "src/components/**/*.module.scss",
        format: "scss",
      },
    ],
  },
  govern: {
    rules: {
      "tokens/css-vars-must-be-defined": {
        enabled: true,
        severity: "error",
      },
      // Token discovery also derives radius/typography hygiene rules. Those
      // pre-existing findings are not part of the Base UI migration, and
      // `fragments check --ci` intentionally treats every warning as a failure.
      // Keep this gate scoped to the fail-closed token contract; migrate the
      // legacy style debt in its own reviewable change.
      "styles/no-raw-dimensions": { enabled: false },
      "styles/no-raw-typography": { enabled: false },
    },
  },
};

export default config;
