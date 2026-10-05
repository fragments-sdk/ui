import tseslint from "typescript-eslint";

import { fuiEslintPlugin } from "./plugin.mjs";

/**
 * Flat config for the library's source rules, self-contained so the lane never depends on a
 * repository-level ESLint config. Unused `fui/` disables surface as
 * `fui/conventions/needless-disable` (the lane maps ESLint's unused-directive report).
 */
export const fuiEslintConfig = [
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
    },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    plugins: { fui: fuiEslintPlugin },
    rules: Object.fromEntries(
      Object.keys(fuiEslintPlugin.rules).map((name) => [`fui/${name}`, "error"])
    ),
  },
];
