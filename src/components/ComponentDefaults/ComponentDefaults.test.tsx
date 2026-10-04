import { render, screen } from "../../test/utils";
import { describe, expect, it } from "vitest";

import {
  CONTROL_SIZES,
  ComponentDefaultsProvider,
  useResolvedControlSize,
  type ControlSize,
} from "./index";

function ResolvedSizeProbe({
  name,
  explicit,
  steps,
}: {
  name: string;
  explicit?: ControlSize;
  steps?: readonly ControlSize[];
}) {
  const size = useResolvedControlSize(explicit, steps);
  return <output data-testid={name}>{size}</output>;
}

describe("ComponentDefaults", () => {
  it("resolves explicit > nearest provider > md", () => {
    render(
      <>
        <ResolvedSizeProbe name="library-default" />

        <ComponentDefaultsProvider controlSize="lg">
          <ResolvedSizeProbe name="provider" />

          <ComponentDefaultsProvider controlSize="sm">
            <ResolvedSizeProbe name="nearest-provider" />
            <ResolvedSizeProbe name="explicit-size" explicit="lg" />
          </ComponentDefaultsProvider>
        </ComponentDefaultsProvider>
      </>
    );

    expect(screen.getByTestId("library-default")).toHaveTextContent("md");
    expect(screen.getByTestId("provider")).toHaveTextContent("lg");
    expect(screen.getByTestId("nearest-provider")).toHaveTextContent("sm");
    expect(screen.getByTestId("explicit-size")).toHaveTextContent("lg");
  });

  it("hands xs to controls that draw it and clamps it to sm for the rest", () => {
    render(
      <ComponentDefaultsProvider controlSize="xs">
        <ResolvedSizeProbe name="four-steps" steps={CONTROL_SIZES} />
        <ResolvedSizeProbe name="three-steps" />
      </ComponentDefaultsProvider>
    );

    expect(screen.getByTestId("four-steps")).toHaveTextContent("xs");
    expect(screen.getByTestId("three-steps")).toHaveTextContent("sm");
  });

  it("an omitted controlSize inherits the parent provider", () => {
    render(
      <ComponentDefaultsProvider controlSize="lg">
        <ComponentDefaultsProvider>
          <ResolvedSizeProbe name="inherited" />
        </ComponentDefaultsProvider>
      </ComponentDefaultsProvider>
    );

    expect(screen.getByTestId("inherited")).toHaveTextContent("lg");
  });

  it("exports the four control steps smallest first", () => {
    expect(CONTROL_SIZES).toEqual(["xs", "sm", "md", "lg"]);
  });
});
