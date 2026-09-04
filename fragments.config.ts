import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { FragmentsConfig } from "@usefragments/core";

/**
 * Resolve the public component vocabulary from the canonical workspace
 * catalog. Consumers share this loader so a missing or empty catalog fails
 * governance instead of silently disabling the component rules.
 */
const PROVIDER_ONLY_FRAGMENTS = new Set(["ComponentDefaults"]);

export function publicUiPrimitiveNames(
  catalogPath = join(dirname(fileURLToPath(import.meta.url)), "fragments.json")
): string[] {
  const catalog = JSON.parse(readFileSync(catalogPath, "utf-8")) as {
    fragments?: Record<string, unknown>;
  };
  // Providers ship no chrome of their own, so they are not canonical
  // primitives for `components/prefer-library` to point at.
  const names = Object.keys(catalog.fragments ?? {}).filter(
    (name) => !PROVIDER_ONLY_FRAGMENTS.has(name)
  );
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
        // Recipe mixins declare the component-scoped hooks their consumers
        // read (`--fui-action-*`, `--fui-field-*`, ...). They are scan inputs
        // for the undefined-token gate, not public catalog entries (UIR-D8).
        path: "src/recipes/*.scss",
        format: "scss",
      },
      {
        path: "src/components/**/*.module.scss",
        format: "scss",
      },
    ],
  },
  govern: {
    // The kit is its own canonical library: every public export in
    // fragments.json is the sanctioned implementation, so a raw element or a
    // second implementation of one of them inside the kit is a finding.
    presets: ["fragments"],
    canonicalSources: [
      {
        kind: "directory",
        path: "src/components",
        include: publicUiPrimitiveNames(),
      },
    ],
    rules: {
      "tokens/css-vars-must-be-defined": { enabled: true, severity: "error" },
      "tokens/require-dual-fallback": { enabled: true, severity: "error" },
      // Dimension and typography hygiene are armed: every length and type
      // ramp value flows through the measurement catalog or a `--fui-*` token.
      "styles/no-raw-dimensions": { enabled: true, severity: "error" },
      "styles/no-raw-typography": { enabled: true, severity: "error" },
      "components/prefer-library": { enabled: true, severity: "error" },
      "components/shadow-component": { enabled: true, severity: "error" },
    },
  },
};

export default config;
