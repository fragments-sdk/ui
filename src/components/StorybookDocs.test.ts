import { describe, expect, it } from "vitest";
import dialogMeta from "./Dialog/Dialog.stories";
import mainMeta from "./Main/Main.stories";
import tooltipMeta from "./Tooltip/Tooltip.stories";

const storyModules = import.meta.glob<Record<string, unknown>>("./**/*.stories.tsx", {
  eager: true,
});

const affectedDocs = [
  ["Main", mainMeta],
  ["Dialog", dialogMeta],
  ["Tooltip", tooltipMeta],
] as const;

describe("Storybook docs metadata", () => {
  it.each(affectedDocs)("keeps %s JSX children out of component-level args", (_name, meta) => {
    expect(meta.args).not.toHaveProperty("children");
  });

  it.each(Object.entries(storyModules))("keeps %s args acyclic", (path, story) => {
    for (const [exportName, exportedValue] of Object.entries(story)) {
      const args = (exportedValue as { args?: unknown } | undefined)?.args;
      expect(
        findCycle(args),
        `${path}#${exportName} contains a circular arg at`,
      ).toBeUndefined();
    }
  });
});

function findCycle(
  value: unknown,
  ancestors = new WeakSet<object>(),
  path = "args"
): string | undefined {
  if ((typeof value !== "object" && typeof value !== "function") || value === null) {
    return undefined;
  }

  const objectValue = value as object;
  if (ancestors.has(objectValue)) {
    return path;
  }

  ancestors.add(objectValue);
  for (const key of Object.keys(objectValue)) {
    const cycle = findCycle(
      (objectValue as Record<string, unknown>)[key],
      ancestors,
      `${path}.${key}`
    );
    if (cycle) {
      return cycle;
    }
  }
  ancestors.delete(objectValue);

  return undefined;
}
