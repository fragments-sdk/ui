import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Vocabulary schema gate (docs/fragments-v1/ARCHITECTURE.md, docs/fragments-v1/ARCHITECTURE.md).
 *
 * Every authored contract (`*.contract.json`) and every compiled entry in
 * `fragments.json` for a `*.fragment.tsx` component must keep the shared axes
 * inside the ruled vocabulary. `variant` is chrome only, `tone` is colour,
 * `size` is control height, `gap` is spacing, `status` is lifecycle. The
 * deleted axes `severity` and `appearance` may not come back under any name.
 */
const UI_ROOT = join(__dirname, "..");
const COMPONENTS_ROOT = join(UI_ROOT, "src", "components");
const CATALOG_PATH = join(UI_ROOT, "fragments.json");

const VOCABULARY: Record<string, readonly string[]> = {
  variant: ["solid", "soft", "outline", "ghost", "link"],
  tone: ["neutral", "accent", "info", "success", "warning", "danger"],
  size: ["sm", "md", "lg"],
  gap: ["none", "xs", "sm", "md", "lg", "xl"],
  status: ["idle", "pending", "streaming", "complete", "error"],
};

/** Glyph-scale components may extend `size` with the outer steps. */
const EXTENDED_SIZE_COMPONENTS = new Set(["Avatar", "Icon", "Chip", "Loading"]);
const EXTENDED_SIZE = ["xs", "xl"];

const FORBIDDEN_PROPS = ["severity", "appearance"];

/**
 * Example attributes that name a real kit API outside the ruled vocabulary.
 * Each row is a tracked Wave 1/2 finding (docs/fragments-v1/DECISIONS.md
 * UIR-D31); the gate fails if a row stops matching so the list cannot rot.
 */
const EXAMPLE_DEVIATIONS: ReadonlyArray<{
  component: string;
  prop: string;
  value: string;
  brief: string;
}> = [
  {
    component: "AppShell",
    prop: "variant",
    value: "floating",
    brief: "Wave 1 layout: slot chrome is not a variant",
  },
  {
    component: "Editor",
    prop: "status",
    value: "saving",
    brief: "Wave 2 AI surfaces: save status is not the lifecycle axis",
  },
  {
    component: "Editor",
    prop: "status",
    value: "saved",
    brief: "Wave 2 AI surfaces: save status is not the lifecycle axis",
  },
];

interface EnumProp {
  component: string;
  source: string;
  prop: string;
  values: string[];
}

interface ContractLike {
  name?: string;
  props?: Record<string, { type?: string; values?: unknown }>;
}

function listContractFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...listContractFiles(path));
    else if (entry.name.endsWith(".contract.json")) files.push(path);
  }
  return files.sort();
}

function listFragmentComponents(root: string): string[] {
  const names: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (existsSync(join(root, entry.name, `${entry.name}.fragment.tsx`))) names.push(entry.name);
  }
  return names.sort();
}

function collectEnumProps(component: string, source: string, contract: ContractLike): EnumProp[] {
  const props = contract.props ?? {};
  const out: EnumProp[] = [];
  for (const [prop, spec] of Object.entries(props)) {
    if (!spec || typeof spec !== "object") continue;
    const values = Array.isArray(spec.values)
      ? spec.values.filter((value): value is string => typeof value === "string")
      : [];
    out.push({ component, source, prop, values });
  }
  return out;
}

function loadSurface(): EnumProp[] {
  const surface: EnumProp[] = [];
  for (const file of listContractFiles(COMPONENTS_ROOT)) {
    const contract = JSON.parse(readFileSync(file, "utf-8")) as ContractLike;
    const component = contract.name ?? basename(dirname(file));
    surface.push(...collectEnumProps(component, relative(UI_ROOT, file), contract));
  }

  const fragmentComponents = listFragmentComponents(COMPONENTS_ROOT);
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as {
    fragments?: Record<string, ContractLike>;
  };
  for (const name of fragmentComponents) {
    const entry = catalog.fragments?.[name];
    if (!entry) {
      throw new Error(
        `${name}.fragment.tsx has no entry in fragments.json; run ` +
          `\`node packages/cli/dist/bin.js build --config libs/ui/fragments.config.ts\``
      );
    }
    surface.push(...collectEnumProps(name, `fragments.json#${name}`, entry));
  }
  return surface;
}

function allowedValues(component: string, prop: string): readonly string[] | null {
  const base = VOCABULARY[prop];
  if (!base) return null;
  if (prop === "size" && EXTENDED_SIZE_COMPONENTS.has(component)) {
    return [...base, ...EXTENDED_SIZE];
  }
  return base;
}

interface ExampleAttr {
  component: string;
  source: string;
  prop: string;
  value: string;
}

/**
 * Example snippets ship to the docs previews verbatim, so a deleted value in
 * `examples[].code` renders an unstyled component and teaches dead props.
 * Scan every kit element in every authored example for the shared axes.
 */
function loadExampleAttrs(): ExampleAttr[] {
  const attrs: ExampleAttr[] = [];
  const axes = Object.keys(VOCABULARY);
  for (const dir of readdirSync(COMPONENTS_ROOT)) {
    const file = join(COMPONENTS_ROOT, dir, `${dir}.contract.json`);
    if (!existsSync(file)) continue;
    const contract = JSON.parse(readFileSync(file, "utf8")) as {
      examples?: Array<{ code?: string }>;
    };
    (contract.examples ?? []).forEach((example, index) => {
      if (typeof example.code !== "string") return;
      const source = `${relative(UI_ROOT, file)} examples[${index}]`;
      for (const element of example.code.matchAll(
        /<([A-Z][A-Za-z0-9]*)(?:\.[A-Z][A-Za-z0-9]*)*\b([^>]*)>/g
      )) {
        const component = element[1];
        for (const attr of element[2].matchAll(/\b([a-zA-Z]+)="([^"]*)"/g)) {
          if (axes.includes(attr[1]))
            attrs.push({ component, source, prop: attr[1], value: attr[2] });
        }
      }
    });
  }
  return attrs;
}

describe("contract vocabulary", () => {
  const surface = loadSurface();

  it("covers the authored contracts and every fragment.tsx component", () => {
    const components = new Set(surface.map((entry) => entry.component));
    expect(components.size).toBeGreaterThan(40);
    for (const name of listFragmentComponents(COMPONENTS_ROOT)) {
      expect(components.has(name), `${name} missing from the vocabulary surface`).toBe(true);
    }
  });

  it("never exposes the deleted axes", () => {
    const offenders = surface
      .filter((entry) => FORBIDDEN_PROPS.includes(entry.prop))
      .map((entry) => `${entry.component}.${entry.prop} (${entry.source})`);
    expect(offenders).toEqual([]);
  });

  it("keeps example snippets inside the ruled vocabulary", () => {
    const offenders: string[] = [];
    const consumed = new Set<number>();
    for (const attr of loadExampleAttrs()) {
      const allowed = allowedValues(attr.component, attr.prop) ?? [];
      if (allowed.includes(attr.value)) continue;
      const deviation = EXAMPLE_DEVIATIONS.findIndex(
        (row) =>
          row.component === attr.component && row.prop === attr.prop && row.value === attr.value
      );
      if (deviation >= 0) {
        consumed.add(deviation);
        continue;
      }
      offenders.push(`${attr.component}.${attr.prop}="${attr.value}" (${attr.source})`);
    }
    expect(offenders).toEqual([]);
    const stale = EXAMPLE_DEVIATIONS.filter((_, index) => !consumed.has(index)).map(
      (row) => `${row.component}.${row.prop}="${row.value}"`
    );
    expect(stale, "delete deviation rows that no example uses any more").toEqual([]);
  });

  for (const axis of Object.keys(VOCABULARY)) {
    it(`keeps every \`${axis}\` value inside the ruled vocabulary`, () => {
      const offenders: string[] = [];
      for (const entry of surface) {
        if (entry.prop !== axis) continue;
        const allowed = allowedValues(entry.component, axis) ?? [];
        for (const value of entry.values) {
          if (!allowed.includes(value)) {
            offenders.push(`${entry.component}.${axis}="${value}" (${entry.source})`);
          }
        }
      }
      expect(offenders).toEqual([]);
    });
  }
});
