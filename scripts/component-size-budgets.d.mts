import type { CSSOptions, Plugin } from "vite";

type InlinePostCSS = Exclude<NonNullable<CSSOptions["postcss"]>, string>;

export function componentNames(root: string): string[];

export function componentSizeBudgets(options: { root: string }): {
  postcss: NonNullable<InlinePostCSS["plugins"]>[number];
  plugin: Plugin;
};
