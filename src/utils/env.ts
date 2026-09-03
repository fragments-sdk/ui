/**
 * Build-mode guards for dev-only warnings.
 *
 * Bundlers replace the `process.env.NODE_ENV` member expression statically, so production
 * builds fold these to constants and the guarded code drops out. The local declaration keeps
 * source-registry installs compiling in apps without Node types; when `process` is genuinely
 * absent at runtime (unbundled browser), the reference throws and we treat it as development.
 */
declare const process: { env: { NODE_ENV?: string } };

function nodeEnv(): string | undefined {
  try {
    return process.env.NODE_ENV;
  } catch {
    return undefined;
  }
}

export function isProductionBuild(): boolean {
  return nodeEnv() === "production";
}

export function isDevelopmentBuild(): boolean {
  return nodeEnv() === "development";
}
