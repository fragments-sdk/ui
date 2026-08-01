import { describe, expect, it } from "vitest";
import { POPUP_OFFSET_PX, POPUP_VIEWPORT_ROWS, resolvePopupViewportRows } from "./popup";

describe("popup geometry", () => {
  it("shares the generated four-pixel positioner offset", () => {
    expect(POPUP_OFFSET_PX).toBe(4);
  });

  it("defaults to four complete rows plus a continuation cue", () => {
    expect(POPUP_VIEWPORT_ROWS).toBe(4.5);
    expect(resolvePopupViewportRows()).toBe(4.5);
  });

  it.each([
    [1, 1.5],
    [4.9, 4.5],
    [0, 4.5],
    [-1, 4.5],
    [Number.POSITIVE_INFINITY, 4.5],
  ])("resolves maxVisibleItems %s to %s rows", (input, expected) => {
    expect(resolvePopupViewportRows(input)).toBe(expected);
  });
});
