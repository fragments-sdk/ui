import { render, screen } from "../../test/utils";
import { describe, expect, it } from "vitest";

import { ComponentDefaultsProvider, useResolvedControlSize, type ControlSize } from "./index";

function ResolvedSizeProbe({
  name,
  explicit,
  fallback,
}: {
  name: string;
  explicit?: ControlSize;
  fallback?: ControlSize;
}) {
  const size = useResolvedControlSize(explicit, fallback);
  return <output data-testid={name}>{size}</output>;
}

describe("ComponentDefaults", () => {
  it("resolves explicit > nearest provider > component fallback > md", () => {
    render(
      <>
        <ResolvedSizeProbe name="library-default" />
        <ResolvedSizeProbe name="component-fallback" fallback="sm" />

        <ComponentDefaultsProvider controlSize="lg">
          <ResolvedSizeProbe name="provider-over-fallback" fallback="sm" />

          <ComponentDefaultsProvider controlSize="sm">
            <ResolvedSizeProbe name="nearest-provider" fallback="lg" />
            <ResolvedSizeProbe name="explicit-size" explicit="lg" fallback="md" />
          </ComponentDefaultsProvider>
        </ComponentDefaultsProvider>
      </>
    );

    expect(screen.getByTestId("library-default")).toHaveTextContent("md");
    expect(screen.getByTestId("component-fallback")).toHaveTextContent("sm");
    expect(screen.getByTestId("provider-over-fallback")).toHaveTextContent("lg");
    expect(screen.getByTestId("nearest-provider")).toHaveTextContent("sm");
    expect(screen.getByTestId("explicit-size")).toHaveTextContent("lg");
  });
});
