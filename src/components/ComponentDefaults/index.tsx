"use client";

import * as React from "react";

export type ControlSize = "sm" | "md" | "lg";

export interface ComponentDefaults {
  /** Default size for interactive controls when no component-level size is set. */
  controlSize?: ControlSize;
}

export interface ComponentDefaultsProviderProps extends ComponentDefaults {
  children: React.ReactNode;
  /** Object form for passing defaults from ThemeProvider. */
  value?: ComponentDefaults;
}

const DEFAULT_COMPONENT_DEFAULTS: Required<ComponentDefaults> = {
  controlSize: "md",
};

const ComponentDefaultsContext = React.createContext<Required<ComponentDefaults> | null>(null);

export function ComponentDefaultsProvider({
  children,
  value,
  controlSize,
}: ComponentDefaultsProviderProps) {
  const parent = React.useContext(ComponentDefaultsContext) ?? DEFAULT_COMPONENT_DEFAULTS;
  const resolvedValue = React.useMemo<Required<ComponentDefaults>>(
    () => ({
      ...parent,
      ...value,
      controlSize: controlSize ?? value?.controlSize ?? parent.controlSize,
    }),
    [controlSize, parent, value]
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

export function useResolvedControlSize<TSize extends string>(
  explicitSize: TSize | undefined,
  fallback: ControlSize = DEFAULT_COMPONENT_DEFAULTS.controlSize
): TSize | ControlSize {
  const defaults = React.useContext(ComponentDefaultsContext);
  return explicitSize ?? defaults?.controlSize ?? fallback;
}
