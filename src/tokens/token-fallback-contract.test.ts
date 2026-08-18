import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import * as sass from "sass";
import { describe, expect, it } from "vitest";

/**
 * Published component stylesheets must reference global design tokens as
 * `var(--fui-token, $fui-token)`. The CSS custom property serves runtime
 * theming; the SCSS variable is compiled in so the declaration still resolves
 * when a consumer loads component CSS without the token layer, or ships a
 * partial theme that omits a role.
 *
 * Without the build-time half, a bare `var()` on an undefined property makes
 * the whole declaration invalid at computed-value time. For a `color-mix()`
 * surface that means a fully transparent control rather than a fallback
 * colour — a Switch whose off state is indistinguishable from its on state.
 *
 * Only tokens with a `$fui-*` counterpart are gated. Component-scoped custom
 * properties (`--fui-sidebar-gutter`, `--fui-navigation-row-track`, …) are
 * defined by the recipe layer at runtime, have no SCSS variable, and are
 * correctly written as bare `var()`.
 */

const TOKENS_DIR = join(__dirname);
const COMPONENTS_DIR = join(__dirname, "..", "components");

/**
 * Storybook-only prototype surfaces. They are not in the public catalog, are
 * not exported from `src/index.ts`, and are absent from the Vite library
 * entries, so they never reach a consumer's stylesheet.
 */
const UNPUBLISHED_DIRS = ["Cloud"];

function walk(dir: string, match: (path: string) => boolean): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".")) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...walk(path, match));
    else if (match(path)) found.push(path);
  }
  return found;
}

function scssTokenVariables(): Set<string> {
  const names = new Set<string>();
  for (const file of walk(TOKENS_DIR, (p) => p.endsWith(".scss"))) {
    const source = readFileSync(file, "utf-8");
    for (const match of source.matchAll(/^\s*\$(fui-[a-z0-9-]+)\s*:/gm)) {
      names.add(match[1]);
    }
  }
  return names;
}

function publishedComponentStylesheets(): string[] {
  return walk(COMPONENTS_DIR, (p) => p.endsWith(".module.scss")).filter(
    (path) => !UNPUBLISHED_DIRS.some((dir) => path.includes(`/components/${dir}/`))
  );
}

describe("published component token references", () => {
  it("resolves at least one global token variable to gate against", () => {
    expect(scssTokenVariables().size).toBeGreaterThan(0);
    expect(publishedComponentStylesheets().length).toBeGreaterThan(0);
  });

  it("pairs every global token reference with its SCSS build-time fallback", () => {
    const scssVariables = scssTokenVariables();
    const violations: string[] = [];

    for (const file of publishedComponentStylesheets()) {
      readFileSync(file, "utf-8")
        .split("\n")
        .forEach((line, index) => {
          if (/^\s*(\/\/|\/\*)/.test(line)) return;
          for (const match of line.matchAll(/var\(\s*(--fui-[a-z0-9-]+)\s*\)/g)) {
            const token = match[1];
            if (!scssVariables.has(token.slice(2))) continue;
            const relative = file.slice(file.indexOf("/components/") + 1);
            violations.push(
              `${relative}:${index + 1} — ${token} needs var(${token}, $${token.slice(2)})`
            );
          }
        });
    }

    expect(violations, `Missing SCSS dual fallbacks:\n${violations.join("\n")}`).toEqual([]);
  });

  /**
   * Sass does not evaluate `$variables` inside a custom property declaration —
   * it copies the value through as an unparsed token stream. A fallback
   * written as `var(--fui-bg-elevated, $fui-bg-elevated)` therefore emits the
   * literal text `$fui-bg-elevated`, which is not a colour, so the declaration
   * is invalid and the fallback silently does nothing. Inside a custom
   * property the SCSS half must be interpolated: `#{$fui-bg-elevated}`.
   *
   * Asserting on compiled output catches every shape of this mistake rather
   * than the one spelling a source regex would know about.
   */
  it("emits no unevaluated SCSS variables in compiled component CSS", () => {
    const violations: string[] = [];

    for (const file of publishedComponentStylesheets()) {
      const compiled = sass.compile(file, {
        loadPaths: [join(__dirname, "..")],
        style: "expanded",
      }).css;

      for (const match of compiled.matchAll(/\$fui-[a-z0-9-]+/g)) {
        const relative = file.slice(file.indexOf("/components/") + 1);
        violations.push(
          `${relative} — emitted literal "${match[0]}"; interpolate as #{${match[0]}}`
        );
      }
    }

    expect(
      violations,
      `Unevaluated SCSS variables reached compiled CSS:\n${violations.join("\n")}`
    ).toEqual([]);
  });
});
