import { readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

export function componentNames(root) {
  return readdirSync(resolve(root, "src/components"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * Measure the existing build, without compiling styles or modules a second time.
 * CSS is the UTF-8 size after Sass and CSS Modules, before aggregate stylesheet
 * assembly. JS includes every emitted module owned by a component directory,
 * including its CSS class map; shared modules and external dependencies are excluded.
 */
export function componentSizeBudgets({ root }) {
  const componentsRoot = resolve(root, "src/components");
  const cssSizes = new Map();
  const formatSizes = new Map();
  let enabled = false;

  function owner(id) {
    const path = relative(componentsRoot, id.replace(/^\0/, "").split("?")[0]);
    if (path.startsWith(`..${sep}`) || path === "..") return undefined;
    const [name, file] = path.split(sep);
    return file ? name : undefined;
  }

  return {
    postcss: {
      postcssPlugin: "fragments-component-size-budgets",
      OnceExit(css, { result }) {
        if (!enabled) return;
        const file = result.opts.from;
        if (file && owner(file)) cssSizes.set(file, Buffer.byteLength(css.toString()));
      },
    },
    plugin: {
      name: "fragments-component-size-budgets",
      apply: "build",
      configResolved(config) {
        enabled = config.command === "build" && Boolean(config.build.lib);
      },
      buildStart() {
        if (!enabled) return;
        formatSizes.clear();
      },
      generateBundle(output, bundle) {
        if (!enabled) return;
        const names = componentNames(root);
        const jsSizes = Object.fromEntries(names.map((name) => [name, 0]));
        const cssTotals = Object.fromEntries(names.map((name) => [name, 0]));
        for (const id of this.getModuleIds()) {
          const file = id.replace(/^\0/, "").split("?")[0];
          if (owner(file) && /\.(css|scss|sass)$/.test(file) && !cssSizes.has(file)) {
            this.error(`Missing compiled CSS measurement for ${file}`);
          }
        }
        for (const [file, bytes] of cssSizes) {
          const name = owner(file);
          if (Object.hasOwn(cssTotals, name)) cssTotals[name] += bytes;
        }
        for (const chunk of Object.values(bundle)) {
          if (chunk.type !== "chunk") continue;
          const owners = new Set(Object.keys(chunk.modules).map(owner).filter(Boolean));
          if (owners.size > 1) {
            this.error(`Cannot attribute ${chunk.fileName}: preserve component modules separately`);
          }
          const [name] = owners;
          if (name) jsSizes[name] += Buffer.byteLength(chunk.code);
        }
        formatSizes.set(output.format, jsSizes);
        const components = Object.fromEntries(
          names.map((name) => [
            name,
            {
              cssBytes: cssTotals[name],
              jsBytes: Math.max(...[...formatSizes.values()].map((sizes) => sizes[name] ?? 0)),
            },
          ])
        );
        this.emitFile({
          type: "asset",
          fileName: "component-sizes.json",
          source: `${JSON.stringify({ version: 1, formats: [...formatSizes.keys()], components }, null, 2)}\n`,
        });
      },
    },
  };
}
