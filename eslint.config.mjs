import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const languageGlobals = {
  ...globals.browser,
  ...globals.node,
  ...globals.es2024,
};

export default tseslint.config(
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    ignores: [
      "**/.git/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/*.d.ts",
      "**/fragments.json",
      "**/tsconfig.tsbuildinfo",
    ],
  },
  {
    // Deliberately broken inputs for the doctrine lint, which lints them itself.
    ignores: ["eslint/__fixtures__/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: languageGlobals,
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/component-hook-factories": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
      "prefer-const": "warn",
      "no-useless-escape": "warn",
      "no-case-declarations": "warn",
      "no-control-regex": "warn",
      "no-console": "off",
      "no-undef": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.fragment.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
  prettierConfig
);
