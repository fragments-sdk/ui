import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ComponentType } from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import Ajv from "ajv";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ComponentMetadata } from "./metadata";
import {
  componentCssVariables,
  componentAttributeNames,
  cssVariableReads,
} from "./test/meta-source";

// State fixtures also carry browser-only paint probes. DOM checks render their
// actual component children; the visual probes belong to their browser runner.
vi.mock("./test/token-probe", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./test/token-probe")>()),
  TokenChecks: ({ children }: { children: React.ReactNode }) => children,
  frames: () => Promise.resolve(),
}));

const componentRoot = join(__dirname, "components");
const schemaPath = join(__dirname, "component-meta.schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
const validate = new Ajv({ allErrors: true }).compile<ComponentMetadata>(schema);
const fixtures = import.meta.glob<Record<string, ComponentType>>("./components/*/*.states.tsx");
const names = readdirSync(componentRoot).filter((name) =>
  existsSync(join(componentRoot, name, "index.tsx"))
);

afterEach(cleanup);

describe("component metadata", () => {
  it("uses one metadata file per component and the shared schema", () => {
    expect(names.length).toBeGreaterThan(60);
    for (const name of names) {
      const files = readdirSync(join(componentRoot, name));
      expect(files.filter((file) => file.endsWith(".meta.json"))).toEqual([`${name}.meta.json`]);
      expect(files.filter((file) => file.endsWith(".contract.json"))).toEqual([]);
      const metadata = JSON.parse(
        readFileSync(join(componentRoot, name, `${name}.meta.json`), "utf8")
      );
      expect(validate(metadata), `${name}: ${JSON.stringify(validate.errors)}`).toBe(true);
      expect(metadata.name).toBe(name);
      expect(metadata.sourcePath).toBe(`src/components/${name}/index.tsx`);
      expect(existsSync(join(__dirname, "..", metadata.sourcePath))).toBe(true);
    }
  });

  it("counts CSS reads without accepting comments, strings, or declarations", () => {
    const reads = cssVariableReads(`
      // var(--fui-comment-only)
      .root {
        --fui-declaration-only: red;
        content: "var(--fui-string-only)";
        color: var(--fui-text-primary, var(--fui-text-secondary));
      }
    `);
    expect(reads).toEqual(["--fui-text-primary", "--fui-text-secondary"]);
  });

  for (const name of names) {
    const directory = join(componentRoot, name);
    const metadata = JSON.parse(
      readFileSync(join(directory, `${name}.meta.json`), "utf8")
    ) as ComponentMetadata;

    it(`${name}: lists exactly the public CSS variables its runtime modules read`, () => {
      expect(metadata.cssVariables).toEqual(componentCssVariables(directory));
    });

    it(`${name}: publishes only attributes declared by its runtime modules`, () => {
      const names = componentAttributeNames(directory);
      for (const attribute of metadata.attributes) expect(names).toContain(attribute.name);
    });

    const fixtureNames = [...new Set(metadata.attributes.map((attribute) => attribute.fixture))];
    for (const fixture of fixtureNames) {
      it(`${name}.${fixture}: every published attribute appears in its rendered DOM`, async () => {
        const load = fixtures[`./components/${name}/${name}.states.tsx`];
        expect(load, `${name} has no state fixture module`).toBeTypeOf("function");
        const module = await load();
        expect(module[fixture], `${name}.${fixture} is missing`).toBeTypeOf("function");
        render(createElement(module[fixture]));
        for (const attribute of metadata.attributes.filter((entry) => entry.fixture === fixture)) {
          await waitFor(() => {
            const elements = [...document.querySelectorAll(`[${attribute.name}]`)];
            expect(
              elements.some((element) => element.getAttribute(attribute.name) === attribute.value),
              `${name}.${fixture}: the rendered DOM must have ${attribute.name}=${JSON.stringify(attribute.value)}`
            ).toBe(true);
          });
        }
      }, 45_000);
    }
  }
});
