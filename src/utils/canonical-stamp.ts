import { isProductionBuild } from "./env";

export type FragmentsCanonicalStampProps = {
  "data-fc-canonical"?: string;
  "data-fc-slot"?: string;
  "data-fc-contract"?: string;
};

/**
 * Development-only attributes that mark a DOM element as the rendered output of
 * a library component, for inspection tools: the component name, the slot, and
 * a `source:@usefragments/ui#<Name>` contract that ties it to this package.
 *
 * The stamp is emitted unless the build is a production build. `process.env.NODE_ENV`
 * is read directly so bundlers replace it statically and tree-shake the stamp out
 * of production. Where `process` is undefined (an unbundled browser) the stamp is
 * still emitted, so production is detected affirmatively rather than assumed from
 * a missing `process`.
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
