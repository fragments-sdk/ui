import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { checkBudgets, runBudgetCheck } from "../check-budgets.mjs";
import { componentSizeBudgets } from "../component-size-budgets.mjs";

const limits = {
  version: 1,
  components: { Button: { cssBytes: 120, jsBytes: 250 } },
};
const measured = {
  version: 1,
  formats: ["es", "cjs"],
  components: { Button: { cssBytes: 100, jsBytes: 200 } },
};

test("exact ceilings pass and either CSS or JS overage is rejected", () => {
  assert.deepEqual(checkBudgets(limits, measured, ["Button"]), []);
  assert.deepEqual(
    checkBudgets(limits, { ...measured, components: limits.components }, ["Button"]),
    []
  );
  assert.deepEqual(
    checkBudgets(limits, { ...measured, components: { Button: { cssBytes: 121, jsBytes: 251 } } }, [
      "Button",
    ]),
    [
      "Button: cssBytes 121 bytes exceeds 120 bytes by 1",
      "Button: jsBytes 251 bytes exceeds 250 bytes by 1",
    ]
  );
});

test("new components, omitted output and stale budgets fail instead of bypassing limits", () => {
  assert.deepEqual(checkBudgets(limits, measured, ["Button", "Card"]), [
    "Card: missing component budget",
    "Card: missing build measurement",
  ]);
  assert.deepEqual(checkBudgets(limits, measured, []), [
    "Button: stale component budget",
    "Button: stale component measurement",
  ]);
  assert.match(checkBudgets(limits, { ...measured, formats: ["es"] }, ["Button"])[0], /both/);
});

test("invalid limits, incomplete measurements and zero emitted JS fail", () => {
  const problems = checkBudgets(
    { ...limits, components: { Button: { cssBytes: -1, jsBytes: "250" } } },
    { ...measured, components: { Button: { cssBytes: undefined, jsBytes: 0 } } },
    ["Button"]
  );
  assert.equal(problems.length, 4);
  assert.match(problems[3], /no emitted/);
});

test("the build checker throws when an on-disk component exceeds its budget", () => {
  const root = mkdtempSync(join(tmpdir(), "fragments-budget-check-"));
  try {
    mkdirSync(join(root, "src/components/Button"), { recursive: true });
    mkdirSync(join(root, "dist"));
    writeFileSync(join(root, "budgets.json"), JSON.stringify(limits));
    writeFileSync(
      join(root, "dist/component-sizes.json"),
      JSON.stringify({ ...measured, components: { Button: { cssBytes: 121, jsBytes: 200 } } })
    );
    assert.throws(() => runBudgetCheck(root), /cssBytes 121 bytes exceeds 120/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("measurement includes CSS maps, nested modules and virtual entries in the larger output", () => {
  const root = mkdtempSync(join(tmpdir(), "fragments-budget-measure-"));
  try {
    mkdirSync(join(root, "src/components/DataTable"), { recursive: true });
    const { plugin, postcss } = componentSizeBudgets({ root });
    plugin.configResolved({ command: "build", build: { lib: { entry: "index.ts" } } });
    const component = join(root, "src/components/DataTable");
    postcss.OnceExit(
      { toString: () => "._scoped { content: 'é'; }" },
      { result: { opts: { from: join(component, "DataTable.module.scss") } } }
    );
    // The same module can be processed again; it still contributes only once.
    postcss.OnceExit(
      { toString: () => "._scoped { content: 'é'; }" },
      { result: { opts: { from: join(component, "DataTable.module.scss") } } }
    );
    let report;
    const context = {
      getModuleIds() {
        return [join(component, "DataTable.module.scss")];
      },
      emitFile(asset) {
        report = JSON.parse(asset.source);
      },
      error(message) {
        throw new Error(message);
      },
    };
    const chunk = (path, code) => ({ type: "chunk", modules: { [path]: {} }, code });
    plugin.generateBundle.call(
      context,
      { format: "es" },
      {
        entry: chunk(join(component, "index.tsx"), "123"),
        virtual: chunk(join(component, "DataTable.virtual.tsx"), "4567"),
        cssMap: chunk(join(component, "DataTable.module.scss"), "89"),
        nested: chunk(join(component, "subparts/useSelection.ts"), "abc"),
        shared: chunk(join(root, "src/shared/utils.ts"), "excluded"),
      }
    );
    plugin.generateBundle.call(
      context,
      { format: "cjs" },
      {
        entry: chunk(join(component, "index.tsx"), "123456"),
        virtual: chunk(join(component, "DataTable.virtual.tsx"), "7890"),
        cssMap: chunk(join(component, "DataTable.module.scss"), "12"),
        nested: chunk(join(component, "subparts/useSelection.ts"), "abcde"),
      }
    );
    assert.deepEqual(report, {
      version: 1,
      formats: ["es", "cjs"],
      components: {
        DataTable: { cssBytes: Buffer.byteLength("._scoped { content: 'é'; }"), jsBytes: 17 },
      },
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a disconnected CSS measurement hook fails the build", () => {
  const root = mkdtempSync(join(tmpdir(), "fragments-budget-hook-"));
  try {
    mkdirSync(join(root, "src/components/Button"), { recursive: true });
    const { plugin } = componentSizeBudgets({ root });
    plugin.configResolved({ command: "build", build: { lib: { entry: "index.ts" } } });
    assert.throws(
      () =>
        plugin.generateBundle.call(
          {
            getModuleIds() {
              return [join(root, "src/components/Button/Button.module.scss")];
            },
            error(message) {
              throw new Error(message);
            },
          },
          { format: "es" },
          {}
        ),
      /Missing compiled CSS measurement/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("non-library builds ignore CSS and mixed-component chunks without emitting budgets", () => {
  const root = mkdtempSync(join(tmpdir(), "fragments-budget-app-build-"));
  try {
    mkdirSync(join(root, "src/components/Button"), { recursive: true });
    mkdirSync(join(root, "src/components/Card"), { recursive: true });
    const { plugin, postcss } = componentSizeBudgets({ root });
    plugin.configResolved({ command: "build", build: { lib: false } });
    postcss.OnceExit(
      { toString: () => "._button { color: red; }" },
      { result: { opts: { from: join(root, "src/components/Button/Button.module.scss") } } }
    );
    const assets = [];
    const context = {
      getModuleIds() {
        return [];
      },
      emitFile(asset) {
        assets.push(JSON.parse(asset.source));
      },
      error(message) {
        throw new Error(message);
      },
    };
    plugin.buildStart();
    plugin.generateBundle.call(
      context,
      { format: "es" },
      {
        app: {
          type: "chunk",
          fileName: "app.js",
          modules: {
            [join(root, "src/components/Button/index.tsx")]: {},
            [join(root, "src/components/Card/index.tsx")]: {},
          },
          code: "combined app bundle",
        },
      }
    );
    assert.deepEqual(assets, []);

    // Re-enabling library measurement proves app-build CSS was not retained.
    plugin.configResolved({ command: "build", build: { lib: { entry: "index.ts" } } });
    plugin.generateBundle.call(
      context,
      { format: "es" },
      {
        button: {
          type: "chunk",
          modules: { [join(root, "src/components/Button/index.tsx")]: {} },
          code: "button",
        },
      }
    );
    assert.equal(assets.length, 1);
    assert.equal(assets[0].components.Button.cssBytes, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
