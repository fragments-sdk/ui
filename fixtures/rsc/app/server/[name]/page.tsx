// A server page that dots into one compound, as an adopter's server page would.
import { notFound } from "next/navigation";
import { compounds } from "../../../.output/compounds.generated";
import { renderShape } from "../../../shapes";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ name: string }> };

export default async function ServerCompound({ params }: Props) {
  const { name } = await params;
  const compound = compounds[name];
  if (!compound) notFound();

  const root = compound.root as Record<string, unknown>;
  const unresolved = compound.parts.filter((part) => {
    try {
      return root[part] === undefined;
    } catch {
      return true;
    }
  });
  if (unresolved.length > 0) {
    const parts = unresolved.map((part) => `${name}.${part}`).join(", ");
    const message = `${name}: undefined in a server component: ${parts}`;
    // The runner reads this line to record the reason.
    console.error(`[rsc] ${message}`);
    throw new Error(message);
  }

  return <div data-rsc-compound={name}>{renderShape(name, compound)}</div>;
}
