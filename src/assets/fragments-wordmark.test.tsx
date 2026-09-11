import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FragmentsWordmark } from "./fragments-wordmark";

afterEach(cleanup);

describe("FragmentsWordmark", () => {
  it("provides a single accessible brand image without loading a font or image URL", () => {
    const { container } = render(<FragmentsWordmark />);
    const mark = screen.getByRole("img", { name: "Fragments" });
    expect(mark).toHaveStyle({ height: "20px" });
    expect(mark.style.backgroundColor).toBe("currentcolor");
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1);
    expect(mark.style.maskImage).toContain("data:image/svg+xml,");
    const svg = decodeURIComponent(
      mark.style.maskImage.split(",").slice(1).join(",").replace(/"\)$/, "")
    );
    const document = new DOMParser().parseFromString(svg, "image/svg+xml");
    expect(document.querySelector("parsererror")).toBeNull();
    expect(document.querySelectorAll("path")).toHaveLength(2);
    expect(document.querySelector("text, image, script, foreignObject")).toBeNull();
  });

  it("keeps the caller’s class and scales proportionally at small and large sizes", () => {
    const { rerender } = render(<FragmentsWordmark height={16} className="brand" />);
    const mark = screen.getByRole("img", { name: "Fragments" });
    const smallWidth = Number.parseFloat(mark.style.width);
    expect(mark).toHaveClass("brand");
    rerender(<FragmentsWordmark height={64} className="brand" />);
    expect(mark).toHaveStyle({ height: "64px" });
    expect(Number.parseFloat(mark.style.width)).toBeCloseTo(smallWidth * 4);
  });
});
