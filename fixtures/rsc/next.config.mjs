// The server-component fixture. `pnpm run test:rsc` builds the library into .output/lib and
// writes .output/aliases.json, so the package resolves to the built files as an install would.
import { existsSync, readFileSync } from "node:fs";

const aliasesFile = new URL("./.output/aliases.json", import.meta.url);
if (!existsSync(aliasesFile)) {
  throw new Error("Run the fixture through `pnpm run test:rsc`; .output/aliases.json is missing.");
}
const aliases = JSON.parse(readFileSync(aliasesFile, "utf8"));

/** @type {import("next").NextConfig} */
export const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The fixture is checked by rendering it; the library's own typecheck covers its types.
  typescript: { ignoreBuildErrors: true },
  turbopack: { resolveAlias: aliases },
};

export default nextConfig;
