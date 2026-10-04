import { resolve } from "node:path";

import * as sass from "sass";
import { describe, it, expect } from "vitest";
import { render, screen, expectNoA11yViolations } from "../../test/utils";
import { Progress } from "./index";

const css = sass
  .compile(resolve(process.cwd(), "src/components/Progress/Progress.module.scss"), {
    style: "expanded",
  })
  .css.replace(/\s+/g, " ");

describe("Progress", () => {
  it("renders a progressbar role", () => {
    render(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sets aria-valuenow, aria-valuemin, and aria-valuemax", () => {
    render(<Progress value={30} min={0} max={100} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "30");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders as indeterminate when value is null", () => {
    const { container } = render(<Progress value={null} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("aria-busy", "true");
    expect(bar).toHaveAttribute("aria-valuetext", "Loading");
    const indicator = container.querySelector<HTMLElement>("[class*='indicator']");
    expect(indicator).toHaveClass("indicatorIndeterminate");
    expect(indicator?.style.transform).toBe("");
  });

  it("renders a label", () => {
    render(<Progress value={40} label="Upload progress" />);
    expect(screen.getByText("Upload progress")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Upload progress" })).toBeInTheDocument();
  });

  it("shows percentage when showValue is true", () => {
    render(<Progress value={75} showValue />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("localises through the aria props", () => {
    render(<Progress value={null} aria-label="Hochladen" aria-valuetext="Wird geladen" />);
    const bar = screen.getByRole("progressbar", { name: "Hochladen" });
    expect(bar).toHaveAttribute("aria-valuetext", "Wird geladen");
  });

  it("fills by scaling the whole track from its start edge", () => {
    const { container } = render(<Progress value={25} />);
    const indicator = container.querySelector<HTMLElement>("[class*='indicator']");
    expect(indicator?.style.transform).toBe("scaleX(0.25)");
    expect(indicator?.style.width).toBe("100%");
    expect(css).toContain("transform-origin: left center");
    expect(css).toMatch(/\.indicator:dir\(rtl\) \{ transform-origin: right center; \}/);
    expect(css).toContain(
      "transition: transform var(--fui-duration-enter-lg, 200ms) var(--fui-ease-standard"
    );
    expect(css).not.toMatch(/transition: inline-size/);
  });

  it("has one 4px track on the band at the control radius", () => {
    expect(css).toMatch(
      /\.track \{[^}]*block-size: var\(--fui-raw-space-4, 4px\);[^}]*background-color: var\(--fui-bg-secondary[^}]*border-radius: var\(--fui-radius-control/
    );
    expect(css).not.toMatch(/track(Sm|Md|Lg)|radius-full|bg-tertiary/);
  });

  it("fills in the selection colour", () => {
    expect(css).toMatch(/\.indicator \{[^}]*background-color: var\(--fui-control-checked-bg/);
  });

  it("runs a 30% bar while uncounted, and holds the whole track at half strength under reduced motion", () => {
    expect(css).toMatch(
      /\.indicatorIndeterminate \{ inline-size: 30%; animation: fui-progress-run /
    );
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{ \.indicatorIndeterminate \{ inline-size: 100%; animation: none; opacity: 0\.5; \} \}/
    );
  });

  it("supports a neutral meter without treating its maximum as success", () => {
    const { container } = render(
      <Progress value={100} tone="neutral" role="meter" aria-label="Rule distribution" />
    );
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
    expect(container.querySelector('[class*="indicator"]')).toHaveClass("indicatorNeutral");
  });

  it.each([
    ["warning", "indicatorWarning"],
    ["danger", "indicatorDanger"],
  ] as const)("paints the %s tone", (tone, className) => {
    const { container } = render(<Progress value={90} tone={tone} />);
    expect(container.querySelector('[class*="indicator"]')).toHaveClass(className);
  });

  it("has no success tone and no ring", () => {
    expect(css).not.toMatch(/Success|circular/i);
    expect(Object.keys(Progress)).toEqual(["Root"]);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Progress value={60} label="Loading" />);
    await expectNoA11yViolations(container);
  });

  it("clamps displayed percentage and handles invalid ranges safely", () => {
    const { rerender } = render(<Progress value={150} showValue />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");

    rerender(<Progress value={50} min={100} max={100} showValue />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
