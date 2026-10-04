import tseslint from "typescript-eslint";

import { doctrineEslintPlugin } from "./plugin.mjs";

/**
 * Flat config for the doctrine source rules, self-contained so the lane never depends on a
 * repository-level ESLint config. Unused `fui/` disables surface as
 * `fui/conventions/needless-disable` (the lane maps ESLint's unused-directive report).
 */
export const doctrineEslintConfig = [
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
    },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    plugins: { fui: doctrineEslintPlugin },
    rules: Object.fromEntries(
      Object.keys(doctrineEslintPlugin.rules).map((name) => [`fui/${name}`, "error"])
    ),
  },
];
