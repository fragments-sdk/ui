import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FragmentsBrand } from "./fragments-brand";
import { fragmentsWordmarkSymbol } from "./fragments-wordmark-artwork";

afterEach(cleanup);

describe("FragmentsBrand", () => {
  it("renders the lockup and a symbol sized to match the symbol inside the lockup", () => {
    render(<FragmentsBrand height={40} className="brand" />);
    const [lockup, symbol] = screen.getAllByRole("img", { name: "Fragments" });
    expect(lockup).toHaveStyle({ height: "40px" });
    expect(lockup.style.maskImage).toContain("data:image/svg+xml,");
    const size = String(Math.round(40 * fragmentsWordmarkSymbol.height));
    expect(symbol).toHaveAttribute("width", size);
    expect(symbol).toHaveAttribute("height", size);
    expect(lockup.parentElement?.parentElement).toHaveClass("brand");
    expect(lockup.parentElement?.parentElement).toHaveAttribute("data-collapse", "below-md");
  });

  it("can keep the full lockup at every width", () => {
    render(<FragmentsBrand collapse="never" />);
    const [lockup] = screen.getAllByRole("img", { name: "Fragments" });
    expect(lockup.parentElement?.parentElement).toHaveAttribute("data-collapse", "never");
    expect(lockup.parentElement?.parentElement?.className).not.toMatch(/collapsible/);
  });
});
