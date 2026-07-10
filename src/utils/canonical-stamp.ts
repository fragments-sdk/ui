export type FragmentsCanonicalStampProps = {
  "data-fc-canonical"?: string;
  "data-fc-slot"?: string;
  "data-fc-contract"?: string;
};

/**
 * Dev-only governance stamps consumed by Fragments Inspect. They mark a DOM
 * element as the rendered output of a canonical design-system component so the
 * Inspect host can grade it green ("source-bound canonical stamp") instead of
 * falling back to advisory. The `source:` contract prefix is what earns
 * `source_bound` trust on the host (see `stampTrustForSourceBackedHost`).
 *
 * The stamp is emitted unless we can PROVE we are in a production build. We read
 * `process.env.NODE_ENV` directly so bundlers (Vite/Next/webpack) statically
 * replace it and tree-shake the stamp out of production, while tolerating
 * runtimes where `process` is genuinely undefined (an unbundled browser) by
 * emitting.
 *
 * NOTE: an earlier guard `typeof process === "undefined" || ...` silently
 * disabled the stamp in EVERY browser runtime — `process` is undefined in the
 * browser, so it short-circuited to no stamp, which is the opposite of intent.
 * Detect production affirmatively instead.
 */
export function fragmentsCanonicalStampProps(
  component: string,
  slot = "root"
): FragmentsCanonicalStampProps {
  if (isProductionBuild()) return {};
  return {
    "data-fc-canonical": component,
    "data-fc-slot": slot,
    "data-fc-contract": `source:@usefragments/ui#${component}`,
  };
}

function isProductionBuild(): boolean {
  try {
    // Bundlers statically replace this member expression, so production builds
    // collapse to `"production" === "production"` and the stamp drops out. When
    // `process` is genuinely absent (unbundled browser), the reference throws
    // and we treat it as non-production (emit).
    return process.env.NODE_ENV === "production";
  } catch {
    return false;
  }
}
