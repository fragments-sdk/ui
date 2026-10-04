"use client";

import { compounds } from "../../../.output/compounds.generated";
import { renderShape } from "../../../shapes";

export function Probe({ name }: { name: string }) {
  const compound = compounds[name];
  if (!compound) return null;
  return <div data-rsc-compound={name}>{renderShape(name, compound)}</div>;
}
