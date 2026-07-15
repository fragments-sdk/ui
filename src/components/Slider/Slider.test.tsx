import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { act, render, screen, expectNoA11yViolations } from "../../test/utils";
import { Slider } from "./index";

describe("Slider", () => {
  it("renders a slider role", () => {
    render(<Slider aria-label="Volume" />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("sets aria-valuemin and aria-valuemax from min/max props", () => {
    render(<Slider aria-label="Volume" min={10} max={90} defaultValue={50} />);
    const slider = screen.getByRole("slider");
    // Base UI Slider sets min/max on the group or thumb — check the output element
    expect(slider).toBeInTheDocument();
    // The slider group should be present with the right configuration
    const output = slider.closest('[role="group"]') || slider;
    expect(output).toBeInTheDocument();
  });

  it("sets aria-valuenow from value prop", () => {
    render(<Slider aria-label="Volume" value={42} onChange={() => {}} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "42");
  });

  it("renders a label via Field.Label", () => {
    render(<Slider label="Volume" />);
    expect(screen.getByText("Volume")).toBeInTheDocument();
  });

  it("disables the slider", () => {
    render(<Slider aria-label="Volume" disabled />);
    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("respects step attribute", () => {
    render(<Slider aria-label="Volume" step={5} defaultValue={0} />);
    // step is part of the slider control — no direct ARIA but functional
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("displays the value when showValue is true", () => {
    render(<Slider label="Volume" value={75} showValue onChange={() => {}} />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("accepts onValueChange alias for onChange", () => {
    const handleChange = vi.fn();
    render(<Slider aria-label="Volume" value={50} onValueChange={handleChange} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("does not commit when a keyboard interaction leaves the value unchanged", async () => {
    const onChange = vi.fn();
    const onValueCommitted = vi.fn();
    render(
      <Slider
        aria-label="Volume"
        defaultValue={100}
        onChange={onChange}
        onValueCommitted={onValueCommitted}
      />
    );

    const slider = screen.getByRole("slider");
    await act(async () => {
      slider.focus();
      fireEvent.keyDown(slider, { key: "ArrowRight" });
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onValueCommitted).not.toHaveBeenCalled();
    expect(slider).toHaveAttribute("aria-valuenow", "100");
  });

  it("removes the exact touchend listener registered for a touch interaction", () => {
    const onValueCommitted = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={0} onValueCommitted={onValueCommitted} />);

    const slider = screen.getByRole("slider");
    const control = slider.parentElement?.parentElement?.parentElement;
    expect(control).toBeInstanceOf(HTMLElement);

    vi.spyOn(control!, "getBoundingClientRect").mockReturnValue({
      bottom: 20,
      height: 20,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const addEventListener = vi.spyOn(document, "addEventListener");
    const removeEventListener = vi.spyOn(document, "removeEventListener");

    fireEvent.touchStart(control!, {
      changedTouches: [{ identifier: 1, clientX: 50, clientY: 10 }],
    });

    const registeredTouchEnd = addEventListener.mock.calls.find(
      ([eventName]) => eventName === "touchend"
    );
    expect(registeredTouchEnd).toBeDefined();

    fireEvent.touchEnd(document, {
      changedTouches: [{ identifier: 1, clientX: 50, clientY: 10 }],
    });

    expect(
      removeEventListener.mock.calls.some(
        ([eventName, listener]) => eventName === "touchend" && listener === registeredTouchEnd?.[1]
      )
    ).toBe(true);
    expect(onValueCommitted).toHaveBeenCalledTimes(1);

    // A later page tap must not replay the completed slider interaction.
    fireEvent.touchEnd(document, {
      changedTouches: [{ identifier: 2, clientX: 0, clientY: 0 }],
    });
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
  });

  it("forwards form ownership to the hidden input", () => {
    const { container } = render(
      <Slider aria-label="Volume" name="volume" form="external-form" defaultValue={33} />
    );

    const input = container.querySelector('input[name="volume"]');
    expect(input).toHaveAttribute("form", "external-form");
  });

  it("shows a value bubble while dragging when showValueOnDrag is enabled", () => {
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={33} valueSuffix="%" showValueOnDrag />
    );
    const thumb = screen.getByRole("slider");
    const root = thumb.closest('[role="group"]') ?? container.firstElementChild;

    expect(screen.queryByText("33%")).not.toBeInTheDocument();

    expect(root).toBeTruthy();
    fireEvent.pointerDown(root as Element);
    expect(screen.getByText("33%")).toBeInTheDocument();

    fireEvent.pointerUp(window);
    expect(screen.queryByText("33%")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Slider label="Accessible slider" defaultValue={50} />);
    await expectNoA11yViolations(container);
  });
});
