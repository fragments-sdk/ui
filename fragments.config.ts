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
  // The compiler always retains brownfield `.contract.json` discovery. This
  // authored glob is the v3 source surface as components migrate one at a time.
  include: ["src/**/*.fragment.tsx"],
  exclude: ["**/node_modules/**"],
  components: [
    "src/**/index.tsx",
    "src/**/*.tsx",
    // ThemeToggle remains a physical module behind the public Theme identity.
    // Scope this exception to component discovery so its stylesheet still
    // participates in governance source discovery.
    "!src/components/ThemeToggle/**",
  ],
  framework: "react",
  performance: "standard",
  tokens: {
    // The authored-contract compiler still consumes tokens.include rather than
    // the richer governance sources below. Keep the curated catalog on shared
    // public authorities; component-local custom properties remain scan inputs
    // but must not be promoted into the public token vocabulary.
    include: [
      "src/tokens/_variables.scss",
      "src/tokens/_component-properties.scss",
      "src/tokens/_measurements.catalog.generated.css",
    ],
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
        // Governance sources take precedence over tokens.include. Keep the
        // generated fixed roles in both projections so the undefined-token
        // gate validates the same public vocabulary as the catalog.
        path: "src/tokens/_measurements.catalog.generated.css",
        format: "css",
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
