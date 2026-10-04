import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useControllableState } from "./controllable-state";

describe("useControllableState", () => {
  it("keeps its own value when uncontrolled and reports each change", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<string | undefined>(undefined, "a", onChange)
    );
    expect(result.current[0]).toBe("a");
    act(() => result.current[1]("b"));
    expect(result.current[0]).toBe("b");
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("follows the parent's value when controlled", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState(value, "a", onChange),
      {
        initialProps: { value: "x" },
      }
    );
    act(() => result.current[1]("y"));
    expect(result.current[0]).toBe("x");
    expect(onChange).toHaveBeenCalledWith("y");
    rerender({ value: "y" });
    expect(result.current[0]).toBe("y");
  });
});
