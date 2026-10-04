"use client";

import * as React from "react";

/**
 * The control steps, smallest first: xs 24, sm 28, md 32, lg 40 (each times
 * `--fui-scale`). One track for every control, field and row.
 */
export const CONTROL_SIZES = ["xs", "sm", "md", "lg"] as const;

export type ControlSize = (typeof CONTROL_SIZES)[number];

/** The steps a control has when it does not say otherwise: sm, md and lg. */
const DEFAULT_STEPS: readonly ControlSize[] = ["sm", "md", "lg"];

export interface ComponentDefaults {
  /** Default size for interactive controls when no component-level size is set. */
  controlSize?: ControlSize;
}

export interface ComponentDefaultsProviderProps extends ComponentDefaults {
  children: React.ReactNode;
}

const DEFAULT_COMPONENT_DEFAULTS: Required<ComponentDefaults> = {
  controlSize: "md",
};

const ComponentDefaultsContext = React.createContext<Required<ComponentDefaults> | null>(null);

/**
 * Sets the default control size for every control below it. It renders no
 * element and paints nothing, so it can make a toolbar or a sidebar dense
 * without re-theming it. A nested provider overrides its parent; an explicit
 * `size` on a control always wins.
 *
 * It composes with the theme's `--fui-scale`: the provider picks the step,
 * the scale multiplies every step's height.
 */
export function ComponentDefaultsProvider({
  children,
  controlSize,
}: ComponentDefaultsProviderProps) {
  const parent = React.useContext(ComponentDefaultsContext) ?? DEFAULT_COMPONENT_DEFAULTS;
  const resolvedValue = React.useMemo<Required<ComponentDefaults>>(
    () => ({ ...parent, controlSize: controlSize ?? parent.controlSize }),
    [controlSize, parent]
  );

  return (
    <ComponentDefaultsContext.Provider value={resolvedValue}>
      {children}
    </ComponentDefaultsContext.Provider>
  );
}

export function useComponentDefaults() {
  return React.useContext(ComponentDefaultsContext) ?? DEFAULT_COMPONENT_DEFAULTS;
}

/** The step in `steps` nearest to `size` on the track, the smaller on a tie. */
function nearestStep<TStep extends ControlSize>(size: ControlSize, steps: readonly TStep[]): TStep {
  if ((steps as readonly ControlSize[]).includes(size)) return size as TStep;
  const index = CONTROL_SIZES.indexOf(size);
  let best = steps[0];
  let bestDistance = Infinity;
  for (const step of steps) {
    const distance = Math.abs(CONTROL_SIZES.indexOf(step) - index);
    if (distance < bestDistance) {
      best = step;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * A control's size: its own `size` prop, else the nearest provider's
 * `controlSize`, else md. `steps` lists the sizes the control draws; a
 * provider size it lacks resolves to its nearest step (a control without an
 * xs step renders sm inside an xs region). Pass `CONTROL_SIZES` when the
 * control draws all four.
 */
export function useResolvedControlSize<
  TSize extends string,
  TStep extends ControlSize = Exclude<ControlSize, "xs">,
>(
  explicitSize: TSize | undefined,
  steps: readonly TStep[] = DEFAULT_STEPS as TStep[]
): TSize | TStep {
  const defaults = React.useContext(ComponentDefaultsContext);
  if (explicitSize !== undefined) return explicitSize;
  return nearestStep(defaults?.controlSize ?? DEFAULT_COMPONENT_DEFAULTS.controlSize, steps);
}
