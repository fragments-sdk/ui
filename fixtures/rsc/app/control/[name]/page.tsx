// The control for /server/<name>: the same shape, rendered inside a client module.
import { notFound } from "next/navigation";
import { compounds } from "../../../.output/compounds.generated";
import { Probe } from "./probe";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ name: string }> };

export default async function ControlCompound({ params }: Props) {
  const { name } = await params;
  if (!Object.hasOwn(compounds, name)) notFound();
  return <Probe name={name} />;
}
