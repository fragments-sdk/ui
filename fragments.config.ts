import type { FragmentsConfig } from "@usefragments/core";

const config: FragmentsConfig = {
  include: ["src/**/*.contract.json"],
  exclude: ["**/node_modules/**"],
  components: ["src/**/index.tsx", "src/**/*.tsx"],
  framework: "react",
  performance: "standard",
};

export default config;
