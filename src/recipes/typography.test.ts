import { resolve } from "node:path";

import * as sass from "sass";
import { describe, expect, it } from "vitest";

import { MEASUREMENT_PROFILES } from "../measurements";

const sourceRoot = resolve(process.cwd(), "src");

const roles = MEASUREMENT_PROFILES.typography;

function compile(source: string) {
  return sass.compileString(source, { loadPaths: [sourceRoot], style: "expanded" }).css;
}

function ruleBody(css: string, selector: string) {
  const match = css.match(new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`, "s"));
  expect(match, `missing .${selector} in compiled CSS`).not.toBeNull();
  return match?.[1] ?? "";
}

describe("typography recipe", () => {
  it("emits the exact five-declaration contract for every closed role", () => {
    const specimens = Object.keys(roles)
      .map((role) => `.${role} { @include typography.role(${JSON.stringify(role)}); }`)
      .join("\n");
    const css = compile(`@use "recipes/typography";\n${specimens}`);

    for (const [role, values] of Object.entries(roles)) {
      const body = ruleBody(css, role);
      const declarations = body.match(/^[ ]{2}[\w-]+:/gm) ?? [];
      expect(declarations, role).toHaveLength(5);
      expect(body).toContain(`font-size: var(--fui-type-${role}-size, ${values.size})`);
      expect(body).toContain(`line-height: var(--fui-type-${role}-line, ${values.line})`);
      expect(body).toContain(
        `font-weight: var(--fui-type-${role}-weight, ${String(values.weight)})`
      );
      expect(body).toContain(
        `letter-spacing: var(--fui-type-${role}-tracking, ${values.tracking})`
      );

      if (role === "code") {
        expect(body).toContain("font-family: var(--fui-font-mono");
        expect(body).toContain("JetBrains Mono Variable");
      } else {
        expect(body).toContain("font-family: var(--fui-font-sans");
        expect(body).toContain("Inter Variable");
      }
    }
  });

  it("exposes each numeric selector independently", () => {
    const css = compile(`
      @use "recipes/typography";
      .probe {
        font-size: typography.font-size("ui-standard");
        line-height: typography.line-height("ui-standard");
        font-weight: typography.weight("ui-standard");
        letter-spacing: typography.tracking("ui-standard");
        font-family: typography.font-family("ui-standard");
      }
    `);

    expect(ruleBody(css, "probe")).toContain("font-size: var(--fui-type-ui-standard-size, 14px)");
  });

  it("fails Sass compilation for an unknown role", () => {
    expect(() =>
      compile(`
        @use "recipes/typography";
        .invalid { @include typography.role("marketing-display"); }
      `)
    ).toThrow(/Unknown typography role 'marketing-display'/);
  });
});
